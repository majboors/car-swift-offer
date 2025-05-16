
BEGIN;

-- Create a storage bucket for car images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('car_images', 'car_images', true) 
ON CONFLICT (id) DO NOTHING;

-- Create a policy to allow anyone to read images (public bucket)
CREATE POLICY "Allow public read access for car images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'car_images');

-- Create a policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload car images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car_images');

COMMIT;
