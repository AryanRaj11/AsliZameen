'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  propertyId: string
}

export function FavoriteButton({ propertyId }: FavoriteButtonProps) {
  const { user, toggleFavorite, isFavorite } = useAuth()
  const favorite = isFavorite(propertyId)

  if (!user) {
    return (
      <Button variant="outline" size="icon" asChild>
        <a href="/login">
          <Heart className="h-4 w-4" />
          <span className="sr-only">Sign in to save</span>
        </a>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => toggleFavorite(propertyId)}
      className={cn(favorite && 'text-red-500 hover:text-red-600')}
    >
      <Heart className={cn('h-4 w-4', favorite && 'fill-current')} />
      <span className="sr-only">
        {favorite ? 'Remove from favorites' : 'Add to favorites'}
      </span>
    </Button>
  )
}
