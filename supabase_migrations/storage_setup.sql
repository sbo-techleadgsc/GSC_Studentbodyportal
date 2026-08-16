-- Supabase Storage setup for image uploads (officers, news, events)
-- Run this in Supabase's SQL editor once (idempotent: safe to re-run).
-- Requires the "admins" table (already used by other policies) for admin writes.

-- 1) Create the public storage bucket used by src/lib/storage.ts
INSERT INTO storage.buckets (id, name, public)
VALUES ('sbo-images', 'sbo-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2) Make sure RLS is on for objects (Supabase enables this by default, this is a no-op if so)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3) Anyone can read/download images in the bucket (public URLs work)
CREATE POLICY "public read sbo-images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'sbo-images');

-- 4) Only authenticated admins can upload, replace, or delete images
CREATE POLICY "admin insert sbo-images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'sbo-images'
    AND EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  );

CREATE POLICY "admin update sbo-images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'sbo-images'
    AND EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  );

CREATE POLICY "admin delete sbo-images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'sbo-images'
    AND EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
  );

-- Optional: if you'd rather admins upload via the service role only, skip policies 4-6
-- and upload through an Edge Function instead. The current app uploads with the anon key,
-- so policies 4-6 are what make the built-in ImageUpload work.
