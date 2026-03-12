import { User } from '@/lib/types'

export const users: User[] = [
  {
    id: 'seller1',
    name: 'John Anderson',
    email: 'john@landpro.com',
    password: 'password123',
    phone: '(555) 123-4567',
    role: 'seller',
    favorites: [],
    createdAt: '2023-06-15',
  },
  {
    id: 'seller2',
    name: 'Sarah Mitchell',
    email: 'sarah@realestate.com',
    password: 'password123',
    phone: '(555) 234-5678',
    role: 'both',
    favorites: ['1', '4'],
    createdAt: '2023-08-20',
  },
  {
    id: 'seller3',
    name: 'Michael Chen',
    email: 'michael@landbroker.com',
    password: 'password123',
    phone: '(555) 345-6789',
    role: 'seller',
    favorites: [],
    createdAt: '2023-10-10',
  },
  {
    id: 'buyer1',
    name: 'Emily Roberts',
    email: 'emily@email.com',
    password: 'password123',
    phone: '(555) 456-7890',
    role: 'buyer',
    favorites: ['2', '5', '11'],
    createdAt: '2024-01-05',
  },
  {
    id: 'buyer2',
    name: 'David Thompson',
    email: 'david@email.com',
    password: 'password123',
    role: 'buyer',
    favorites: ['3', '6', '9'],
    createdAt: '2024-02-12',
  },
]

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

export function validateUser(email: string, password: string): User | null {
  const user = getUserByEmail(email)
  if (user && user.password === password) {
    return user
  }
  return null
}
