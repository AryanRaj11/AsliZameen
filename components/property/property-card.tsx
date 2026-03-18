'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Property, LAND_TYPE_LABELS } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { Heart, MapPin, Ruler } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
  className?: string
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const { user, toggleFavorite, isFavorite } = useAuth()
  const favorite = isFavorite(property.id)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user) {
      toggleFavorite(property.id)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const typeColors = {
    agricultural: 'bg-green-100 text-green-800',
    residential: 'bg-blue-100 text-blue-800',
    commercial: 'bg-amber-100 text-amber-800',
  }

  return (
    <Link href={`/listings/${property.id}`}>
      <Card className={cn('group overflow-hidden transition-all hover:shadow-lg', className)}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.images && property.images[0] ? property.images[0] : "/placeholder-house.jpg"}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Status Badge */}
          {property.status === 'sold' && (
            <Badge className="absolute left-3 top-3 bg-destructive">Sold</Badge>
          )}
          
          {/* Type Badge */}
          <Badge 
            className={cn('absolute right-3 top-3', typeColors[property.landType])}
            variant="secondary"
          >
            {LAND_TYPE_LABELS[property.landType]}
          </Badge>

          {/* Favorite Button */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute right-3 bottom-3 h-9 w-9 rounded-full bg-white/90 hover:bg-white',
                favorite && 'text-red-500'
              )}
              onClick={handleFavoriteClick}
            >
              <Heart className={cn('h-5 w-5', favorite && 'fill-current')} />
              <span className="sr-only">
                {favorite ? 'Remove from favorites' : 'Add to favorites'}
              </span>
            </Button>
          )}

          {/* Price Overlay */}
          <div className="absolute bottom-3 left-3">
            <p className="text-xl font-bold text-white drop-shadow-md">
              {formatPrice(property.price)}
            </p>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary">
            {property.title}
          </h3>
          
          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">
              {property.location.city}, {property.location.state}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <Ruler className="h-4 w-4 shrink-0" />
            <span>
              {property.size} {property.sizeUnit}
            </span>
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {property.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
