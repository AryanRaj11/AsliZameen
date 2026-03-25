'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { fetchAllActiveProperties } from '@/lib/data/properties'
import { PropertyGrid } from '@/components/property/property-grid'
import { Heart } from 'lucide-react'

export default function FavoritesPage() {
  const { user } = useAuth()

  if (!user) return null

  const favoriteProperties = properties.filter(p => user.favorites.includes(p.id))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Favorites</h1>
        <p className="text-muted-foreground">Properties you&apos;ve saved for later</p>
      </div>

      {favoriteProperties.length > 0 ? (
        <PropertyGrid properties={favoriteProperties} />
      ) : (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No Favorites Yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Browse our listings and click the heart icon to save properties you&apos;re interested in.
          </p>
          <Button asChild className="mt-6">
            <Link href="/listings">Browse Listings</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
