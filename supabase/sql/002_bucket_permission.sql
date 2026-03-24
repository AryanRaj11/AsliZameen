-- file: supabase/migrations/[timestamp]_add_storage_policies.sql
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated,anon
WITH CHECK (bucket_id = 'properties_image');

CREATE POLICY IF NOT EXISTS "Allow authenticated file uploads"
ON storage.objects FOR INSERT
TO authenticated,anon
WITH CHECK (bucket_id = 'properties_papers');