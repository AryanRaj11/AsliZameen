'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import AutoComplete from '../google-maps-api/auto-complete'

interface SearchFormProps {
  variant?: 'hero' | 'compact'
  defaultValues?: {
    query?: string
    type?: string
  }
  page?:string
}

export function SearchForm({ variant = 'compact', defaultValues,page }: SearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValues?.query || '')
  const [type, setType] = useState(defaultValues?.type || '')

  // Inside SearchForm.tsx
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleLocationSelect = (data: { address: string; lat: number; lng: number }) => {
    setQuery(data.address);
    setCoords({ lat: data.lat, lng: data.lng });
  };

  // ... in your handleSubmit ...
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (!params) {
      alert("please enter details")
      e.preventDefault()
    }

    if (query) params.set('q', query);
    if (type) params.set('type', type);

    // Add the hidden coordinates to the URL!
    if (coords) {
      params.set('lat', coords.lat.toString());
      params.set('lng', coords.lng.toString());
    }

    router.push(`/listings?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-lg sm:flex-row sm:items-end sm:gap-4">
        <AutoComplete onSelect={handleLocationSelect} defaultValue={query} />
       { page!='listings' && <div className="w-full sm:w-48">
          <label className="mb-1.5 block text-sm font-medium text-card-foreground">
            Land Type
          </label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="agricultural">Agricultural</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div> }

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Search Land
        </Button>
      </div>
    </form>
  )
}
