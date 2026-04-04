'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Sparkles, Loader2, ShieldCheck, Zap, ArrowRight } from 'lucide-react'
import Script from 'next/script'
import { createRazorpayOrder } from '@/lib/data/razorpay'
import { useAuth } from '@/lib/auth-context'
import { verifyAndAddCredits } from '@/lib/data/payment'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useAuth()

  const handlePayment = async (amount: number, credits: number, planName: string) => {
    if (!user) {
      window.location.href = '/login?redirect=/pricing'
      return
    }

    setLoading(planName)
    try {
      // 1. Call our Server Action
      const order = await createRazorpayOrder(amount, credits)

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "asliZameen",
        description: `Refill ${credits} Property Credits`,
        order_id: order.id,
        handler: async function (response: any) {
            try {
                // Call the verification action
                const result = await verifyAndAddCredits(
                  response.razorpay_order_id,
                  response.razorpay_payment_id,
                  response.razorpay_signature,
                  5 // The 5 credits you mentioned
                );
          
                if (result.success) {
                  alert("Payment successful! 5 credits added to your account.");
                  window.location.href = '/listings'; // Refresh to show new credit balance
                }
              } catch (err) {
                alert("Verification failed. Please check your dashboard.");
              }
        },
        prefill: {
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
        },
        theme: { color: "#16a34a" }, // Green brand color
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err) {
        console.error("Frontend Error:", err);
        if(err instanceof Error)
  alert(`Error: ${err?.message}`);
    //  alert("Payment failed to initialize. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl mb-4">
            Invest with <span className="text-primary">AsliZameen</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Stop wasting time on fake listings. Unlock verified land papers and direct owner contact details instantly.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 items-end">
          
          {/* STARTER PACK */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Starter</CardTitle>
              <CardDescription>Perfect for checking a specific plot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-bold">₹149</div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> 1 Property Unlock</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> View Land Papers</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> WhatsApp Owner</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full font-bold" 
                onClick={() => handlePayment(149, 1, 'Starter')}
                disabled={!!loading}
              >
                {loading === 'Starter' ? <Loader2 className="animate-spin h-4 w-4" /> : "Choose Starter"}
              </Button>
            </CardFooter>
          </Card>

          {/* MOST POPULAR: PRO PACK */}
          <Card className="relative border-2 border-primary shadow-2xl scale-110 bg-white z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-black tracking-widest flex items-center gap-1 shadow-lg">
              <Zap className="h-3 w-3 fill-current" /> BEST VALUE
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-black">Pro Investor</CardTitle>
              <CardDescription>For serious buyers comparing sites</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-black text-primary">₹599</div>
                <div className="text-sm font-bold text-slate-400 mt-2">10 Credits (₹60 / unlock)</div>
              </div>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-primary" /> Unlock 5 Properties</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-green-500" /> Full Registry & Khatiyan</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-green-500" /> Direct Owner Support</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-green-500" /> Verified Map Location</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full py-7 text-lg font-black shadow-xl" 
                onClick={() => handlePayment(599, 5, 'Pro')}
                disabled={!!loading}
              >
                {loading === 'Pro' ? <Loader2 className="animate-spin h-5 w-5" /> : "Get Pro Pack"}
              </Button>
            </CardFooter>
          </Card>

          {/* BULK PACK */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Builder</CardTitle>
              <CardDescription>For real estate professionals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-bold">₹1,999</div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> 12 Property Unlocks</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Bulk Document Export</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Priority Support</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full font-bold" 
                onClick={() => handlePayment(1999, 12, 'Builder')}
                disabled={!!loading}
              >
                {loading === 'Builder' ? <Loader2 className="animate-spin h-4 w-4" /> : "Choose Builder"}
              </Button>
            </CardFooter>
          </Card>

        </div>

        <div className="mt-20 flex flex-col items-center gap-4 text-slate-400">
          <div className="flex items-center gap-8">
            <img src="/razorpay-logo.png" alt="Razorpay" className="h-6 opacity-50 grayscale" />
            <div className="h-6 w-[1px] bg-slate-200" />
            <p className="text-sm font-medium italic">100% Secure UPI & Card Payments</p>
          </div>
        </div>
      </div>
    </div>
  )
}