'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { properties } from '@/lib/data/properties'
import { Property, LAND_TYPE_LABELS, LandType } from '@/lib/types'
import { MapPin, Upload, X, CheckCircle } from 'lucide-react'

const COMMON_FEATURES = [
  'Road Access',
  'Utilities Available',
  'Water Rights',
  'Fenced',
  'Irrigation System',
  'Well Water',
  'Mountain Views',
  'River/Lake Frontage',
  'Wooded',
  'Level Terrain',
  'Near Schools',
  'Near Amenities',
]

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop',
]

export default function AddListingPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    size: '',
    sizeUnit: 'acres' as 'acres' | 'hectares' | 'sqft',
    landType: '' as LandType | '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    features: [] as string[],
  })

  const canSell = user?.role === 'seller' || user?.role === 'both'

  if (!user || !canSell) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-16 text-center">
        <MapPin className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Seller Account Required</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          You need a seller account to list properties.
        </p>
      </div>
    )
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Create new property (mock - in real app, this would be an API call)
    const newProperty: Property = {
      id: `property_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      size: Number(formData.size),
      sizeUnit: formData.sizeUnit,
      landType: formData.landType as LandType,
      location: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      },
      features: formData.features,
      images: PLACEHOLDER_IMAGES,
      sellerId: user.id,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    }

    // Add to mock data
    properties.unshift(newProperty)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">Listing Created!</h3>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Your property has been listed successfully and is now visible to buyers.
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => router.push('/dashboard/my-listings')}>
              View My Listings
            </Button>
            <Button variant="outline" onClick={() => {
              setIsSubmitted(false)
              setFormData({
                title: '',
                description: '',
                price: '',
                size: '',
                sizeUnit: 'acres',
                landType: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                features: [],
              })
            }}>
              Add Another
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add New Listing</h1>
        <p className="text-muted-foreground">List your property for sale</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Property title and description</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Property Title</FieldLabel>
                  <Input
                    required
                    placeholder="e.g., Scenic Valley Farm"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    required
                    rows={5}
                    placeholder="Describe your property, its features, and what makes it special..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Land Type</FieldLabel>
                  <Select 
                    value={formData.landType} 
                    onValueChange={(value) => setFormData({ ...formData, landType: value as LandType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select land type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(LAND_TYPE_LABELS) as LandType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {LAND_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Price & Size */}
          <Card>
            <CardHeader>
              <CardTitle>Price & Size</CardTitle>
              <CardDescription>Property pricing and dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Price ($)</FieldLabel>
                  <Input
                    type="number"
                    required
                    min="0"
                    placeholder="450000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Size</FieldLabel>
                    <Input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      placeholder="50"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Unit</FieldLabel>
                    <Select 
                      value={formData.sizeUnit} 
                      onValueChange={(value) => setFormData({ ...formData, sizeUnit: value as 'acres' | 'hectares' | 'sqft' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acres">Acres</SelectItem>
                        <SelectItem value="hectares">Hectares</SelectItem>
                        <SelectItem value="sqft">Sq. Feet</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Property address and location</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Street Address</FieldLabel>
                  <Input
                    required
                    placeholder="1234 Valley Road"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>City</FieldLabel>
                    <Input
                      required
                      placeholder="Green Valley"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>State</FieldLabel>
                    <Input
                      required
                      placeholder="California"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>ZIP Code</FieldLabel>
                  <Input
                    required
                    placeholder="95450"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features & Amenities</CardTitle>
              <CardDescription>Select all that apply</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {COMMON_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Checkbox
                      id={feature}
                      checked={formData.features.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <Label htmlFor={feature} className="text-sm font-normal">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Upload photos of your property (demo uses placeholder images)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center rounded-lg border-2 border-dashed border-border py-12">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">Drag and drop images here</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
                <Button variant="outline" className="mt-4" type="button">
                  Choose Files
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Demo note: Placeholder images will be used
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !formData.landType}>
            {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
          </Button>
        </div>
      </form>
    </div>
  )
}
