'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/lib/types'
import { validateUser, getUserByEmail, users } from '@/lib/data/users'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, role: 'buyer' | 'seller' | 'both') => Promise<{ success: boolean; error?: string }>
  logout: () => void
  toggleFavorite: (propertyId: string) => void
  isFavorite: (propertyId: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('asli_zameen_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('asli_zameen_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const validatedUser = validateUser(email, password)
    if (validatedUser) {
      const userWithoutPassword = { ...validatedUser, password: '' }
      setUser(userWithoutPassword)
      localStorage.setItem('asli_zameen_user', JSON.stringify(userWithoutPassword))
      return { success: true }
    }
    return { success: false, error: 'Invalid email or password' }
  }

  const register = async (name: string, email: string, password: string, role: 'buyer' | 'seller' | 'both') => {
    // Check if user already exists
    if (getUserByEmail(email)) {
      return { success: false, error: 'An account with this email already exists' }
    }

    // Create new user (in real app, this would be an API call)
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      role,
      favorites: [],
      createdAt: new Date().toISOString().split('T')[0],
    }

    // Add to mock users array
    users.push(newUser)

    // Log in the new user
    const userWithoutPassword = { ...newUser, password: '' }
    setUser(userWithoutPassword)
    localStorage.setItem('asli_zameen_user', JSON.stringify(userWithoutPassword))

    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('asli_zameen_user')
  }

  const toggleFavorite = (propertyId: string) => {
    if (!user) return

    const updatedFavorites = user.favorites.includes(propertyId)
      ? user.favorites.filter(id => id !== propertyId)
      : [...user.favorites, propertyId]

    const updatedUser = { ...user, favorites: updatedFavorites }
    setUser(updatedUser)
    localStorage.setItem('asli_zameen_user', JSON.stringify(updatedUser))
  }

  const isFavorite = (propertyId: string) => {
    return user?.favorites.includes(propertyId) ?? false
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, toggleFavorite, isFavorite }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
