create or replace function search_land_by_location(
  user_lat float, 
  user_lng float, 
  dist_meters float DEFAULT 20000 -- 20km default radius
)
returns setof properties
language sql
as $$
  select *
  from properties
  where st_dwithin(
    location, 
    st_point(user_lng, user_lat)::geography, 
    dist_meters
  )
  -- This sorts them so the closest land appears first
  order by location <-> st_point(user_lng, user_lat)::geography;
$$;