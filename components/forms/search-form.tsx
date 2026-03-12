'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Search } from 'lucide-react'

interface SearchFormProps {
  variant?: 'hero' | 'compact'
  defaultValues?: {
    query?: string
    type?: string
  }
}

export function SearchForm({ variant = 'hero', defaultValues }: SearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValues?.query || '')
  const [type, setType] = useState(defaultValues?.type || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (type) params.set('type', type)
    
    router.push(`/listings${params.toString() ? `?${params.toString()}` : ''}`)
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search location, property type..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-lg sm:flex-row sm:items-end sm:gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-card-foreground">
            Location or Keyword
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Area,City or state..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
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
        </div>

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Search Land
        </Button>
      </div>
    </form>
  )
}
