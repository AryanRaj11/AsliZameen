export interface Property {
  id: string
  title: string
  description: string
  price: number
  size: number
  sizeUnit: 'acres' | 'hectares' | 'sqft'
  landType: 'agricultural' | 'residential' | 'commercial'
    address: string
    city: string
    state: string
    zip_code: string
  features: string[]
  images: string[]
  seller_id: string
  createdAt: string
  status: 'active' | 'pending' | 'sold'
  lat:number
  lng:number
  location:string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'buyer' | 'seller' | 'admin'
  favorites?: string[]
  createdAt: string
}

export interface FilterOptions {
  landType: string[]
  priceRange: [number, number]
  sizeRange: [number, number]
  location: string
  sortBy: 'price-asc' | 'price-desc' | 'date-desc' | 'size-asc' | 'size-desc'
}

export type LandType = 'agricultural' | 'residential' | 'commercial'

export const LAND_TYPE_LABELS: Record<LandType, string> = {
  agricultural: 'Agricultural',
  residential: 'Residential',
  commercial: 'Commercial',
}

export const LAND_TYPE_DESCRIPTIONS: Record<LandType, string> = {
  agricultural: 'Farms, ranches, and crop land',
  residential: 'Land for building homes',
  commercial: 'Business and industrial plots',
}
