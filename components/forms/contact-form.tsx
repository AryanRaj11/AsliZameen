'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { Property, User } from '@/lib/types'
import { getUserById } from '@/lib/data/users'
import { 
  Send, FileText, Mail, CheckCircle, 
  FileCheck, Lock, Sparkles, Loader2, Phone, ShieldCheck 
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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Fetch all necessary status data
  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        if(!supabase)return
        // 1. Fetch Seller, User Credits, and Unlock Status in parallel
        const [sellerRes, creditsRes, unlockRes] = await Promise.all([
          getUserById(property.seller_id),
          supabase.from('users').select('credits').eq('id', user.id).single(),
          supabase.from('property_unlocks').select('id').eq('property_id', property.id).eq('user_id', user.id).single()
        ])

        setSeller(sellerRes)
        setUserCredits(creditsRes.data?.credits ?? 0)
        setIsUnlocked(!!unlockRes.data)
      } catch (error) {
        console.error("Error fetching contact status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()
  }, [user, property.id, property.seller_id, supabase])

  // Function to handle the credit deduction and unlocking
  const handleUnlock = async () => {
    if (!user) return
    if (userCredits < 1) {
      router.push('/pricing') // Redirect to buy more credits
      return
    }

    setIsUnlocking(true)
    try {
      const { data, error } = await supabase.rpc('unlock_property', {
        target_property_id: property.id,
        requestor_id: user.id
      })

      if (data?.success) {
        setIsUnlocked(true)
        setUserCredits(prev => prev - 1)
        router.refresh() // Refresh page to update any server-side components
      } else {
        alert(data?.message || "Unlock failed")
      }
    } catch (err) {
      alert("Something went wrong. Please try again.")
    } finally {
      setIsUnlocking(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Message Sent!</h3>
          <p className="mt-2 text-sm text-muted-foreground">The seller will be in touch with you soon.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsSubmitted(false)}>
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. LOGIN PROMPT */}
      {!user && (
        <Link href="/login" className="w-full block"> 
          <Button className="w-full bg-red-500 animate-pulse text-white py-6 text-md font-bold shadow-lg hover:bg-red-600 transition-colors">
            Login to View Contact & Documents
          </Button>
        </Link>
      )}
      
      {/* 2. CONTACT CARD (Unlocked vs Locked) */}
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
        <CardContent>
          {user && !isUnlocked ? (
            /* UNLOCK UI */
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-white p-4 border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Available Credits</span>
                  <span className="text-sm font-bold text-primary">{userCredits}</span>
                </div>
                <Button 
                  onClick={handleUnlock} 
                  disabled={isUnlocking}
                  className="w-full py-6 text-md font-bold"
                >
                  {isUnlocking ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-5 w-5" />
                  )}
                  {userCredits > 0 ? "Unlock Details (1 Credit)" : "Buy Credits (₹999)"}
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                Safe & Verified Land Trading
              </p>
            </div>
          ) : (
            /* UNLOCKED OR PUBLIC VIEW */
            <>
              {seller && (
                <div className="mb-6 flex items-center gap-4 rounded-lg bg-muted p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {seller.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{seller.name}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 font-bold text-foreground">
                          <Phone className="h-3 w-3" /> {seller.phone}
                        </span>
                      ) : (
                        <span className="tracking-widest opacity-50">XXXXXX-XXXX</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {isUnlocked ? seller.email : "Email Hidden"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isUnlocked && (
                <a 
                  href={`https://wa.me/${seller?.phone?.replace(/\s/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your property "${property.title}" on asliZameen.`)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6">
                    <Send className="mr-2 h-4 w-4" />
                    Chat on WhatsApp
                  </Button>
                </a>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 3. LAND DOCUMENTS SECTION */}
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
                  <a 
                    key={index}
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-blue-50 hover:border-blue-200 transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded text-blue-700">
                        <FileCheck className="h-5 w-5" />
                      </div>
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