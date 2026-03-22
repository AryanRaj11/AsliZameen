'use client'

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
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
import { uploadImages, saveProperty, uploadLandPapers } from '@/lib/data/properties'
import { Property, LAND_TYPE_LABELS, LandType } from '@/lib/types'
import { MapPin, Upload, X, CheckCircle, XCircle } from 'lucide-react'

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

// Type helper for Google Address Components
interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

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
      componentRestrictions: { country: 'in' } // Restricted to India
    };
    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;
    placeAutocomplete.addListener('place_changed', () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
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

// --- Main Page Component ---
export default function AddListingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const geocodingLib = useMapsLibrary('geocoding'); // For reverse geocoding

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [previews, setPreviews] = useState<string[]>([]);
  const [landPapersPreviews, setlandPapersPreviews] = useState<string[]>([]);

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
    lat: 19.0760, // Default to Mumbai
    lng: 72.8777,
  })

  const fileInputRef = useRef(null);
  const landPapersInputRef = useRef(null);
  const MAX_FILES = 10;

  // Helper: Extract Address from Google Components
  const updateFormAddress = useCallback((
    components: any[] | undefined,
    lat: number,
    lng: number,
    formattedAddress?: string
  ) => {
    let city = '';
    let state = '';
    let zipCode = '';

    components?.forEach((c) => {
      const comp = c as GoogleAddressComponent;
      if (comp.types.includes('locality')) city = comp.long_name;
      if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
      if (comp.types.includes('postal_code')) zipCode = comp.long_name;
    });

    setFormData(prev => ({
      ...prev,
      address: formattedAddress || prev.address,
      city: city || prev.city,
      state: state || prev.state,
      zipCode: zipCode || prev.zipCode,
      lat,
      lng
    }));
  }, []);

  // Handler: When user selects from Search bar
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    updateFormAddress(place.address_components, lat, lng, place.formatted_address);
  };

  // Create a memoized geocoder instance that updates when the lib loads
  const geocoder = useMemo(() =>
    geocodingLib ? new geocodingLib.Geocoder() : null,
    [geocodingLib]);

  //

  const handleMarkerDragEnd = (e: any) => {
    // 1. Get coordinates from the event
    const latLng = e.detail?.latLng || e.latLng;
    if (!latLng) return;

    const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;

    console.log(`Pin dropped at: ${lat}, ${lng}`);

    // 2. Critical Check: Is the geocoder ready?
    if (!geocoder) {
      console.warn("Geocoder not loaded yet. Please wait a moment.");
      return;
    }

    // 3. Perform Reverse Geocoding
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const result = results[0];

        // 4. Update your address fields
        setFormData(prev => ({
          ...prev,
          address: result.formatted_address,
          lat,
          lng
        }));

        // Call your existing helper to extract City/State/Zip
        updateFormAddress(
          result.address_components,
          lat,
          lng,
          result.formatted_address
        );
      } else {
        console.error("Geocoding failed:", status);
      }
    });
  };


  // UI Handlers (Images, Features, etc.)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      const availableSlots = MAX_FILES - previews.length;
      if (availableSlots <= 0) return alert(`Max ${MAX_FILES} images.`);
      const allowedFiles = selectedFiles.slice(0, availableSlots);
      setPreviews(prev => [...prev, ...allowedFiles.map(file => URL.createObjectURL(file))]);
    }
  };

  const handlelandPapersChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      const availableSlots = MAX_FILES - landPapersPreviews.length;
      if (availableSlots <= 0) return alert(`Max ${MAX_FILES} images.`);
      const allowedFiles = selectedFiles.slice(0, availableSlots);
      setlandPapersPreviews(prev => [...prev, ...allowedFiles.map(file => URL.createObjectURL(file))]);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const files = (fileInputRef.current as any)?.files;
    const landPapers = (landPapersInputRef.current as any)?.files;
    if (!files || files.length === 0) {
      setIsSubmitting(false);
      return alert("Please select at least one image");
    }

    try {
      const imageUrls = await uploadImages(files);
      const landPapersUrls = await uploadLandPapers(landPapers);
      const newProperty: Property = {
        id: `property_${Date.now()}`,
        ...formData,
        price: Number(formData.price),
        size: Number(formData.size),
        landType: formData.landType as LandType,
        zip_code: formData.zipCode,
        images: imageUrls,
        land_papers : landPapersUrls,
        seller_id: user?.id || '',
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active',
        location: `POINT(${formData.lng} ${formData.lat})` // PostGIS format
      };
      
      if(imageUrls && landPapersUrls){
      await saveProperty(newProperty);
      setIsSubmitted(true);
      }
    } catch (err) {
      alert("Error saving property.Please try after sometime.");
      throw new Error("Error saving property");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auth Check
  const canSell = user?.role === 'seller' || user?.role === 'both';
  if (!user || !canSell) return <div className="p-10 text-center">Seller Account Required</div>;

  if (isSubmitted) {
    return (
      <Card className="text-center py-12">
        <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" />
        <h3 className="text-xl font-bold">Listing Created!</h3>
        <Button className="mt-6" onClick={() => router.push('/dashboard/my-listings')}>View Listings</Button>
      </Card>
    );
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Add New Listing</h1>
          <p className="text-muted-foreground">Detailed property information</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column: Property Data */}
            <div className="space-y-2">
              <Card>
                <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
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
                <CardHeader>
                  <CardTitle>Price & Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Price (INR)</FieldLabel>
                      <Input
                        type="number"
                        required
                        min="0"
                        placeholder="₹"
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
                          step="1"
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
                {/* <CardHeader><CardTitle>Pricing & Size</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Field><FieldLabel>Price (INR)</FieldLabel><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></Field>
                  <Field><FieldLabel>Size</FieldLabel><Input type="number" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} /></Field>
                </CardContent> */}
              </Card>

              <Card>
                <CardHeader><CardTitle>Features</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {COMMON_FEATURES.map(f => (
                    <div key={f} className="flex items-center space-x-2">
                      <Checkbox id={f} checked={formData.features.includes(f)} onCheckedChange={() => handleFeatureToggle(f)} />
                      <Label htmlFor={f} className="text-sm">{f}</Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* <Card>
                <CardHeader><CardTitle>Images</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {previews.map((p, i) => <img key={i} src={p} className="w-20 h-20 object-cover rounded" />)}
                    <Button type="button" variant="outline" onClick={() => (fileInputRef.current as any).click()}><Upload className="mr-2 h-4 w-4" /> Add Photos</Button>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Land Papers</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {previews.map((p, i) => <img key={i} src={p} className="w-20 h-20 object-cover rounded" />)}
                    <Button type="button" variant="outline" onClick={() => (fileInputRef.current as any).click()}><Upload className="mr-2 h-4 w-4" /> Add Files</Button>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                </CardContent>
              </Card> */}
            </div>

            {/* Right Column: Map & Address */}
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Exact Location</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  <Field><FieldLabel>Search Near Area</FieldLabel>
                    <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} defaultValue={formData.address} />
                  </Field>

                  <div className="h-[350px] w-full rounded-md border overflow-hidden">
                    <Map
                      center={{ lat: formData.lat, lng: formData.lng }}
                      zoom={15}
                      mapId="property_listing_map"
                      mapTypeId={'hybrid'} // Shows satellite
                      gestureHandling={'greedy'}
                    >
                      <AdvancedMarker
                        position={{ lat: formData.lat, lng: formData.lng }}
                        draggable={true}
                        onDragEnd={handleMarkerDragEnd}
                      />
                    </Map>
                  </div>

                  <Field><FieldLabel>Full Address</FieldLabel><Input required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field><FieldLabel>City</FieldLabel><Input required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} /></Field>
                    <Field><FieldLabel>State</FieldLabel><Input required value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} /></Field>
                  </div>
                  <Field><FieldLabel>Zip Code</FieldLabel><Input required value={formData.zipCode} onChange={e => setFormData({ ...formData, zipCode: e.target.value })} /></Field>
                </CardContent>
              </Card>

              {/* <Card>
                <CardHeader><CardTitle>Features</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {COMMON_FEATURES.map(f => (
                    <div key={f} className="flex items-center space-x-2">
                      <Checkbox id={f} checked={formData.features.includes(f)} onCheckedChange={() => handleFeatureToggle(f)} />
                      <Label htmlFor={f} className="text-sm">{f}</Label>
                    </div>
                  ))}
                </CardContent>
              </Card> */}
            </div>

            <Card>
              <CardHeader><CardTitle>Images</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {previews.map((p, i) => <img key={i} src={p} className="w-20 h-20 object-cover rounded" />)}
                  <Button type="button" variant="outline" onClick={() => (fileInputRef.current as any).click()}><Upload className="mr-2 h-4 w-4" /> Add Photos</Button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                {previews.length > 0 && (
                  <button onClick={() => setPreviews([])} style={{ marginTop: '10px', color: 'red' }}>
                    Clear All
                  </button>)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Land Papers</CardTitle>
                {/* CardDescription uses a smaller, muted font and handles the gap automatically */}
                <CardDescription className="text-foreground">
                  Please upload Laggan Receipt and Mutation papers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                {landPapersPreviews.map((p, i) => <img key={i} src={p} className="w-20 h-20 object-cover rounded" />)}
                  <Button type="button" variant="outline" onClick={() => (landPapersInputRef.current as any).click()}>
                    <Upload className="mr-2 h-4 w-4" /> Add Files
                  </Button>
                </div>
                <input type="file" ref={landPapersInputRef} className="hidden" multiple onChange={handlelandPapersChange} />
                {landPapersPreviews.length > 0 && (
                  <button onClick={() => setlandPapersPreviews([])} style={{ marginTop: '10px', color: 'red' }}>
                    Clear All
                  </button>)}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? "Publishing..." : "Publish Listing"}</Button>
          </div>
        </form>
      </div>
    </APIProvider>
  )
}
