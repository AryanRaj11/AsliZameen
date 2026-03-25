import { Suspense } from 'react'
import { Input } from '@/components/ui/input'
import { PropertyGrid } from '@/components/property/property-grid'
import { PropertyFilters } from '@/components/property/property-filters'
import { fetchAllActiveProperties } from '@/lib/data/properties'
import { Search } from 'lucide-react'

interface ListingsPageProps {
  searchParams: Promise<{
    q?: string
    type?: string
    sort?: string
    priceMin?: string
    priceMax?: string
    sizeMin?: string
    sizeMax?: string
  }>
}

async function ListingsContent({ searchParams }: ListingsPageProps) {
  const params = await searchParams
  const allProperties = await fetchAllActiveProperties()

  // Filter properties based on search params
  let filteredProperties = [...allProperties].filter(p => p.status === 'active')

  // Text search
  if (params.q) {
    const query = params.q.toLowerCase()
    filteredProperties = filteredProperties.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query) ||
      p.state.toLowerCase().includes(query)
    )
  }

  // Type filter
  if (params.type) {
    const types = params.type.split(',')
    filteredProperties = filteredProperties.filter(p => types.includes(p.landType))
  }

  // Price filter
  if (params.priceMin) {
    filteredProperties = filteredProperties.filter(p => p.price >= Number(params.priceMin))
  }
  if (params.priceMax) {
    filteredProperties = filteredProperties.filter(p => p.price <= Number(params.priceMax))
  }

  // Size filter
  if (params.sizeMin) {
    filteredProperties = filteredProperties.filter(p => p.size >= Number(params.sizeMin))
  }
  if (params.sizeMax) {
    filteredProperties = filteredProperties.filter(p => p.size <= Number(params.sizeMax))
  }

  // Sort
  switch (params.sort) {
    case 'price-asc':
      filteredProperties.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      filteredProperties.sort((a, b) => b.price - a.price)
      break
    case 'size-desc':
      filteredProperties.sort((a, b) => b.size - a.size)
      break
    case 'date-desc':
    default:
      filteredProperties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <PropertyFilters totalCount={filteredProperties.length} />
      <div className="flex-1">
        <PropertyGrid 
          properties={filteredProperties} 
          emptyMessage="No properties match your filters. Try adjusting your search criteria."
        />
      </div>
    </div>
  )
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {params.type 
            ? `${params.type.charAt(0).toUpperCase() + params.type.slice(1)} Land`
            : 'Browse All Land'
          }
        </h1>
        <p className="mt-2 text-muted-foreground">
          {params.q 
            ? `Search results for "${params.q}"`
            : 'Discover your perfect piece of land'
          }
        </p>

        {/* Search Bar */}
        <form action="/listings" method="get" className="mt-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search by location or keyword..."
              defaultValue={params.q}
              className="pl-9"
            />
          </div>
        </form>
      </div>

      <Suspense fallback={
        <div className="flex gap-8">
          <div className="hidden w-64 shrink-0 lg:block">
            <div className="h-96 animate-pulse rounded-lg bg-muted" />
          </div>
          <div className="flex-1">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        </div>
      }>
        <ListingsContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
