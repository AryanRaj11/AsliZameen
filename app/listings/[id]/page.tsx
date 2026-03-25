import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PropertyGallery } from '@/components/property/property-gallery'
import { PropertyGrid } from '@/components/property/property-grid'
import { ContactForm } from '@/components/forms/contact-form'
import { fetchAllActiveProperties, fetchPropertyById } from '@/lib/data/properties'
import { LAND_TYPE_LABELS } from '@/lib/types'
import { ArrowLeft, MapPin, Ruler, Calendar, Check, Share2 } from 'lucide-react'
import { FavoriteButton } from './favorite-button'
import PropertyMap  from './property_map'
interface PropertyDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params
  const property = await fetchPropertyById(id)
  const lat=property?.lat
  const lng=property?.lng
  const allProperties = await fetchAllActiveProperties()

  if (!property) {
    notFound()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const typeColors = {
    agricultural: 'bg-green-100 text-green-800',
    residential: 'bg-blue-100 text-blue-800',
    commercial: 'bg-amber-100 text-amber-800',
  }

  // Get related properties (same type, excluding current)
  const relatedProperties = allProperties
    .filter(p => p.landType === property.landType && p.id !== property.id && p.status === 'active')
    .slice(0, 3)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/listings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Gallery */}
          <PropertyGallery images={property.images} title={property.title} />

          {/* Property Info */}
          <div className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={typeColors[property.landType]} variant="secondary">
                    {LAND_TYPE_LABELS[property.landType]}
                  </Badge>
                  {property.status === 'sold' && (
                    <Badge variant="destructive">Sold</Badge>
                  )}
                </div>
                <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                  {property.title}
                </h1>
                <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {property.address}, {property.city}, {property.state} {property.zip_code}  
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(property.price)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {property.size} {property.sizeUnit}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <Ruler className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-1 text-lg font-semibold">{property.size}</p>
                <p className="text-xs text-muted-foreground">{property.sizeUnit}</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <Calendar className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-1 text-sm font-semibold">Listed</p>
                <p className="text-xs text-muted-foreground">{formatDate(property.createdAt)}</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-lg font-semibold text-primary">
                  ₹{Math.round(property.price / property.size).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">per {property.sizeUnit.slice(0, -1)}</p>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-4">
                <FavoriteButton propertyId={property.id} />
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              </div>
            </div>

            {/* Description */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {property.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <MapPin className="mr-2 h-5 w-5" />
                    <PropertyMap position={{ lat: property.lat, lng: property.lng }} />
                    </div>
                </div>
                <div className="mt-4">
                  <p className="font-medium">{property.address}</p>
                  <p className="text-muted-foreground">
                    {property.city}, {property.state} {property.zip_code}
                  </p>
                </div>
              </CardContent>
              <div className="ml-5 text-left">
    <a 
      href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
      target="_blank"
      className="text-sm text-primary font-medium hover:underline"
    >
      View on Google Maps →
    </a>
  </div>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <ContactForm property={property} />
          </div>
        </div>
      </div>

      {/* Related Properties */}
      {relatedProperties.length > 0 && (
        <section className="mt-16 border-t border-border pt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Similar Properties</h2>
            <Button variant="outline" asChild>
              <Link href={`/listings?type=${property.landType}`}>View All</Link>
            </Button>
          </div>
          <div className="mt-6">
            <PropertyGrid properties={relatedProperties} />
          </div>
        </section>
      )}
    </div>
  )
}
