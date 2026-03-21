'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { fetchAllProperties } from '@/lib/data/properties'
import { PropertyCard } from '@/components/property/property-card'
import { Heart, MapPin, Plus, ArrowRight, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Property } from '@/lib/types'

export default function DashboardPage() {

  const[properties,setProperties]=useState<Property[]>();

   const { user } = useAuth()

  if (!user) return null

   const canSell = user.role === 'seller' || user.role === 'admin'

   useEffect(() => {
    
    const fetchProperties = async () => {
      try {
       await fetchAllProperties();
       setProperties(properties)
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };
    fetchProperties();

  }, [])

   console.log(user);
  const myListings = properties?.filter(p => p.seller_id === user.id) || []
  const favoriteProperties = properties?.filter(p => user.favorites.includes(p.id)) || []

  const stats = [
    // {
    //   label: 'Favorites',
    //   value: user.favorites,
    //   icon: Heart,
    //   href: '/dashboard/favorites',
    // },
    ...(canSell ? [
      {
        label: 'My Listings',
        value: myListings?.length,
        icon: MapPin,
        href: '/dashboard/my-listings',
      },
      {
        label: 'Active Listings',
        value: myListings?.filter(p => p.status === 'active').length,
        icon: Eye,
        href: '/dashboard/my-listings',
      },
    ] : []),
  ]

   return (
     <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div>
           <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
           <p className="text-muted-foreground">Here&apos;s an overview of your account</p>
         </div>
         {canSell && (
          <Button asChild>
            <Link href="/dashboard/add-listing">
              <Plus className="mr-2 h-4 w-4" />
              Add New Listing
            </Link>
          </Button>
        )}
      </div>
      

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-all hover:border-primary hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Favorites */}
      {/* {favoriteProperties.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Favorites</CardTitle>
              <CardDescription>Properties you&apos;ve saved</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/favorites">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteProperties.slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* My Listings (for sellers) */}
      {canSell && myListings.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Listings</CardTitle>
              <CardDescription>Properties you&apos;re selling</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/my-listings">
                Manage All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myListings.slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {favoriteProperties.length === 0 && myListings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No Activity Yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Start exploring properties and save your favorites, or list your own property for sale.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link href="/listings">Browse Listings</Link>
              </Button>
              {canSell && (
                <Button variant="outline" asChild>
                  <Link href="/dashboard/add-listing">Add Listing</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

}