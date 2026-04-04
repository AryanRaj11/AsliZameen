'use server'

import { createClient } from '@/lib/supabase-server'
import crypto from 'crypto'

export async function verifyAndAddCredits(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  creditsToApply: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  // 1. Verify the signature to ensure the payment is legitimate
  const body = razorpay_order_id + "|" + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex')

console.log(`body : ${body}`)

  if (expectedSignature !== razorpay_signature) {
    throw new Error("Invalid payment signature. Potential fraud detected.")
  }
   else {console.log('signature matches.')}
  // 2. Update the user's credits in Supabase
  // Assumes you have a 'profiles' or 'users' table with a 'credits' column
  const { data, error } = await supabase
    .rpc('increment_credits', { 
      user_id: user.id, 
      amount: creditsToApply 
    })

  if (error) {
    console.error("Database Update Error:", error)
    throw new Error("Payment verified but failed to add credits. Please contact support.")
  }

  return { success: true }
}