import { supabase } from '@/lib/supabase-client'
import { User } from '../types'


export async function getUserById(id: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users') // Replace with your actual table name
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return undefined
  return data as User
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    // ilike handles case-insensitive matching in Postgres
    .ilike('email', email)
    .single()

  if (error || !data) return undefined
  return data as User
}