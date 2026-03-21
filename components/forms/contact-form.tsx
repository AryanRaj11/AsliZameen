'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { useAuth } from '@/lib/auth-context'
import { Property } from '@/lib/types'
import { getUserById } from '@/lib/data/users'
import { Send, Phone, Mail, CheckCircle } from 'lucide-react'
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

      <Card>
        <CardHeader>
          <CardTitle>Land Papers</CardTitle>
          <CardDescription>
            Send a message to {seller?.name || 'the seller'} about this property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4 rounded-lg bg-muted p-4">
            Lagaan Reciept
            {/* <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          
            </div> */}
          </div>
        </CardContent>
      </Card>
      </div>
  )
}
