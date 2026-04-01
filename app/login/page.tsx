'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth-context'
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react'
import { googleSignIn } from '@/lib/data/properties' // Ensure checkUserExists is exported
import { getUserByEmail } from '@/lib/data/users'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // New States for the "Gatekeeper" flow
  const [isRegistered, setIsRegistered] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // Debounced Email Verification
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.email && formData.email.includes('@')) {
        setIsVerifying(true)
        const exists = await getUserByEmail(formData.email)
        setIsRegistered(!!exists)
        setIsVerifying(false)
        if (!exists && formData.email.length > 5) {
          setError('Email not found. Please register first.')
        } else {
          setError('')
        }
      }
    }, 600) // 600ms debounce

    return () => clearTimeout(timer)
  }, [formData.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(formData.email, formData.phone)
    
    if (result) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
    
    setIsLoading(false)
  }

  const handlelogin = async(e:React.FormEvent)=>{
    e.preventDefault()
    if (!isRegistered) return; // Final guard

    setError('')
    setIsLoading(true)
    const signin = await googleSignIn();
    
    if (signin) {
      router.push('/dashboard')
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Enter your email to unlock login options
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )} 
          
          <div className="space-y-6">
            <Field>
              <FieldLabel>Email Address</FieldLabel>
              <div className="relative">
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={isRegistered ? "border-green-500 pr-10" : ""}
                />
                {isRegistered && (
                  <CheckCircle2 className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
                )}
              </div>
            </Field>

            <div className="space-y-3">
              <Button 
                onClick={handlelogin} 
                className="w-full" 
                variant={isRegistered ? "default" : "outline"}
                disabled={!isRegistered || isLoading || isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Log in via Google'}
              </Button>
              
              {!isRegistered && formData.email.length > 5 && !isVerifying && (
                <p className="text-center text-xs text-muted-foreground">
                  New to AsliZameen? <Link href="/register" className="text-primary font-bold underline">Create an account</Link>
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or use phone</span></div>
            </div>

            <form onSubmit={handleSubmit}>
              <Field>
                <FieldLabel>Mobile No.</FieldLabel>
                <Input
                  type="tel" // 'tel' is better for mobile keyboards than 'Number'
                  required
                  placeholder="Enter your Mobile No."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isRegistered}
                />
              </Field>

              <Button type="submit" className="mt-6 w-full" disabled={isLoading || !isRegistered}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </div>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}