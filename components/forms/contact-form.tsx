'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { Property, User } from '@/lib/types'
import { getUserById } from '@/lib/data/users'
import { 
  Send, FileText, Mail, CheckCircle, 
  FileCheck, Lock, Sparkles, Loader2, Phone 
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

interface ContactFormProps {
  property: Property
}

export function ContactForm({ property }: ContactFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  
  const [seller, setSeller] = useState<User | null>(null)
  const [userCredits, setUserCredits] = useState<number>(0)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Fetch seller details first (needed for the avatar and name)
        const sellerRes = await getUserById(property.seller_id);
        setSeller(sellerRes ?? null);

        if (user) {
          // Ownership Check
          if (user.id === property.seller_id) {
            setIsUnlocked(true);
            if (sellerRes && !sellerRes.phone) {
               setSeller(prev => ({ ...prev, ...user } as User));
            }
            setIsLoading(false);
            return;
          }

          // Buyer Check
          if (supabase) {
            const [creditsRes, unlockRes] = await Promise.all([
              supabase.from('users').select('credits').eq('id', user.id).single(),
              supabase.from('property_unlocks').select('id').eq('property_id', property.id).eq('user_id', user.id).maybeSingle()
            ]);
            setUserCredits(creditsRes.data?.credits ?? 0);
            setIsUnlocked(!!unlockRes.data);
          }
        }
      } catch (error) {
        console.error("Status check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [user, property.id, property.seller_id]);

  const handleUnlock = async () => {
    if (!user || !supabase) return
    if (userCredits < 1) {
      router.push('/pricing')
      return
    }

    setIsUnlocking(true)
    try {
      const { data } = await supabase.rpc('unlock_property', {
        target_property_id: property.id,
        requestor_id: user.id
      })

      if (data?.success) {
        setIsUnlocked(true)
        setUserCredits(prev => prev - 1)
        router.refresh()
      } else {
        alert(data?.message || "Unlock failed")
      }
    } catch (err) {
      alert("Something went wrong.")
    } finally {
      setIsUnlocking(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {!user && (
        <Link href="/login" className="w-full block"> 
          <Button className="w-full bg-red-500 animate-pulse text-white py-6 text-md font-bold shadow-lg hover:bg-red-600 transition-colors">
            Login to View Contact & Documents
          </Button>
        </Link>
      )}
      
      <Card className={!isUnlocked && user ? "border-primary/50 bg-primary/5" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contact Seller</CardTitle>
            {user && !isUnlocked && (
              <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                <Lock className="h-3 w-3" /> LOCKED
              </div>
            )}
          </div>
          <CardDescription>
            {isUnlocked ? `Direct contact for "${property.title}"` : "Unlock to view seller details"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SELLER PROFILE: Restored original colors and padding */}
          {seller && (
            <div className="mb-6 flex items-center gap-4 rounded-lg bg-muted p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                {seller.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-medium text-slate-900 truncate">{seller.name}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {isUnlocked ? (
                      <span className="font-bold text-foreground">{seller.phone}</span>
                    ) : (
                      <span className="tracking-widest opacity-50">XXXXXX-XXXX</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {seller.email}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ACTIONS AREA */}
          {user && !isUnlocked ? (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-white p-4 border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Available Credits</span>
                  <span className="text-sm font-bold text-primary">{userCredits}</span>
                </div>
                <Button onClick={handleUnlock} disabled={isUnlocking} className="w-full py-6 text-md font-bold">
                  {isUnlocking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  {userCredits > 0 ? "Unlock Details (1 Credit)" : "Buy Credits (₹999)"}
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
                Safe & Verified Land Trading
              </p>
            </div>
          ) : isUnlocked && seller?.phone && (
            <a 
              href={`https://wa.me/${seller.phone.replace(/\s/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your property "${property.title}" on asliZameen.`)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 shadow-md">
                <Send className="mr-2 h-4 w-4" />
                Chat on WhatsApp
              </Button>
            </a>
          )}
        </CardContent>
      </Card>

      {/* LAND DOCUMENTS: Restored original styling and text */}
      <Card className={`overflow-hidden border-blue-100 shadow-sm ${!isUnlocked && user ? 'opacity-75' : ''}`}>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-blue-600" />
            Verified Land Documents
          </CardTitle>
          <CardDescription>Official government records verified by asliZameen.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {!isUnlocked ? (
            <div className="text-center py-6 border-2 border-dashed rounded-xl bg-slate-50/50">
              <Lock className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 px-4">
                Legal papers (Registry, Khatiyan, 7/12) are protected. 
                Unlock this property to view and download.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {property.land_papers && property.land_papers.length > 0 ? (
                property.land_papers.map((url, index) => (
                  <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-blue-50 hover:border-blue-200 transition-all group shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded text-blue-700"><FileCheck className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-bold">Verified Paper {index + 1}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Government Record</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600 font-bold group-hover:bg-blue-100">
                      View Document
                    </Button>
                  </a>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic text-center">No documents uploaded yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}