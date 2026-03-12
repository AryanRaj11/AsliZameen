import { Property } from '@/lib/types'
import { PropertyCard } from './property-card'

interface PropertyGridProps {
  properties: Property[]
  emptyMessage?: string
}

export function PropertyGrid({ properties, emptyMessage = 'No properties found.' }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
