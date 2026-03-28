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
  -- New parameters for Pagination
  limit_val INT DEFAULT 12,
  offset_val INT DEFAULT 0
)
RETURNS SETOF properties_with_coords
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM properties_with_coords
  WHERE 
    -- 1. Location Filter
    (user_lat IS NULL OR user_lng IS NULL OR ST_DWithin(location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_meters))
    -- 2. Price Filter
    AND (min_price IS NULL OR price >= min_price)
    AND (max_price IS NULL OR price <= max_price)
    -- 3. Land Type Filter
    AND (land_types IS NULL OR land_type = ANY(land_types))
    -- 4. Size Filter
    AND (min_size IS NULL OR size >= min_size)
    -- 5. Status Filter
    AND status = 'active'
  ORDER BY 
    -- Sort by distance if location is provided, otherwise skip this sort
    (CASE WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL 
          THEN location <-> ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography 
          ELSE NULL END) ASC NULLS LAST,
    -- Always sort by newest first as a secondary/default sort
    created_at DESC
  -- Apply Pagination
  LIMIT limit_val
  OFFSET offset_val;
$$;