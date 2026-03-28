import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SearchForm } from '@/components/forms/search-form'
import { PropertyGrid } from '@/components/property/property-grid'
import { fetchFeaturedProperties } from '@/lib/data/properties'
import { LAND_TYPE_LABELS, LAND_TYPE_DESCRIPTIONS, LandType } from '@/lib/types'
import { ArrowRight, Tractor, Home, Building2, Search, FileText, Handshake } from 'lucide-react'

const landTypeIcons = {
  agricultural: Tractor,
  residential: Home,
  commercial: Building2,
}

const howItWorks = [
  {
    icon: Search,
    title: 'Search & Discover',
    description: 'Browse our extensive listings of agricultural, residential, and commercial land across the country.',
  },
  {
    icon: FileText,
    title: 'Get Details',
    description: 'View comprehensive property information, photos, features, and directly contact sellers.',
  },
  {
    icon: Handshake,
    title: 'Make It Yours',
    description: 'Connect with sellers, negotiate terms, and close the deal on your perfect piece of land.',
  },
]

export default async function HomePage() {
  const featuredProperties = await fetchFeaturedProperties(8)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/30 py-16 sm:py-24 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Find Your Perfect
              <span className="block text-primary">Piece of Land</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Discover thousands of agricultural, residential, and commercial properties. 
              Whether you&apos;re buying or selling, AsliZameen makes it simple.
            </p>
          </div>

          {/* Search Form */}
          <div className="mx-auto mt-10 max-w-3xl">
            <SearchForm variant="hero" />
          </div>

          {/* Quick Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center sm:gap-12">
            <div>
              <p className="text-3xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Active Listings</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-3xl font-bold text-foreground">12K+</p>
              <p className="text-sm text-muted-foreground">Acres Listed</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-3xl font-bold text-foreground">1.2K+</p>
              <p className="text-sm text-muted-foreground">Happy Buyers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Land Type Categories */}
      <section className="border-y border-border bg-card py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Browse by Land Type
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find the perfect property for your needs
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {(Object.keys(LAND_TYPE_LABELS) as LandType[]).map((type) => {
              const Icon = landTypeIcons[type]
              return (
                <Link key={type} href={`/listings?type=${type}`}>
                  <Card className="group h-full transition-all hover:border-primary hover:shadow-md">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-foreground">
                        {LAND_TYPE_LABELS[type]}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {LAND_TYPE_DESCRIPTIONS[type]}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Featured Properties
              </h2>
              <p className="mt-1 text-muted-foreground">
                Hand-picked listings from across the country
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/listings">
                View All Listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10">
            <PropertyGrid properties={featuredProperties} gridColumns={4}/>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              How AsliZameen Works
            </h2>
            <p className="mt-2 text-muted-foreground">
              Finding and buying land has never been easier
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {howItWorks.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {index < howItWorks.length - 1 && (
                  <div className="absolute left-1/2 top-7 hidden h-0.5 w-full bg-border sm:block" />
                )}
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=600&fit=crop"
            alt="Beautiful farmland"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/80" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center text-primary-foreground">
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              Ready to Sell Your Land?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/90">
              List your property with AsliZameen and reach thousands of qualified buyers. 
              Our platform makes selling land simple and effective.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard">
                  Start Selling Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
