'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { registerUser } from '@/lib/data/properties'
import { MapPin, AlertCircle, ShoppingCart, Store, Briefcase } from 'lucide-react'
import { googleSignIn } from '@/lib/data/properties'

const roleOptions = [
  {
    value: 'buyer',
    label: 'Buyer',
    description: 'Looking to purchase land',
    icon: ShoppingCart,
  },
  {
    value: 'seller',
    label: 'Seller',
    description: 'Want to list and sell land',
    icon: Store,
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Buy and sell properties',
    icon: Briefcase,
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'buyer' as 'buyer' | 'seller' | 'admin',
    phone: +91
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    setIsLoading(true)

    const signin = await googleSignIn();

    console.log("signin successfull");

    if (signin) {
      await registerUser(formData.name,
        formData.email,
        formData.phone,
        formData.role);
      
    //   if(!registerUser){setError('User already exists');router.push('/login')}
    //   else {
    //  router.push('/listings')
    //  }
    } else {
      setError('Registration failed')
    }

    setIsLoading(false)
    
  }

  return !error ? ( 
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Join AsliZameen to buy or sell land
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <Input
                  required
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Email Address</FieldLabel>
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Mobile Number</FieldLabel>
                <Input
                  type="number"
                  required
                  autoComplete="phone-number"
                  placeholder="+91"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>I want to...</FieldLabel>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as 'buyer' | 'seller' | 'admin' })}
                  className="mt-2 grid gap-3"
                >
                  {roleOptions.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={option.value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <option.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </Field>
            </FieldGroup>

            <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  ):

  <>User already registered</> 
}
