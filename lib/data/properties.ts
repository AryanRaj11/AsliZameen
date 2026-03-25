import { Property, LandType, User } from '@/lib/types'
import { supabase } from '@/lib/supabase-client'




export async function getFeaturedProperties(count: number = 6): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .limit(count) // Limits the number of rows returned
  if (error) return []
  return data as Property[]
}

export async function getPropertiesByType(type: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('landType', type)
    .eq('status', 'active')

  if (error) return []
  return data as Property[]
}

export async function getPropertiesBySeller(sellerId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('sellerId', sellerId)

  if (error) return []
  return data as Property[]
}

export async function searchProperties(query: string): Promise<Property[]> {
  const searchTerm = `%${query}%`

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    // Uses .or() to check multiple columns at once
    .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location->city.ilike.${searchTerm},location->state.ilike.${searchTerm}`)

  if (error) return []
  return data as Property[]
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
  lat:number
  lng:number
  location:string
  land_papers:string[]
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
    address: row.address,
    city: row.city,
    state: row.state,
    zip_code: row.zip_code,
    features: row.features || [],
    images: row.images || [],
    seller_id: row.seller_id,
    createdAt: row.created_at,
    status: row.status,
    lat:row.lat,
    lng:row.lng,
    location:row.location,
    land_papers:row.land_papers
  }
}

export async function fetchAllActiveProperties(): Promise<Property[]> {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status','active')

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error('Error fetching properties from Supabase', error)
    return []
  }

  return (data as PropertyRow[]).map(mapRowToProperty)
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('properties_with_coords')
    .select('*')
    .eq('id', id)
    .eq('status','active')
    .maybeSingle()
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching property by id from Supabase', error)
    return null
  }

  if (!data) return null

  return mapRowToProperty(data as PropertyRow)
}


export async function fetchFeaturedProperties(count: number = 6): Promise<Property[]> {
  const all = await fetchAllActiveProperties()
  return all.filter(p => p.status === 'active').slice(0, count)
}


export const saveProperty = async (Property_Info: Property): Promise<Boolean> => {
  if (!supabase) {
    return false
  }
  const propertyData = Property_Info;
  console.log(Property_Info);
  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([
        {
          title: propertyData.title,
          description: propertyData.description,
          price: (propertyData.price),
          size: (propertyData.size),
          size_unit: propertyData.sizeUnit, // 'acres', 'hectares', or 'sqft'
          land_type: propertyData.landType, // 'agricultural', 'residential', or 'commercial'
          address: propertyData.address,
          city: propertyData.city,
          state: propertyData.state,
          land_papers : propertyData.land_papers,
          zip_code: propertyData.zip_code,
          features: propertyData.features || [], // Expects an array ['Water', 'Fence']
          images: propertyData.images || [],     // Expects an array of URLs/paths
          seller_id: '9be20278-a98b-402a-aad2-e5fbf0b86cc2', // Your provided UUID
          status: 'pending',
          location:`POINT(${propertyData.lng} ${propertyData.lat})`
        }
      ])
      .select();

    if (error) throw error;


    console.log('Property saved successfully:', data);
    return true;
  } catch (error) {
    console.error('Error saving property:', error?.message);
    return false;
  }
};

export const uploadImages = async (files: FileList) => {
  if (!supabase) {
    return []
  }
  const uploadedUrls = [];

  try {

    for (const file of files) {
      // Create a unique file name to avoid overwriting
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('properties_image')
        .upload(filePath, file);
      // Get the Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('properties_image')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }
    return uploadedUrls;
  }
  catch (err) {
    throw new Error("error in uploading to db");
  }
};

export const uploadLandPapers = async (files: FileList) => {
  if (!supabase) {
    return []
  }

  console.log("inside land appers")
  const uploadedUrls = [];
  try {
    for (const file of files) {
      // Create a unique file name to avoid overwriting
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('properties_papers')
        .upload(filePath, file);

        console.log(data);

      // Get the Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('properties_papers')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }
    console.log("uploadedUrls")
console.log(uploadedUrls)
    return uploadedUrls;
  }
  catch (err) {
    throw new Error("error in uploading to db");
  }
};
export async function googleSignIn(): Promise<Boolean> {
  if (!supabase) {
    return false
  }
  try {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      // options: {
      //   redirectTo: window.location.origin + '/listings',
      // },
    })

    return true
  } catch (error) {
    throw error;
  }
}

export async function registerUser(name: String,
  email: String,
  phone: Number,
  role: String): Promise<Boolean> {
  if (!supabase) {
    return false
  }

  console.log(name);
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: name,
          email: email,
          phone: phone,
          role: role,
        }
      ])
      .select();

    if (error) throw error;

    console.log('User Details saved successfully:', data);
    return true;
  } catch (error) {
    console.error('Error saving User Details:', error?.message);
    throw new Error(error);
    return false;
  }
}