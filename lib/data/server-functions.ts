'use server'

import { supabase } from '@/lib/supabase-client'
import { mapRowToProperty,PropertyRow } from './properties'
import { Property } from '../types'

export interface filterParams {
    q?: string
    type?: string
    sort?: string
    priceMin?: string
    priceMax?: string
    sizeMin?: string
    sizeMax?: string
    lat?:Number
    lng?:Number
    landTypes?:string[]
}

  export const filterProperties = async (
    params: filterParams & { limit?: number; offset?: number }
  ): Promise<{ mappedProperties: Property[]; totalCount: number } | null> => {
    
    if (!supabase) {
      return { mappedProperties: [], totalCount: 0 };
    }
  
    const landTypes = params.type ? params.type.split(',') : null;
  
    const { data, error } = await supabase.rpc('filter_properties', {
      user_lat: params.lat ? Number(params.lat) : null,
      user_lng: params.lng ? Number(params.lng) : null,
      radius_meters: 200000, 
      min_price: params.priceMin ? Number(params.priceMin) : null,
      max_price: params.priceMax ? Number(params.priceMax) : null,
      land_types: landTypes,
      min_size: params.sizeMin ? Number(params.sizeMin) : null,
      limit_val: params.limit || 12, 
      offset_val: params.offset || 0
    });
  
    if (error) {
      console.error('Error fetching filtered properties from Supabase:', error);
      return null;
    }
  
    if (!data || data.length === 0) {
      return { mappedProperties: [], totalCount: 0 };
    }
  
    // 1. Extract the total count from the first row's total_count column
    const totalCount = Number(data[0].total_count) || 0;
  
    // 2. Correct the mapping logic
    const mappedProperties = data.map((item: any) => {
        // item is { property_data: {...}, total_count: 123 }
        // We only want to map the 'property_data' part
        if (item.property_data) {
          return mapRowToProperty(item.property_data as PropertyRow);
        }
        
        // Fallback: If your SQL didn't nest it (depends on the exact PG driver behavior)
        return mapRowToProperty(item as PropertyRow);
      });
  
    return { mappedProperties, totalCount };
  };