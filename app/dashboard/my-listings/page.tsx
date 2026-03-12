'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'
import { properties } from '@/lib/data/properties'
import { LAND_TYPE_LABELS } from '@/lib/types'
import { Plus, MoreVertical, Edit, Eye, Trash2, MapPin } from 'lucide-react'

export default function MyListingsPage() {
  const { user } = useAuth()

  if (!user) return null

  const canSell = user.role === 'seller' || user.role === 'both'

  if (!canSell) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-16 text-center">
        <MapPin className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Seller Account Required</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          You need a seller account to list properties. Update your account type to start selling.
        </p>
      </div>
    )
  }

  const myListings = properties.filter(p => p.sellerId === user.id)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/add-listing">
            <Plus className="mr-2 h-4 w-4" />
            Add New Listing
          </Link>
        </Button>
      </div>

      {myListings.length > 0 ? (
        <div className="space-y-4">
          {myListings.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-4 p-0 sm:flex-row">
                {/* Image */}
                <div className="relative aspect-video w-full shrink-0 sm:aspect-[4/3] sm:w-48">
                  <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="192px"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between p-4 sm:py-4 sm:pl-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={statusColors[property.status]} variant="secondary">
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </Badge>
                      <Badge variant="outline">
                        {LAND_TYPE_LABELS[property.landType]}
                      </Badge>
                    </div>
                    <h3 className="mt-2 font-semibold">
                      <Link href={`/listings/${property.id}`} className="hover:text-primary">
                        {property.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {property.location.city}, {property.location.state}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="font-semibold text-primary">
                        {formatPrice(property.price)}
                      </span>
                      <span className="text-muted-foreground">
                        {property.size} {property.sizeUnit}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/listings/${property.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/edit/${property.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Listing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No Listings Yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Start by adding your first property listing to reach potential buyers.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/add-listing">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Listing
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
