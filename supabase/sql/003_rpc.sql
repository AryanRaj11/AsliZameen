CREATE OR REPLACE FUNCTION get_nearby_properties(
  user_lat FLOAT, 
  user_lng FLOAT, 
  radius_meters FLOAT DEFAULT 20000
)
RETURNS SETOF properties_with_coords -- Returns the view format with lat/lng included
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM properties_with_coords
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY location <-> ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;
$$;

CREATE OR REPLACE FUNCTION filter_properties(
  user_lat FLOAT DEFAULT NULL, 
  user_lng FLOAT DEFAULT NULL, 
  radius_meters FLOAT DEFAULT 20000,
  min_price NUMERIC DEFAULT NULL,
  max_price NUMERIC DEFAULT NULL,
  land_types TEXT[] DEFAULT NULL,
  min_size NUMERIC DEFAULT NULL,
  limit_val INT DEFAULT 12,
  offset_val INT DEFAULT 0
)
-- Change 1: Define a custom return table structure
RETURNS TABLE (
  property_data properties_with_coords,
  total_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    p, -- The whole row from the view/table
    COUNT(*) OVER() -- The magic line: counts all rows matching WHERE (ignoring LIMIT/OFFSET)
  FROM properties_with_coords p
  WHERE 
    (user_lat IS NULL OR user_lng IS NULL OR ST_DWithin(location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_meters))
    AND (min_price IS NULL OR price >= min_price)
    AND (max_price IS NULL OR price <= max_price)
    AND (land_types IS NULL OR land_type = ANY(land_types))
    AND (min_size IS NULL OR size >= min_size)
    AND status = 'active'
  ORDER BY 
    (CASE WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL 
          THEN location <-> ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography 
          ELSE NULL END) ASC NULLS LAST,
    created_at DESC
  LIMIT limit_val
  OFFSET offset_val;
$$;