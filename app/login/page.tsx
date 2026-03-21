'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth-context'
import { MapPin, AlertCircle } from 'lucide-react'
import { googleSignIn } from '@/lib/data/properties'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
    setError('')

    setIsLoading(true)

    const signin = await googleSignIn();

    console.log("signin successfull");

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
            Sign in to your AsliZameen account
          </CardDescription>
          <Button onClick={handlelogin}>Log in via Google</Button>
          <h1>OR</h1>
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
                <div className="flex items-center justify-between">
                  <FieldLabel>Mobile No.</FieldLabel>
                  {/* <Link href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link> */}
                </div>
                <Input
                  type="Number"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your Mobile No."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Field>
            </FieldGroup>

            <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 rounded-lg bg-muted p-4">
            <p className="text-sm font-medium">Demo Credentials:</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Email: sarah@realestate.com<br />
              Password: password123
            </p>
          </div>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
