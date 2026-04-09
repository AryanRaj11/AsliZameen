-- 1. Create the Public Bucket for Property Photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties_image', 'properties_image', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create the Private Bucket for Legal Documents
-- Note: public = false ensures files aren't accessible via a direct URL
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties_papers', 'properties_papers', false)
ON CONFLICT (id) DO NOTHING;

-- file: supabase/migrations/[timestamp]_add_storage_policies.sql
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated file uploads" ON storage.objects;

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated,anon
WITH CHECK (bucket_id = 'properties_image');

CREATE POLICY "Allow authenticated file uploads"
ON storage.objects FOR INSERT
TO authenticated,anon
WITH CHECK (bucket_id = 'properties_papers');