'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { Property } from '@/lib/types'
import { getUserById } from '@/lib/data/users'
import { Send, FileText, Mail, CheckCircle, FileCheck } from 'lucide-react'
import Link from 'next/link'
import { User } from '@/lib/types'

interface ContactFormProps {
  property: Property
}

export function ContactForm({ property }: ContactFormProps) {
  const { user } = useAuth()

  const [seller, setSeller] = useState<User | null>();

  useEffect(() => {

    const sellerDetails = async () => {
      const result = await getUserById(property.seller_id)
      setSeller(result)
    }
    console.log(user);

    sellerDetails()
  }, [])



  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    message: `Hi, I'm interested in "${property.title}" listed at $${property.price.toLocaleString()}. Please contact me with more information.`,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!user) {
      e.preventDefault();
      alert("Please login to contact the seller");
    }

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Message Sent!</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The seller will be in touch with you soon.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsSubmitted(false)}
          >
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
     { !user && (
  <Link href="/login" className="w-full block"> 
    <Button 
      className="w-full bg-red-400 animate-pulse text-white py-6 text-md font-bold shadow-md"
    >
      Login to view Details
    </Button>
  </Link>
)}
      <Card>
        <CardHeader>
          <CardTitle>Contact Seller</CardTitle>
          <CardDescription>
            Send a message to {seller?.name || 'the seller'} about this property
          </CardDescription>
        </CardHeader>
        <CardContent>
          {seller && (
            <div className="mb-6 flex items-center gap-4 rounded-lg bg-muted p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {seller.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{seller.name}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {seller.phone && user ? (
                    // Show real number if logged in
                    <span>{seller.phone}</span>
                  ) : (
                    // Show masked version if not logged in
                    <span className="text-gray-400 tracking-widest">XXXXXX-XXXX</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {seller.email}
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <a href={user && `https://wa.me/${seller?.phone}?text=${encodeURIComponent("Hello, I'm interested in your property")}`} target="_blank" rel="noopener noreferrer">

              {/* <a href="https://wa.me/{seller.phone}?text=Hello" target="_blank"> */}

              <Button type="button" className="mt-4 w-full" disabled={isSubmitting || !user}>
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send WhatsApp Message to the Seller
                  </>
                )}
              </Button>
            </a>
          </form>
        </CardContent>
      </Card>
{/* Land Documents Section */}
<Card className=" overflow-hidden border-blue-100 shadow-sm">
  <CardHeader className="bg-slate-50 border-b">
    <CardTitle className="flex items-center gap-2 text-lg">
      <FileText className="h-5 w-5 text-blue-600" />
      Verified Land Documents
    </CardTitle>
    <CardDescription>
      Official records provided by the seller and verified by our team.
    </CardDescription>
  </CardHeader>
  <CardContent className="p-6">
    {!user ? (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-4">
          Legal documents are hidden for privacy.
        </p>
        {/* Your glowing Login button from earlier goes here */}
        <Link href="/login" className="w-full block">
           {/* <Button className="w-full bg-red-400 animate-pulse text-white">
             Login to View Documents
           </Button> */}
        </Link>
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
              className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-blue-50 hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded text-blue-700">
                   <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Verified Document {index + 1}</p>
                  <p className="text-xs text-muted-foreground uppercase">PDF / IMAGE</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="group-hover:text-blue-600">
                View/Download
              </Button>
            </a>
          ))
        ) : (
          <p className="text-sm text-slate-500 italic">No documents uploaded for this property.</p>
        )}
      </div>
    )}
  </CardContent>
</Card> 
    </div>
  )
}
