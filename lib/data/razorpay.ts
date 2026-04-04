// 

'use server'

import { createClient } from '@/lib/supabase-server'
import Razorpay from 'razorpay'
import { cookies } from 'next/headers'

export async function createRazorpayOrder(amount: number, credits: number) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  console.log("Cookies present:", cookieStore.getAll().map(c => c.name))
  
  // SECURE: Use getUser() instead of getSession() 
  // This is slower but 100% accurate for Next.js 16 Server Actions
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    console.error("Server Action Auth Error:", error?.message)
    throw new Error('Authentication expired. Please refresh the page and log in.')
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${user.id.slice(0, 8)}`,
      notes: { userId: user.id, credits: credits.toString() }
    })

    return { id: order.id, amount: order.amount, currency: order.currency }
  } catch (err) {
    throw new Error('Razorpay order failed.')
  }
}