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
import { uploadImages, saveProperty } from '@/lib/data/properties'
import { Property, LAND_TYPE_LABELS, LandType } from '@/lib/types'
import { MapPin, Upload, X, CheckCircle } from 'lucide-react'

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

  // Handler: When user drags the Map Pin
  const handleMarkerDragEnd = async (e: any) => {
    console.log('inside')
    console.log(e);
   // if (!e.latLng || !geocodingLib) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    console.log(`${lat} lat ${lng} long`);
    const geocoder = new geocodingLib.Geocoder();
    console.log(lat + 'lat    ' + lng + "long")
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        console.log(results[0]);
        updateFormAddress(
          results[0].address_components, 
          lat, 
          lng, 
          results[0].formatted_address
        );
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
    if (!files || files.length === 0) {
      setIsSubmitting(false);
      return alert("Please select at least one image");
    }

    try {
      const imageUrls = await uploadImages(files);
      const newProperty: Property = {
        id: `property_${Date.now()}`,
        ...formData,
        price: Number(formData.price),
        size: Number(formData.size),
        landType: formData.landType as LandType,
        zip_code: formData.zipCode,
        images: imageUrls,
        seller_id: user?.id || '',
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active',
        location: `POINT(${formData.lng} ${formData.lat})` // PostGIS format
      };

      await saveProperty(newProperty);
      setIsSubmitted(true);
    } catch (err) {
      alert("Error saving property");
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
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Field><FieldLabel>Title</FieldLabel><Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></Field>
                  <Field><FieldLabel>Description</FieldLabel><Textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></Field>
                  <Field><FieldLabel>Land Type</FieldLabel>
                    <Select value={formData.landType} onValueChange={v => setFormData({...formData, landType: v as LandType})}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>{(Object.keys(LAND_TYPE_LABELS) as LandType[]).map(t => <SelectItem key={t} value={t}>{LAND_TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Pricing & Size</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Field><FieldLabel>Price (INR)</FieldLabel><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></Field>
                  <Field><FieldLabel>Size</FieldLabel><Input type="number" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} /></Field>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader><CardTitle>Images</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {previews.map((p, i) => <img key={i} src={p} className="w-20 h-20 object-cover rounded" />)}
                    <Button type="button" variant="outline" onClick={() => (fileInputRef.current as any).click()}><Upload className="mr-2 h-4 w-4" /> Add Photos</Button>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Map & Address */}
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Exact Location</CardTitle></CardHeader>
                <CardContent className="space-y-4">
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

                  <Field><FieldLabel>Full Address</FieldLabel><Input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field><FieldLabel>City</FieldLabel><Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></Field>
                    <Field><FieldLabel>State</FieldLabel><Input required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} /></Field>
                  </div>
                  <Field><FieldLabel>Zip Code</FieldLabel><Input required value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} /></Field>
                </CardContent>
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
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? "Publishing..." : "Publish Listing"}</Button>
          </div>
        </form>
      </div>
    </APIProvider>
  )
}

// 'use client'

// import { useRef, useState, useEffect, useCallback } from 'react'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select'
// import { Checkbox } from '@/components/ui/checkbox'
// import { Label } from '@/components/ui/label'
// import { useAuth } from '@/lib/auth-context'
// import { uploadImages, saveProperty } from '@/lib/data/properties'
// import { Property, LAND_TYPE_LABELS, LandType } from '@/lib/types'
// import { MapPin, Upload, X, CheckCircle } from 'lucide-react'
// import { 
//   APIProvider, 
//   Map, 
//   AdvancedMarker, 
//   useMapsLibrary 
// } from '@vis.gl/react-google-maps'

// const COMMON_FEATURES = [
//   'Road Access', 'Utilities Available', 'Water Rights', 'Fenced',
//   'Irrigation System', 'Well Water', 'Mountain Views', 'River/Lake Frontage',
//   'Wooded', 'Level Terrain', 'Near Schools', 'Near Amenities',
// ]

// const PlaceAutocomplete = ({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult) => void }) => {
//   const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const places = useMapsLibrary('places');

//   useEffect(() => {
//     if (!places || !inputRef.current) return;
//     const options = {
//       fields: ['geometry', 'formatted_address', 'address_components'],
//       componentRestrictions: { country: 'in' }
//     };
//     setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
//   }, [places]);

//   useEffect(() => {
//     if (!placeAutocomplete) return;
//     placeAutocomplete.addListener('place_changed', () => {
//       onPlaceSelect(placeAutocomplete.getPlace());
//     });
//   }, [onPlaceSelect, placeAutocomplete]);

//   return (
//     <Input
//       ref={inputRef}
//       placeholder="Search for area, landmark or society..."
//       className="mb-2"
//     />
//   );
// };

// export default function AddListingPage() {
//   const router = useRouter()
//   const { user } = useAuth()
//   const geocodingLib = useMapsLibrary('geocoding'); // Load geocoding library

//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isSubmitted, setIsSubmitted] = useState(false)
//   const [previews, setPreviews] = useState<string[]>([]);

//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     price: '',
//     size: '',
//     sizeUnit: 'acres' as 'acres' | 'hectares' | 'sqft',
//     landType: '' as LandType | '',
//     address: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     features: [] as string[],
//     lat: 19.0760,
//     lng: 72.8777,
//   })

//   const fileInputRef = useRef(null);
//   const MAX_FILES = 10;

//   interface GoogleAddressComponent {
//     long_name: string;
//     short_name: string;
//     types: string[];
//   }
//   // Reusable function to extract address components from Google Results
//   const updateAddressFromComponents = useCallback((components: google.maps.GeocoderAddressComponent[] | google.maps.places.AddressComponent[] | undefined, lat: number, lng: number, formattedAddress?: string) => {
//     let city = '';
//     let state = '';
//     let zipCode = '';

//     components?.forEach(c => {
//       if (c.types.includes('locality')) city = c.long_name;
//       if (c.types.includes('administrative_area_level_1')) state = c.long_name;
//       if (c.types.includes('postal_code')) zipCode = c.long_name;
//     });

//     setFormData(prev => ({
//       ...prev,
//       address: formattedAddress || prev.address,
//       city: city || prev.city,
//       state: state || prev.state,
//       zipCode: zipCode || prev.zipCode,
//       lat,
//       lng
//     }));
//   }, []);

//   const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
//     if (!place.geometry?.location) return;
//     const lat = place.geometry.location.lat();
//     const lng = place.geometry.location.lng();
//     updateAddressFromComponents(place.address_components, lat, lng, place.formatted_address);
//   };

//   // NEW: Reverse geocoding function when pin is dragged
//   const handleMarkerDragEnd = async (e: google.maps.MapMouseEvent) => {
//     if (!e.latLng || !geocodingLib) return;

//     const lat = e.latLng.lat();
//     const lng = e.latLng.lng();

//     const geocoder = new geocodingLib.Geocoder();
//     geocoder.geocode({ location: { lat, lng } }, (results, status) => {
//       if (status === 'OK' && results?.[0]) {
//         updateAddressFromComponents(
//           results[0].address_components, 
//           lat, 
//           lng, 
//           results[0].formatted_address
//         );
//       }
//     });
//   };

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files) {
//       const selectedFiles = Array.from(event.target.files);
//       const availableSlots = MAX_FILES - previews.length;
//       if (availableSlots <= 0) {
//         alert(`You can only upload a maximum of ${MAX_FILES} images.`);
//         return;
//       }
//       const allowedFiles = selectedFiles.slice(0, availableSlots);
//       const newUrls = allowedFiles.map((file) => URL.createObjectURL(file));
//       setPreviews((prev) => [...prev, ...newUrls]);
//     }
//   };

//   const handleClick = () => {
//     (fileInputRef.current as any)?.click();
//   };

//   const canSell = user?.role === 'seller' || user?.role === 'both'

//   if (!user || !canSell) {
//     return (
//       <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-16 text-center">
//         <MapPin className="h-12 w-12 text-muted-foreground" />
//         <h3 className="mt-4 text-lg font-semibold">Seller Account Required</h3>
//         <p className="mt-2 max-w-sm text-sm text-muted-foreground">
//           You need a seller account to list properties.
//         </p>
//       </div>
//     )
//   }

//   const handleFeatureToggle = (feature: string) => {
//     setFormData(prev => ({
//       ...prev,
//       features: prev.features.includes(feature)
//         ? prev.features.filter(f => f !== feature)
//         : [...prev.features, feature]
//     }))
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsSubmitting(true)

//     const files = (fileInputRef.current as any)?.files;
//     if (!files || files.length === 0) {
//       alert("Please select at least one image");
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const imageUrls = await uploadImages(files);

//       const newProperty: Property = {
//         id: `property_${Date.now()}`,
//         title: formData.title,
//         description: formData.description,
//         price: Number(formData.price),
//         size: Number(formData.size),
//         sizeUnit: formData.sizeUnit,
//         landType: formData.landType as LandType,
//         address: formData.address,
//         city: formData.city,
//         state: formData.state,
//         zip_code: formData.zipCode,
//         features: formData.features,
//         images: imageUrls,
//         seller_id: user.id,
//         createdAt: new Date().toISOString().split('T')[0],
//         status: 'active',
//         lat: formData.lat,
//         lng: formData.lng,
//         location: `POINT(${formData.lng} ${formData.lat})`
//       }

//       await saveProperty(newProperty);
//       setIsSubmitted(true)
//     } catch (error) {
//       console.error(error);
//       alert("Failed to save property");
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   if (isSubmitted) {
//     return (
//       <Card>
//         <CardContent className="flex flex-col items-center py-12 text-center">
//           <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
//             <CheckCircle className="h-8 w-8" />
//           </div>
//           <h3 className="mt-4 text-xl font-semibold">Listing Created!</h3>
//           <p className="mt-2 max-w-sm text-muted-foreground">
//             Your property has been listed successfully and is now visible to buyers.
//           </p>
//           <div className="mt-6 flex gap-3">
//             <Button onClick={() => router.push('/dashboard/my-listings')}>
//               View My Listings
//             </Button>
//             <Button variant="outline" onClick={() => {
//               setIsSubmitted(false)
//               setFormData({
//                 title: '',
//                 description: '',
//                 price: '',
//                 size: '',
//                 sizeUnit: 'acres',
//                 landType: '',
//                 address: '',
//                 city: '',
//                 state: '',
//                 zipCode: '',
//                 features: [],
//                 lat: 19.0760,
//                 lng: 72.8777
//               })
//               setPreviews([])
//             }}>
//               Add Another
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-2xl font-bold">Add New Listing</h1>
//           <p className="text-muted-foreground">List your property for sale</p>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="grid gap-6 lg:grid-cols-2">
//             <div className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Basic Information</CardTitle>
//                   <CardDescription>Property title and description</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <FieldGroup>
//                     <Field>
//                       <FieldLabel>Property Title</FieldLabel>
//                       <Input
//                         required
//                         placeholder="e.g., Scenic Valley Farm"
//                         value={formData.title}
//                         onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                       />
//                     </Field>
//                     <Field>
//                       <FieldLabel>Description</FieldLabel>
//                       <Textarea
//                         required
//                         rows={5}
//                         placeholder="Describe your property..."
//                         value={formData.description}
//                         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                       />
//                     </Field>
//                     <Field>
//                       <FieldLabel>Land Type</FieldLabel>
//                       <Select
//                         value={formData.landType}
//                         onValueChange={(value) => setFormData({ ...formData, landType: value as LandType })}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select land type" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {(Object.keys(LAND_TYPE_LABELS) as LandType[]).map((type) => (
//                             <SelectItem key={type} value={type}>
//                               {LAND_TYPE_LABELS[type]}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </Field>
//                   </FieldGroup>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Pricing & Size</CardTitle>
//                   <CardDescription>Set your price and land dimensions</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid gap-4 sm:grid-cols-2">
//                     <Field>
//                       <FieldLabel>Price (INR)</FieldLabel>
//                       <Input
//                         required
//                         type="number"
//                         placeholder="0.00"
//                         value={formData.price}
//                         onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                       />
//                     </Field>
//                     <div className="grid grid-cols-2 gap-2">
//                       <Field>
//                         <FieldLabel>Size</FieldLabel>
//                         <Input
//                           required
//                           type="number"
//                           placeholder="0"
//                           value={formData.size}
//                           onChange={(e) => setFormData({ ...formData, size: e.target.value })}
//                         />
//                       </Field>
//                       <Field>
//                         <FieldLabel>Unit</FieldLabel>
//                         <Select
//                           value={formData.sizeUnit}
//                           onValueChange={(value) => setFormData({ ...formData, sizeUnit: value as any })}
//                         >
//                           <SelectTrigger>
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="acres">Acres</SelectItem>
//                             <SelectItem value="hectares">Hectares</SelectItem>
//                             <SelectItem value="sqft">Sq Ft</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </Field>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Images</CardTitle>
//                   <CardDescription>Upload up to 10 photos</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
//                     {previews.map((url, index) => (
//                       <div key={index} className="group relative aspect-square rounded-md border bg-muted">
//                         <img src={url} alt="Preview" className="h-full w-full object-cover rounded-md" />
//                         <button
//                           type="button"
//                           onClick={() => setPreviews(prev => prev.filter((_, i) => i !== index))}
//                           className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </div>
//                     ))}
//                     {previews.length < MAX_FILES && (
//                       <button
//                         type="button"
//                         onClick={handleClick}
//                         className="flex aspect-square flex-col items-center justify-center rounded-md border border-dashed hover:bg-muted/50"
//                       >
//                         <Upload className="h-6 w-6 text-muted-foreground" />
//                         <span className="mt-1 text-xs text-muted-foreground">Upload</span>
//                       </button>
//                     )}
//                   </div>
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileChange}
//                     multiple
//                     accept="image/*"
//                     className="hidden"
//                   />
//                 </CardContent>
//               </Card>
//             </div>

//             <div className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Location</CardTitle>
//                   <CardDescription>Search and pin exact location</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <Field>
//                     <FieldLabel>Search Property</FieldLabel>
//                     <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
//                   </Field>

//                   <div className="h-[300px] w-full rounded-md border overflow-hidden">
//                     <Map
//                       center={{ lat: formData.lat, lng: formData.lng }}
//                       zoom={15}
//                       mapId="property_listing_map"
//                       mapTypeId={'hybrid'}
//                       gestureHandling={'greedy'}
//                     >
//                       <AdvancedMarker
//                         position={{ lat: formData.lat, lng: formData.lng }}
//                         draggable={true}
//                         onDragEnd={handleMarkerDragEnd} // Updated listener
//                       />
//                     </Map>
//                   </div>

//                   <Field>
//                     <FieldLabel>Full Address</FieldLabel>
//                     <Input
//                       required
//                       placeholder="Street address"
//                       value={formData.address}
//                       onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                     />
//                   </Field>

//                   <div className="grid grid-cols-2 gap-4">
//                     <Field>
//                       <FieldLabel>City</FieldLabel>
//                       <Input
//                         required
//                         value={formData.city}
//                         onChange={(e) => setFormData({ ...formData, city: e.target.value })}
//                       />
//                     </Field>
//                     <Field>
//                       <FieldLabel>State</FieldLabel>
//                       <Input
//                         required
//                         value={formData.state}
//                         onChange={(e) => setFormData({ ...formData, state: e.target.value })}
//                       />
//                     </Field>
//                   </div>
//                   <Field>
//                     <FieldLabel>Zip Code</FieldLabel>
//                     <Input
//                       required
//                       value={formData.zipCode}
//                       onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
//                     />
//                   </Field>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Features</CardTitle>
//                   <CardDescription>Select available property features</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                     {COMMON_FEATURES.map((feature) => (
//                       <div key={feature} className="flex items-center space-x-2">
//                         <Checkbox
//                           id={feature}
//                           checked={formData.features.includes(feature)}
//                           onCheckedChange={() => handleFeatureToggle(feature)}
//                         />
//                         <Label htmlFor={feature} className="text-sm font-medium leading-none cursor-pointer">
//                           {feature}
//                         </Label>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>

//           <div className="mt-6 flex justify-end">
//             <Button type="submit" disabled={isSubmitting} size="lg">
//               {isSubmitting ? 'Publishing...' : 'Publish Property'}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </APIProvider>
//   )
// }



// 'use client'

// import { useRef, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select'
// import { Checkbox } from '@/components/ui/checkbox'
// import { Label } from '@/components/ui/label'
// import { useAuth } from '@/lib/auth-context'
// import { uploadImages, saveProperty } from '@/lib/data/properties'
// import { Property, LAND_TYPE_LABELS, LandType } from '@/lib/types'
// import { MapPin, Upload, X, CheckCircle } from 'lucide-react'

// const COMMON_FEATURES = [
//   'Road Access',
//   'Utilities Available',
//   'Water Rights',
//   'Fenced',
//   'Irrigation System',
//   'Well Water',
//   'Mountain Views',
//   'River/Lake Frontage',
//   'Wooded',
//   'Level Terrain',
//   'Near Schools',
//   'Near Amenities',
// ]

// export default function AddListingPage() {
//   const router = useRouter()
//   const { user } = useAuth()

//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isSubmitted, setIsSubmitted] = useState(false)
//   const [previews, setPreviews] = useState<string[]>([]);

//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     price: '',
//     size: '',
//     sizeUnit: 'acres' as 'acres' | 'hectares' | 'sqft',
//     landType: '' as LandType | '',
//     address: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     features: [] as string[],
//   })

//   const fileInputRef = useRef(null);
//   const MAX_FILES = 10;

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

//     if (event.target.files) {
//       const selectedFiles = Array.from(event.target.files);

//       // 1. Calculate how many more files we can accept
//       const availableSlots = MAX_FILES - previews.length;

//       if (availableSlots <= 0) {
//         alert(`You can only upload a maximum of ${MAX_FILES} images.`);
//         return;
//       }

//       // 2. Only take the files that fit in the remaining slots
//       const allowedFiles = selectedFiles.slice(0, availableSlots);

//       // 3. Create URLs for the allowed files
//       const newUrls = allowedFiles.map((file) => URL.createObjectURL(file));

//       // 4. Update the state
//       setPreviews((prev) => [...prev, ...newUrls]);

//       // Optional: Warn the user if some files were ignored
//       if (selectedFiles.length > availableSlots) {
//         alert(`Only the first ${availableSlots} files were added. Max limit is ${MAX_FILES}.`);
//       }
//     }
//   };

//   const handleClick = () => {
//     // Manually trigger the hidden file input
//     (fileInputRef.current as any)?.click();
//   };

//   const canSell = user?.role === 'seller' || user?.role === 'both'

//   if (!user || !canSell) {
//     return (
//       <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-16 text-center">
//         <MapPin className="h-12 w-12 text-muted-foreground" />
//         <h3 className="mt-4 text-lg font-semibold">Seller Account Required</h3>
//         <p className="mt-2 max-w-sm text-sm text-muted-foreground">
//           You need a seller account to list properties.
//         </p>
//       </div>
//     )
//   }

//   const handleFeatureToggle = (feature: string) => {



//     setFormData(prev => ({
//       ...prev,
//       features: prev.features.includes(feature)
//         ? prev.features.filter(f => f !== feature)
//         : [...prev.features, feature]
//     }))
//   }



//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsSubmitting(true)

//     const files = fileInputRef.current?.files;

//     if (files.length === 0) {
//       alert("Please select at least one image");
//       return;
//     }

//     // 2. Upload images first to get the URLs
//     const imageUrls = await uploadImages(files);

//     // Create new property (mock - in real app, this would be an API call)
//     const newProperty: Property = {
//       id: `property_${Date.now()}`,
//       title: formData.title,
//       description: formData.description,
//       price: Number(formData.price),
//       size: Number(formData.size),
//       sizeUnit: formData.sizeUnit,
//       landType: formData.landType as LandType,
//       address: formData.address,
//       city: formData.city,
//       state: formData.state,
//       zip_code: formData.zipCode,
//       features: formData.features,
//       images: imageUrls,
//       seller_id: user.id,
//       createdAt: new Date().toISOString().split('T')[0],
//       status: 'active',
//     }

//     const save = await saveProperty(newProperty);

//     setIsSubmitting(false)
//     setIsSubmitted(true)
//   }

//   if (isSubmitted) {
//     return (
//       <Card>
//         <CardContent className="flex flex-col items-center py-12 text-center">
//           <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
//             <CheckCircle className="h-8 w-8" />
//           </div>
//           <h3 className="mt-4 text-xl font-semibold">Listing Created!</h3>
//           <p className="mt-2 max-w-sm text-muted-foreground">
//             Your property has been listed successfully and is now visible to buyers.
//           </p>
//           <div className="mt-6 flex gap-3">
//             <Button onClick={() => router.push('/dashboard/my-listings')}>
//               View My Listings
//             </Button>
//             <Button variant="outline" onClick={() => {
//               setIsSubmitted(false)
//               setFormData({
//                 title: '',
//                 description: '',
//                 price: '',
//                 size: '',
//                 sizeUnit: 'acres',
//                 landType: '',
//                 address: '',
//                 city: '',
//                 state: '',
//                 zipCode: '',
//                 features: [],
//               })
//             }}>
//               Add Another
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold">Add New Listing</h1>
//         <p className="text-muted-foreground">List your property for sale</p>
//       </div>

//       <form onSubmit={handleSubmit}>
//         <div className="grid gap-6 lg:grid-cols-2">
//           {/* Basic Info */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Basic Information</CardTitle>
//               <CardDescription>Property title and description</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <FieldGroup>
//                 <Field>
//                   <FieldLabel>Property Title</FieldLabel>
//                   <Input
//                     required
//                     placeholder="e.g., Scenic Valley Farm"
//                     value={formData.title}
//                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   />
//                 </Field>
//                 <Field>
//                   <FieldLabel>Description</FieldLabel>
//                   <Textarea
//                     required
//                     rows={5}
//                     placeholder="Describe your property, its features, and what makes it special..."
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   />
//                 </Field>
//                 <Field>
//                   <FieldLabel>Land Type</FieldLabel>
//                   <Select
//                     value={formData.landType}
//                     onValueChange={(value) => setFormData({ ...formData, landType: value as LandType })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select land type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {(Object.keys(LAND_TYPE_LABELS) as LandType[]).map((type) => (
//                         <SelectItem key={type} value={type}>
//                           {LAND_TYPE_LABELS[type]}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </Field>
//               </FieldGroup>
//             </CardContent>
//           </Card>

//           {/* Price & Size */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Price & Size</CardTitle>
//               <CardDescription>Property pricing and dimensions</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <FieldGroup>
//                 <Field>
//                   <FieldLabel>Price (INR)</FieldLabel>
//                   <Input
//                     type="number"
//                     required
//                     min="0"
//                     placeholder="₹"
//                     value={formData.price}
//                     onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                   />
//                 </Field>
//                 <div className="grid grid-cols-2 gap-4">
//                   <Field>
//                     <FieldLabel>Size</FieldLabel>
//                     <Input
//                       type="number"
//                       required
//                       min="0"
//                       step="1"
//                       placeholder="50"
//                       value={formData.size}
//                       onChange={(e) => setFormData({ ...formData, size: e.target.value })}
//                     />
//                   </Field>
//                   <Field>
//                     <FieldLabel>Unit</FieldLabel>
//                     <Select
//                       value={formData.sizeUnit}
//                       onValueChange={(value) => setFormData({ ...formData, sizeUnit: value as 'acres' | 'hectares' | 'sqft' })}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="acres">Acres</SelectItem>
//                         <SelectItem value="hectares">Hectares</SelectItem>
//                         <SelectItem value="sqft">Sq. Feet</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </Field>
//                 </div>
//               </FieldGroup>
//             </CardContent>
//           </Card>

//           {/* Location */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Location</CardTitle>
//               <CardDescription>Property address and location</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <FieldGroup>
//                 <Field>
//                   <FieldLabel>Street Address</FieldLabel>
//                   <Input
//                     required
//                     placeholder="1234 Valley Road"
//                     value={formData.address}
//                     onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                   />
//                 </Field>
//                 <div className="grid grid-cols-2 gap-4">
//                   <Field>
//                     <FieldLabel>City</FieldLabel>
//                     <Input
//                       required
//                       placeholder="Green Valley"
//                       value={formData.city}
//                       onChange={(e) => setFormData({ ...formData, city: e.target.value })}
//                     />
//                   </Field>
//                   <Field>
//                     <FieldLabel>State</FieldLabel>
//                     <Input
//                       required
//                       placeholder="California"
//                       value={formData.state}
//                       onChange={(e) => setFormData({ ...formData, state: e.target.value })}
//                     />
//                   </Field>
//                 </div>
//                 <Field>
//                   <FieldLabel>ZIP Code</FieldLabel>
//                   <Input
//                     required
//                     placeholder="95450"
//                     value={formData.zipCode}
//                     onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
//                   />
//                 </Field>
//               </FieldGroup>
//             </CardContent>
//           </Card>

//           {/* Features */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Features & Amenities</CardTitle>
//               <CardDescription>Select all that apply</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-2 gap-3">
//                 {COMMON_FEATURES.map((feature) => (
//                   <div key={feature} className="flex items-center gap-2">
//                     <Checkbox
//                       id={feature}
//                       checked={formData.features.includes(feature)}
//                       onCheckedChange={() => handleFeatureToggle(feature)}
//                     />
//                     <Label htmlFor={feature} className="text-sm font-normal">
//                       {feature}
//                     </Label>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="lg:col-span-2">
//             <CardHeader>
//               <CardTitle>Property Documents</CardTitle>
//               <CardDescription>Upload Sale Deed,Mutation Certificate,Lagaan Reciept</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex flex-col items-center rounded-lg border-2 border-dashed border-border py-12">
//                 <Upload className="h-10 w-10 text-muted-foreground" />
//                 <p className="text-xs text-muted-foreground">Click to browse</p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Images */}
//           <Card className="lg:col-span-2">
//             <CardHeader>
//               <CardTitle>Images</CardTitle>
//               <CardDescription>Upload photos of your property</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex flex-col items-center rounded-lg border-2 border-dashed border-border py-12">
//                 <Upload className="h-10 w-10 text-muted-foreground" />
//                 <p className="text-xs text-muted-foreground">Click to browse</p>
//                 <Input
//                   required
//                   type="file"
//                   multiple={true}
//                   ref={fileInputRef}
//                   onChange={handleFileChange}
//                   accept="image/*"
//                   style={{ display: 'none' }}
//                 />
//                 <Button variant="outline" className="mt-4" type="button" onClick={handleClick}>
//                   Choose Files
//                 </Button>
//                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
//                   {previews.map((url, index) => (
//                     <img
//                       key={index}
//                       src={url}
//                       alt={`Preview ${index}`}
//                       style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
//                     />
//                   ))}
//                 </div>
//                 {previews.length > 0 && (
//                   <button onClick={() => setPreviews([])} style={{ marginTop: '10px', color: 'red' }}>
//                     Clear All
//                   </button>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Submit */}
//         <div className="mt-6 flex justify-end gap-3">
//           <Button variant="outline" type="button" onClick={() => router.back()}>
//             Cancel
//           </Button>
//           <Button type="submit" disabled={isSubmitting || !formData.landType}>
//             {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
//           </Button>
//         </div>
//       </form>
//     </div>
//   )
// }
