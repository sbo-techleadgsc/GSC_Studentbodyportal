-- Supabase Storage setup for image uploads (officers, news, events)
-- Run this in Supabase's SQL editor once (idempotent: safe to re-run).
-- Requires the "admins" table (already used by other policies) for admin writes.
--
-- NOTE: RLS is ALREADY enabled on storage tables by default in Supabase, so there
-- is no ALTER TABLE ... ENABLE ROW LEVEL SECURITY statement here. If a policy
-- below fails with "must be owner", run this as the postgres role (the project's
-- default SQL editor connection), not as another role.

-- 1) Create the public storage bucket used by src/lib/storage.ts
INSERT INTO storage.buckets (id, name, public)
VALUES ('sbo-images', 'sbo-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2) Anyone can read/download images in the bucket (public URLs work)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'public read sbo-images'
  ) THEN
    CREATE POLICY "public read sbo-images" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'sbo-images');
  END IF;
END $$;

-- 3) Only authenticated admins can upload, replace, or delete images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'admin insert sbo-images'
  ) THEN
    CREATE POLICY "admin insert sbo-images" ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'sbo-images'
        AND EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'admin update sbo-images'
  ) THEN
    CREATE POLICY "admin update sbo-images" ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'sbo-images'
        AND EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'admin delete sbo-images'
  ) THEN
    CREATE POLICY "admin delete sbo-images" ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'sbo-images'
        AND EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid())
      );
  END IF;
END $$;

-- Optional: if you'd rather admins upload via the service role only, skip policies 3-6
-- and upload through an Edge Function instead. The current app uploads with the anon key,
-- so policies 3-6 are what make the built-in ImageUpload work.
