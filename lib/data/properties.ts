import { Property, LandType } from '@/lib/types'
import { supabase } from '@/lib/supabase-client'

export const properties: Property[] = [
  {
    id: '1',
    title: 'Scenic Dehradun Orchard',
    description: 'Beautiful 20-acre agricultural land in the Doon Valley with fertile soil, perfect for orchards or organic farming. Features a natural stream, tube well irrigation, and panoramic Himalayan foothill views.',
    price: 45000000,
    size: 20,
    sizeUnit: 'acres', // keep acres as unit for now
    landType: 'agricultural',
    location: {
      address: 'Village Bidholi, Mussoorie Road',
      city: 'Dehradun',
      state: 'Uttarakhand',
      zipCode: '248007',
    },
    features: ['Natural Stream', 'Irrigation System', 'Mountain Views', 'Fertile Soil', 'Road Access', 'Fenced'],
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller1',
    createdAt: '2024-01-15',
    status: 'active',
  },
  {
    id: '2',
    title: 'Hilltop Residential Plot near Pune',
    description: 'Premium 2-acre residential NA plot in an exclusive gated community near Pune. Perfect for building your villa with stunning sunset views. All amenities and utilities available at the site.',
    price: 18500000,
    size: 2,
    sizeUnit: 'acres',
    landType: 'residential',
    location: {
      address: 'Survey No. 45, Mulshi Road',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '412108',
    },
    features: ['Gated Community', 'Utilities Available', 'Paved Road', 'Sunset Views', 'Near Schools', 'Low HOA'],
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller2',
    createdAt: '2024-02-20',
    status: 'active',
  },
  {
    id: '3',
    title: 'Prime Commercial Corner on NH-48',
    description: 'Strategic 5-acre commercial land at a major highway intersection on NH-48. High traffic count with excellent visibility. Ideal for retail, warehousing, fuel station or mixed-use development.',
    price: 125000000,
    size: 5,
    sizeUnit: 'acres',
    landType: 'commercial',
    location: {
      address: 'Near Bilaspur Chowk, NH-48',
      city: 'Gurugram',
      state: 'Haryana',
      zipCode: '122413',
    },
    features: ['Corner Lot', 'High Visibility', 'Traffic Signal', 'All Utilities', 'Level Terrain', 'Growth Area'],
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller1',
    createdAt: '2024-03-01',
    status: 'active',
  },
  {
    id: '4',
    title: 'Riverfront Agricultural Estate on Ganga Canal',
    description: '120-acre working farm with canal frontage near Haridwar. Includes cowshed, equipment shed, and canal irrigation. Currently producing sugarcane and wheat with excellent water availability.',
    price: 98000000,
    size: 120,
    sizeUnit: 'acres',
    landType: 'agricultural',
    location: {
      address: 'Roorkee–Haridwar Road, Ganga Canal',
      city: 'Haridwar',
      state: 'Uttarakhand',
      zipCode: '249401',
    },
    features: ['River Frontage', 'Water Rights', 'Barn', 'Equipment Shed', 'Producing Farm', 'Well Water'],
    images: [
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller3',
    createdAt: '2024-01-28',
    status: 'active',
  },
  {
    id: '5',
    title: 'Lakeside Residential Acres near Lonavala',
    description: 'Stunning 5-acre lakeside property with private waterfront near Lonavala. Build your estate home with boating and weekend getaways at your doorstep. Green surroundings with a clear building zone.',
    price: 42500000,
    size: 5,
    sizeUnit: 'acres',
    landType: 'residential',
    location: {
      address: 'Pawna Lake Road',
      city: 'Lonavala',
      state: 'Maharashtra',
      zipCode: '410406',
    },
    features: ['Lake Frontage', 'Private Dock Rights', 'Wooded', 'Cleared Building Site', 'Wildlife', 'Quiet Location'],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller2',
    createdAt: '2024-02-10',
    status: 'active',
  },
  {
    id: '6',
    title: 'Highway Frontage Commercial on Delhi–Jaipur Highway',
    description: '15-acre commercial parcel with wide highway frontage on the Delhi–Jaipur Highway. Perfect for logistics park, showroom, or industrial use. Easy access from national highway with high visibility.',
    price: 87500000,
    size: 15,
    sizeUnit: 'acres',
    landType: 'commercial',
    location: {
      address: 'Near Manoharpur Toll Plaza, NH-48',
      city: 'Shahpura',
      state: 'Rajasthan',
      zipCode: '303103',
    },
    features: ['Highway Frontage', 'Interstate Access', 'Level Land', 'Utilities Available', 'Truck Accessible', 'High Traffic'],
    images: [
      'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller3',
    createdAt: '2024-03-05',
    status: 'active',
  },
  {
    id: '7',
    title: 'Mountain View Coffee Estate',
    description: '200-acre coffee and spice estate with stunning Western Ghats backdrop. Includes estate bungalow, workers quarters, and processing shed. Perennial stream and established shade trees.',
    price: 165000000,
    size: 200,
    sizeUnit: 'acres',
    landType: 'agricultural',
    location: {
      address: 'Chikmagalur–Mudigere Road',
      city: 'Chikkamagaluru',
      state: 'Karnataka',
      zipCode: '577101',
    },
    features: ['Ranch House', 'Outbuildings', 'Corrals', 'Year-Round Creek', 'Mountain Views', 'Established Pastures'],
    images: [
      'https://images.unsplash.com/photo-1500595046743-cd271d694e30?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller1',
    createdAt: '2024-02-25',
    status: 'active',
  },
  {
    id: '8',
    title: 'Suburban Development Land near Hyderabad',
    description: '10-acre parcel approved for villa plots near ORR, Hyderabad. All layout approvals in place with internal roads planned. Fast-growing corridor with strong residential demand.',
    price: 52500000,
    size: 10,
    sizeUnit: 'acres',
    landType: 'residential',
    location: {
      address: 'Kandukur Road, near ORR Exit',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '501359',
    },
    features: ['Subdivision Approved', 'Engineering Complete', 'Growth Area', 'Near Amenities', 'School District', 'City Utilities'],
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller2',
    createdAt: '2024-03-10',
    status: 'active',
  },
  {
    id: '9',
    title: 'Industrial Park Plot near Chennai',
    description: '3-acre industrial plot in an established SIPCOT-style park. All utilities in place including 3-phase power. Wide internal roads suitable for container movement. Immediate possession.',
    price: 39500000,
    size: 3,
    sizeUnit: 'acres',
    landType: 'commercial',
    location: {
      address: 'Sriperumbudur Industrial Belt',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '602105',
    },
    features: ['Business Park', '3-Phase Power', 'Truck Access', 'Rail Available', 'Immediate Availability', 'Security'],
    images: [
      'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller3',
    createdAt: '2024-02-18',
    status: 'active',
  },
  {
    id: '10',
    title: 'Apple Orchard Property in Himachal',
    description: '25-acre established apple orchard with pack house and cold storage. Includes basic equipment, existing buyers, and roadside fruit stall. Profitable operation ready for a new owner.',
    price: 72500000,
    size: 25,
    sizeUnit: 'acres',
    landType: 'agricultural',
    location: {
      address: 'Theog–Rohru Road',
      city: 'Shimla',
      state: 'Himachal Pradesh',
      zipCode: '171201',
    },
    features: ['Established Orchard', 'Cold Storage', 'Equipment Included', 'Farm Stand', 'Customer Base', 'Profitable'],
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1474564862106-1f23d10b9d72?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller1',
    createdAt: '2024-01-20',
    status: 'active',
  },
  {
    id: '11',
    title: 'Desert Retreat Plot near Jaisalmer',
    description: '1-acre residential plot in an exclusive desert resort community near Jaisalmer. Sand dune views and desert landscaping. Clear night skies perfect for stargazing.',
    price: 14500000,
    size: 1,
    sizeUnit: 'acres',
    landType: 'residential',
    location: {
      address: 'Sam Sand Dunes Road',
      city: 'Jaisalmer',
      state: 'Rajasthan',
      zipCode: '345001',
    },
    features: ['Dark Sky Preserve', 'Desert Views', 'Gated', 'Underground Utilities', 'Near Hiking', 'Architectural Review'],
    images: [
      'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller2',
    createdAt: '2024-03-08',
    status: 'active',
  },
  {
    id: '12',
    title: 'Vineyard Ready Land near Nashik',
    description: '40-acre property with ideal conditions for vineyards near Nashik. Gentle south-facing slopes, well-draining red soil, and borewell water. Soil tests confirm excellent grape-growing potential.',
    price: 59000000,
    size: 40,
    sizeUnit: 'acres',
    landType: 'agricultural',
    location: {
      address: 'Trimbak Road Wine Belt',
      city: 'Nashik',
      state: 'Maharashtra',
      zipCode: '422212',
    },
    features: ['South-Facing Slopes', 'Well-Draining Soil', 'Water Rights', 'Soil Tests Available', 'Wine Country', 'Road Access'],
    images: [
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop',
    ],
    sellerId: 'seller3',
    createdAt: '2024-02-05',
    status: 'active',
  },
]

export function getPropertyById(id: string): Property | undefined {
  return properties.find(p => p.id === id)
}

export function getFeaturedProperties(count: number = 6): Property[] {
  return properties.filter(p => p.status === 'active').slice(0, count)
}

export function getPropertiesByType(type: string): Property[] {
  return properties.filter(p => p.landType === type && p.status === 'active')
}

export function getPropertiesBySeller(sellerId: string): Property[] {
  return properties.filter(p => p.sellerId === sellerId)
}

export function searchProperties(query: string): Property[] {
  const lowerQuery = query.toLowerCase()
  return properties.filter(p => 
    p.title.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.location.city.toLowerCase().includes(lowerQuery) ||
    p.location.state.toLowerCase().includes(lowerQuery)
  )
}

type PropertyRow = {
  id: string
  title: string
  description: string
  price: number
  size: number
  size_unit: 'acres' | 'hectares' | 'sqft'
  land_type: LandType
  address: string
  city: string
  state: string
  zip_code: string
  features: string[]
  images: string[]
  seller_id: string
  created_at: string
  status: 'active' | 'pending' | 'sold'
}

function mapRowToProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    size: row.size,
    sizeUnit: row.size_unit,
    landType: row.land_type,
    location: {
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
    },
    features: row.features || [],
    images: row.images || [],
    sellerId: row.seller_id,
    createdAt: row.created_at,
    status: row.status,
  }
}

export async function fetchAllProperties(): Promise<Property[]> {
  if (!supabase) {
    return properties
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error('Error fetching properties from Supabase', error)
    return properties
  }

  return (data as PropertyRow[]).map(mapRowToProperty)
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  if (!supabase) {
    return getPropertyById(id) ?? null
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching property by id from Supabase', error)
    return getPropertyById(id) ?? null
  }

  if (!data) return null

  return mapRowToProperty(data as PropertyRow)
}

export async function fetchFeaturedProperties(count: number = 6): Promise<Property[]> {
  const all = await fetchAllProperties()
  return all.filter(p => p.status === 'active').slice(0, count)
}

