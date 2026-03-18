'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter, usePathname } from 'next/navigation'

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // --- NEW: Extra state from your old code ---
 const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      handleUserChange(session?.user ?? null)
      
      // if (session && (pathname === '/' || pathname === '/login')) {
      //   router.push('/dashboard')
      // }
      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleUserChange(session?.user ?? null)
      
      if (event === 'SIGNED_IN') router.push('/listings')
      if (event === 'SIGNED_OUT') router.push('/')
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [router, pathname])

  // Helper to sync Supabase User with your App Logic
  const handleUserChange = async(supabaseUser: any) => {
    setUser(supabaseUser)
    if (supabaseUser) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', supabaseUser.email)
          .single()
        
        if (data) setUser(data)
          console.log(data);
        // If error, it might be because the trigger hasn't finished yet or table is missing
      } catch (e) {
        console.error("Profile fetch failed:", e)
      }
      // If you store favorites 
      // in metadata or a separate table, load them here
      //setFavorites(supabaseUser.user_metadata?.favorites || [])
    } else {
     // setFavorites([])
    }
  }

  // --- ADDED: Re-implementing your old functions using Supabase ---
  
  const logout = async () => {
    await supabase.auth.signOut()
  }

  const toggleFavorite = async (propertyId: string) => {
    if (!user) return
    const isFav = favorites.includes(propertyId)
    const updated = isFav 
      ? favorites.filter(id => id !== propertyId) 
      : [...favorites, propertyId]
    
    setFavorites(updated)
    
    // Optional: Save back to Supabase metadata
    await supabase.auth.updateUser({
      data: { favorites: updated }
    })
  }

  const isFavorite = (propertyId: string) => favorites.includes(propertyId)

  // Extract common values for easy use: user.email, user.user_metadata.full_name, etc.
  const value = {
    user,
    loading,
    logout,
    favorites,
    toggleFavorite,
    isFavorite,
    // Add roles if you have them in metadata
    role: user?.user_metadata?.role || 'buyer' 
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}


// 'use client'

// import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
// import { User } from '@/lib/types'
// import { validateUser, getUserByEmail, users } from '@/lib/data/users'

// interface AuthContextType {
//   user: User | null
//   isLoading: boolean
//   login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
//   register: (name: string, email: string, role: 'buyer' | 'seller' | 'both') => Promise<{ success: boolean; error?: string }>
//   logout: () => void
//   toggleFavorite: (propertyId: string) => void
//   isFavorite: (propertyId: string) => boolean
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     // Check for stored user on mount
//     const storedUser = localStorage.getItem('asli_zameen_user')
//     if (storedUser) {
//       try {
//         setUser(JSON.parse(storedUser))
//       } catch {
//         localStorage.removeItem('asli_zameen_user')
//       }
//     }
//     setIsLoading(false)
//   }, [])

//   const login = async (email: string, password: string) => {
//     const validatedUser = validateUser(email, password)
//     if (validatedUser) {
//       const userWithoutPassword = { ...validatedUser, password: '' }
//       setUser(userWithoutPassword)
//       localStorage.setItem('asli_zameen_user', JSON.stringify(userWithoutPassword))
//       return { success: true }
//     }
//     return { success: false, error: 'Invalid email or password' }
//   }

//   const register = async (name: string, email: string, password: string, role: 'buyer' | 'seller' | 'both') => {
//     // Check if user already exists
//     if (getUserByEmail(email)) {
//       return { success: false, error: 'An account with this email already exists' }
//     }

//     // Create new user (in real app, this would be an API call)
//     const newUser: User = {
//       id: `user_${Date.now()}`,
//       name,
//       email,
//       password,
//       role,
//       favorites: [],
//       createdAt: new Date().toISOString().split('T')[0],
//     }

//     // Add to mock users array
//     users.push(newUser)

//     // Log in the new user
//     const userWithoutPassword = { ...newUser, password: '' }
//     setUser(userWithoutPassword)
//     localStorage.setItem('asli_zameen_user', JSON.stringify(userWithoutPassword))

//     return { success: true }
//   }

//   const logout = () => {
//     setUser(null)
//     localStorage.removeItem('asli_zameen_user')
//   }

//   const toggleFavorite = (propertyId: string) => {
//     if (!user) return

//     const updatedFavorites = user.favorites.includes(propertyId)
//       ? user.favorites.filter(id => id !== propertyId)
//       : [...user.favorites, propertyId]

//     const updatedUser = { ...user, favorites: updatedFavorites }
//     setUser(updatedUser)
//     localStorage.setItem('asli_zameen_user', JSON.stringify(updatedUser))
//   }

//   const isFavorite = (propertyId: string) => {
//     return user?.favorites.includes(propertyId) ?? false
//   }

//   return (
//     <AuthContext.Provider value={{ user, isLoading, login, logout, toggleFavorite, isFavorite }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider')
//   }
//   return context
// }
