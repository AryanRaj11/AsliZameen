'use client'

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import { uploadImages, uploadLandPapers, fetchPropertyById, updateProperty } from '@/lib/data/properties'
import { Property, LAND_TYPE_LABELS, LandType } from '@/lib/types'
import { MapPin, Upload, X, CheckCircle, Loader2, FileText } from 'lucide-react'

// --- Google Maps Imports ---
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMapsLibrary
} from '@vis.gl/react-google-maps'

const COMMON_FEATURES = [
  'Road Access', 'Utilities Available', 'Water Rights', 'Fenced',
  'Irrigation System', 'Well Water', 'Mountain Views', 'River/Lake Frontage',
  'Wooded', 'Level Terrain', 'Near Schools', 'Near Amenities',
]

// --- Autocomplete Input Component ---
const PlaceAutocomplete = ({ onPlaceSelect, defaultValue }: {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void,
  defaultValue: string
}) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const options = {
      fields: ['geometry', 'formatted_address', 'address_components'],
      componentRestrictions: { country: 'in' }
    };
    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;
    const listener = placeAutocomplete.addListener('place_changed', () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
    return () => google.maps.event.removeListener(listener);
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <Input
      ref={inputRef}
      defaultValue={defaultValue}
      placeholder="Search for area, landmark or society..."
      className="mb-2"
    />
  );
};

export default function EditListingPage() {
  const router = useRouter()
  const { id } = useParams()
  const { user } = useAuth()
  const geocodingLib = useMapsLibrary('geocoding')

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Data States
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [existingPapers, setExistingPapers] = useState<string[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [newPaperPreviews, setNewPaperPreviews] = useState<string[]>([])

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
    lat: 19.0760,
    lng: 72.8777,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const landPapersInputRef = useRef<HTMLInputElement>(null)

  // 1. Load Initial Data
  useEffect(() => {
    async function loadData() {
      if (!id || !user) return
      const data = await fetchPropertyById(id as string)
      
      if (!data || data.seller_id !== user.id) {
        router.push('/dashboard/my-listings')
        return
      }

      setFormData({
        title: data.title,
        description: data.description,
        price: data.price.toString(),
        size: data.size.toString(),
        sizeUnit: data.sizeUnit || 'acres',
        landType: data.landType,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zip_code || '',
        features: data.features || [],
        lat: Number(data.lat),
        lng: Number(data.lng),
      })
      setExistingImages(data.images || [])
      setExistingPapers(data.land_papers || [])
      setIsLoading(false)
    }
    loadData()
  }, [id, user, router])

  const geocoder = useMemo(() => geocodingLib ? new geocodingLib.Geocoder() : null, [geocodingLib])

  // 2. Map Handlers
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    
    setFormData(prev => ({
      ...prev,
      address: place.formatted_address || prev.address,
      lat,
      lng
    }));
  };

  const handleMarkerDragEnd = (e: any) => {
    const latLng = e.detail?.latLng || e.latLng;
    if (!latLng || !geocoder) return;
    const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        setFormData(prev => ({
          ...prev,
          address: results[0].formatted_address,
          lat,
          lng
        }));
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Ensure a land type is selected before proceeding
    if (!formData.landType) {
      alert("Please select a Land Type");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      let finalImages = [...existingImages];
      let finalPapers = [...existingPapers];
  
      if (fileInputRef.current?.files?.length) {
        const newImgUrls = await uploadImages(fileInputRef.current.files);
        finalImages = [...finalImages, ...newImgUrls];
      }
      if (landPapersInputRef.current?.files?.length) {
        const newPaperUrls = await uploadLandPapers(landPapersInputRef.current.files);
        finalPapers = [...finalPapers, ...newPaperUrls];
      }
  
      // Create the update object with strict typing
      const updatedProperty = {
        title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      size: Number(formData.size),
      size_unit: formData.sizeUnit, // Corrected to DB column name
      land_type: formData.landType, // Corrected to DB column name
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zipCode,
      features: formData.features || [],
      images: finalImages,
      land_papers: finalPapers,
      seller_id: user?.id, // Dynamic from auth context
      status: "pending", // Reset to pending for re-verification upon edit
      location: `POINT(${formData.lng} ${formData.lat})`, // PostGIS format
      // Also update the numeric lat/lng if you have those columns
      };
  
      await updateProperty(id as string, updatedProperty);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Error updating property.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

  if (isSubmitted) {
    return (
      <Card className="text-center py-12 max-w-lg mx-auto mt-10">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-xl font-bold">Listing updated successfully!</h3>
        <Button className="mt-6" onClick={() => router.push('/dashboard/my-listings')}>Back to My Listings</Button>
      </Card>
    );
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        <div className="flex justify-between items-center px-4">
          <div>
            <h1 className="text-2xl font-bold">Edit Property</h1>
            <p className="text-muted-foreground text-sm">Update your listing information</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2 px-4">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Basic Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field><FieldLabel>Title</FieldLabel><Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></Field>
                <Field><FieldLabel>Description</FieldLabel><Textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></Field>
                <Field><FieldLabel>Land Type</FieldLabel>
                  <Select value={formData.landType} onValueChange={v => setFormData({ ...formData, landType: v as LandType })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{(Object.keys(LAND_TYPE_LABELS) as LandType[]).map(t => <SelectItem key={t} value={t}>{LAND_TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Price & Area</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Field><FieldLabel>Price (INR)</FieldLabel><Input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field><FieldLabel>Size</FieldLabel><Input type="number" required value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} /></Field>
                  <Field><FieldLabel>Unit</FieldLabel>
                    <Select value={formData.sizeUnit} onValueChange={v => setFormData({ ...formData, sizeUnit: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="acres">Acres</SelectItem><SelectItem value="hectares">Hectares</SelectItem><SelectItem value="sqft">Sqft</SelectItem></SelectContent>
                    </Select>
                  </Field>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Property Images</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {existingImages.map((url, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={url} className="w-full h-full object-cover rounded border" alt="Existing" />
                      <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Add Photos</Button>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => {
                  if (e.target.files) setNewImagePreviews(Array.from(e.target.files).map(f => URL.createObjectURL(f)))
                }} />
                {newImagePreviews.length > 0 && <p className="text-xs text-green-600">{newImagePreviews.length} new photos selected</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Land Documents</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {existingPapers.map((url, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded bg-slate-50 group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="text-xs truncate">Document {i + 1}</span>
                      </div>
                      <button type="button" onClick={() => setExistingPapers(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={() => landPapersInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Add Papers</Button>
                <input type="file" ref={landPapersInputRef} className="hidden" multiple onChange={(e) => {
                   if (e.target.files) setNewPaperPreviews(Array.from(e.target.files).map(f => f.name))
                }} />
                {newPaperPreviews.length > 0 && <p className="text-xs text-blue-600">{newPaperPreviews.length} new papers ready</p>}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
          <Card>
  <CardHeader><CardTitle>Location Search</CardTitle></CardHeader>
  <CardContent className="space-y-4">
    <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} defaultValue={formData.address} />
    
    {/* Wrap in a height-defined container and check for coordinates */}
    <div className="h-[400px] w-full rounded-md border overflow-hidden bg-slate-100">
      {!isLoading && formData.lat && formData.lng ? (
        <Map 
          // Use a unique ID for the edit map
          mapId="edit_property_map_unique"
          defaultCenter={{ lat: Number(formData.lat), lng: Number(formData.lng) }} 
          center={{ lat: Number(formData.lat), lng: Number(formData.lng) }} 
          zoom={15} 
          mapTypeId={'hybrid'}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
        >
          <AdvancedMarker 
            position={{ lat: Number(formData.lat), lng: Number(formData.lng) }} 
            draggable={true} 
            onDragEnd={handleMarkerDragEnd} 
          />
        </Map>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        </div>
      )}
    </div>
    
    <Field><FieldLabel>Full Address</FieldLabel><Input required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></Field>
  </CardContent>
</Card>

            <Card>
              <CardHeader><CardTitle>Features</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {COMMON_FEATURES.map(f => (
                  <div key={f} className="flex items-center space-x-2">
                    <Checkbox 
                      id={f} 
                      checked={formData.features.includes(f)} 
                      onCheckedChange={() => {
                        setFormData(prev => ({
                          ...prev,
                          features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f]
                        }))
                      }} 
                    />
                    <Label htmlFor={f} className="text-sm cursor-pointer">{f}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={isSubmitting}>
                {isSubmitting ? "Saving Changes..." : "Update Listing"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">Note: Updates are immediate, but papers may require re-verification.</p>
            </div>
          </div>
        </form>
      </div>
    </APIProvider>
  )
}