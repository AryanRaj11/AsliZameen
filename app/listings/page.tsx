import { Suspense } from 'react'
import { PropertyFilters } from '@/components/property/property-filters'
import { filterProperties } from '@/lib/data/server-functions'
import { SearchForm } from '@/components/forms/search-form'
import  PropertyFeed  from './property-feed'

interface ListingsPageProps {
  searchParams: Promise<{
    q?: string
    type?: string
    sort?: string
    priceMin?: string
    priceMax?: string
    sizeMin?: string
    sizeMax?: string
    lat?: number
    lng?: number
  }>
}

// ListingsContent.tsx (Server Component)
async function ListingsContent({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  
  // Fetch initial data (Page 1)
  const result = await filterProperties({ 
    ...params, 
    limit: 12, 
    offset: 0 
  });

  // CRITICAL: result is now { mappedProperties, totalCount }
  // We extract them safely here
  const properties = result?.mappedProperties || [];
  const totalCount = result?.totalCount || 0;

  // Text search
  // if (params.q) {
  //   const query = params.q.toLowerCase()
  //   filteredProperties = filteredProperties.filter(p => 
  //     p.title.toLowerCase().includes(query) ||
  //     p.description.toLowerCase().includes(query) ||
  //     p.city.toLowerCase().includes(query) ||
  //     p.state.toLowerCase().includes(query)
  //   )
  // }

  // // Type filter
  // if (params.type) {
  //   const types = params.type.split(',')
  //   filteredProperties = filteredProperties.filter(p => types.includes(p.landType))
  // }

  // // Price filter
  // if (params.priceMin) {
  //   filteredProperties = filteredProperties.filter(p => p.price >= Number(params.priceMin))
  // }
  // if (params.priceMax) {
  //   filteredProperties = filteredProperties.filter(p => p.price <= Number(params.priceMax))
  // }

  // // Size filter
  // if (params.sizeMin) {
  //   filteredProperties = filteredProperties.filter(p => p.size >= Number(params.sizeMin))
  // }
  // if (params.sizeMax) {
  //   filteredProperties = filteredProperties.filter(p => p.size <= Number(params.sizeMax))
  // }
  // if(params.lat && params.lng){
  //   filteredProperties = nearbyProperties
  // }

//Sort
  switch (params.sort) {
    case 'price-asc':
      properties.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      properties.sort((a, b) => b.price - a.price)
      break
    case 'size-desc':
      properties.sort((a, b) => b.size - a.size)
      break
    case 'date-desc':
    default:
      properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <PropertyFilters totalCount={totalCount} />
      
      <PropertyFeed 
        initialProperties={properties} 
        searchParams={params} 
        totalCount={totalCount}
      />
    </div>
  );
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header - EXACTLY AS PER OLD STYLE */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {params.type 
            ? `${params.type.charAt(0).toUpperCase() + params.type.slice(1)} Land`
            : 'Browse All Land'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {params.q 
            ? `Search results for "${params.q}"`
            : 'Discover your perfect piece of land'}
        </p>

        <div className="flex w-full max-w-xl mr-auto items-center gap-4 mt-4">
          <SearchForm page='listings'></SearchForm>
        </div>
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