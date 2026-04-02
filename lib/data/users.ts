import { supabase } from '@/lib/supabase-client'
import { User } from '../types'


export async function getUserById(id: string): Promise<User | undefined> {
  if(!supabase){return}
  const { data, error } = await supabase
    .from('users') // Replace with your actual table name
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return undefined
  return data as User
}

export async function getUserByEmail(email: string): Promise<Boolean> {
  if(!supabase){
    return false;
  }
  const { data, error } = await supabase
    .from('users')
    .select('*')
    // ilike handles case-insensitive matching in Postgres
    .ilike('email', email)
    .single()

  if (error || !data) return false;
  if(data)return true;

  return false;
}

export async function getUserCredits(email: string): Promise<Number> {
  if(!supabase){
    return 0;
  }
  const { data, error } = await supabase
    .from('users')
    .select('credits')
    // ilike handles case-insensitive matching in Postgres
    .ilike('email', email)
    .single()

  if (error || !data) return 0;
  if(data)return data.credits;

  return 2;
}