'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LAND_TYPE_LABELS, LandType } from '@/lib/types'
import { SlidersHorizontal, X } from 'lucide-react'
import { useState, useCallback } from 'react'

interface PropertyFiltersProps {
  totalCount: number
}

const PRICE_OPTIONS = [
  { value: 100_000, label: '₹1L' },
  { value: 500_000, label: '₹5L' },
  { value: 1_000_000, label: '₹10L' },
  { value: 2_500_000, label: '₹25L' },
  { value: 5_000_000, label: '₹50L' },
  { value: 10_000_000, label: '₹1Cr' },
  { value: 20_000_000, label: '₹2Cr' },
  { value: 30_000_000, label: '₹3Cr' },
  { value: 50_000_000, label: '₹5Cr' },
  { value: 100_000_000, label: '₹10Cr' },
  { value: 200_000_000, label: '₹20Cr' },
  { value: 500_000_000, label: '₹50Cr' },
  { value: 1_000_000_000, label: '₹100Cr' },
]

const SIZE_RANGES = [
  { min: 0, max: 5, label: 'Under 5 acres' },
  { min: 5, max: 25, label: '5 - 25 acres' },
  { min: 25, max: 100, label: '25 - 100 acres' },
  { min: 100, max: Infinity, label: 'Over 100 acres' },
]

export function PropertyFilters({ totalCount }: PropertyFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentTypes = searchParams.get('type')?.split(',').filter(Boolean) || []
  const currentSort = searchParams.get('sort') || 'date-desc'
  const currentPriceMin = searchParams.get('priceMin') || ''
  const currentPriceMax = searchParams.get('priceMax') || ''
  const currentSizeMin = searchParams.get('sizeMin') || ''
  const currentSizeMax = searchParams.get('sizeMax') || ''

  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    router.push(`/listings?${params.toString()}`)
  }, [router, searchParams])

  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type)
    
    updateFilters({ type: newTypes.length > 0 ? newTypes.join(',') : null })
  }

  const handlePriceRangeChange = (min: number, max: number) => {
    updateFilters({
      priceMin: min > 0 ? min.toString() : null,
      priceMax: max < Infinity ? max.toString() : null,
    })
  }

  const handleSizeRangeChange = (min: number, max: number) => {
    updateFilters({
      sizeMin: min > 0 ? min.toString() : null,
      sizeMax: max < Infinity ? max.toString() : null,
    })
  }

  const clearFilters = () => {
    const query = searchParams.get('q')
    router.push(`/listings${query ? `?q=${query}` : ''}`)
  }

  const hasFilters =
    currentTypes.length > 0 || currentPriceMin || currentPriceMax || currentSizeMin || currentSizeMax

  const handleMinPriceChange = (value: string) => {
    updateFilters({
      priceMin: value === 'none' ? null : value,
    })
  }

  const handleMaxPriceChange = (value: string) => {
    updateFilters({
      priceMax: value === 'none' ? null : value,
    })
  }

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Land Type */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Land Type</h3>
        <div className="space-y-2">
          {(Object.keys(LAND_TYPE_LABELS) as LandType[]).map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={`type-${type}`}
                checked={currentTypes.includes(type)}
                onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
              />
              <Label htmlFor={`type-${type}`} className="text-sm font-normal">
                {LAND_TYPE_LABELS[type]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Price Range</h3>
        <div className="flex items-center gap-2">
          <Select
            value={currentPriceMin || 'none'}
            onValueChange={handleMinPriceChange}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Min</SelectItem>
              {PRICE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">to</span>
          <Select
            value={currentPriceMax || 'none'}
            onValueChange={handleMaxPriceChange}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Max" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Max</SelectItem>
              {PRICE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Size Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Size (Acres)</h3>
        <div className="space-y-2">
          {SIZE_RANGES.map((range) => {
            const isSelected = 
              (range.min === 0 ? !currentSizeMin : currentSizeMin === range.min.toString()) &&
              (range.max === Infinity ? !currentSizeMax : currentSizeMax === range.max.toString())
            
            return (
              <button
                key={range.label}
                onClick={() => handleSizeRangeChange(range.min, range.max)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </div>

      {hasFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Filters */}
      <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? 'property' : 'properties'} found
        </p>
        <div className="flex items-center gap-2">
          <Select value={currentSort} onValueChange={(value) => updateFilters({ sort: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="size-desc">Size: Large to Small</SelectItem>
            </SelectContent>
          </Select>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filters</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Filters</h2>
            <p className="text-sm text-muted-foreground">{totalCount} results</p>
          </div>
          
          {/* Sort */}
          <div className="mb-6">
            <Label className="mb-2 block text-sm font-semibold">Sort By</Label>
            <Select value={currentSort} onValueChange={(value) => updateFilters({ sort: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="size-desc">Size: Large to Small</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FiltersContent />
        </div>
      </aside>
    </>
  )
}
