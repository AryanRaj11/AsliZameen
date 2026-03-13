-- Create users table (optional but recommended for seller_id FK)
create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null unique,
  phone      text,
  role       text        not null check (role in ('buyer','seller','both')),
  favorites  text[]      not null default '{}',
  created_at timestamptz not null default now()
);

-- Create properties table
create table if not exists public.properties (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  description text        not null,
  price       numeric     not null,
  size        numeric     not null,
  size_unit   text        not null check (size_unit in ('acres','hectares','sqft')),
  land_type   text        not null check (land_type in ('agricultural','residential','commercial')),
  address     text        not null,
  city        text        not null,
  state       text        not null,
  zip_code    text        not null,
  features    text[]      not null default '{}',
  images      text[]      not null default '{}',
  seller_id   uuid        not null,
  created_at  timestamptz not null default now(),
  status      text        not null default 'active'
    check (status in ('active','pending','sold'))
);

-- Add FK from properties.seller_id to users.id
alter table public.properties
  add constraint if not exists properties_seller_id_fkey
  foreign key (seller_id) references public.users(id);

