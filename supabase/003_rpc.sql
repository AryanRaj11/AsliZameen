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