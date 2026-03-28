-- 1. Enable the extension for UUID generation (required for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    email       text        NOT NULL UNIQUE,
    phone       text,
    role        text        NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
    favorites   uuid[]      NOT NULL DEFAULT '{}', -- Use uuid[] to reference property IDs
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text        NOT NULL,
    description text        NOT NULL,
    price       numeric     NOT NULL,
    size        numeric     NOT NULL,
    size_unit   text        NOT NULL CHECK (size_unit IN ('acres', 'hectares', 'sqft')),
    land_type   text        NOT NULL CHECK (land_type IN ('agricultural', 'residential', 'commercial')),
    address     text        NOT NULL,
    city        text        NOT NULL,
    state       text        NOT NULL,
    zip_code    text        NOT NULL,
    features    text[]      NOT NULL DEFAULT '{}',
    images      text[]      NOT NULL DEFAULT '{}',
    land_papers text[]      NOT NULL DEFAULT '{}',
    seller_id   uuid        NOT NULL,
    location     geography(POINT, 4326),
    created_at  timestamptz NOT NULL DEFAULT now(),
    status      text        NOT NULL DEFAULT 'active' 
    
        CHECK (status IN ('active', 'pending', 'sold')),

    -- Define the Foreign Key constraint inside the table creation
    -- This avoids the "ADD CONSTRAINT IF NOT EXISTS" syntax error
    CONSTRAINT properties_seller_id_fkey 
        FOREIGN KEY (seller_id) 
        REFERENCES public.users(id) 
        ON DELETE CASCADE
);

-- 4. Create indexes for performance (Recommended)
CREATE INDEX IF NOT EXISTS idx_properties_seller_id ON public.properties(seller_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);


CREATE EXTENSION IF NOT EXISTS postgis;


-- Create a spatial index (Crucial for speed!)
CREATE INDEX IF NOT EXISTS properties_geo_index ON properties USING GIST (location);

-- need to this because location is stored in a particular format which cannnot be used directly,
-- so creating a view of the tablw with required columns
create or replace view properties_with_coords as
select 
  *,
  st_y(location::geometry) as lat,
  st_x(location::geometry) as lng
from properties;
