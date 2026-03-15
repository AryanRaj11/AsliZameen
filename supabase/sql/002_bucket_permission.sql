-- file: supabase/migrations/[timestamp]_add_storage_policies.sql

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'properties_image');
