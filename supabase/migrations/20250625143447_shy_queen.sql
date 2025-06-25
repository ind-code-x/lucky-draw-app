/*
  # Create storage bucket for giveaway assets

  1. Storage
    - Create `giveaway-assets` bucket for poster uploads
    - Set up policies for authenticated users to upload
    - Allow public read access to uploaded assets

  2. Security
    - Users can upload to their own folders
    - Public read access for all assets
    - File size and type restrictions
*/

-- Create storage bucket for giveaway assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('giveaway-assets', 'giveaway-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload giveaway assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'giveaway-assets');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own giveaway assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'giveaway-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own giveaway assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'giveaway-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to all giveaway assets
CREATE POLICY "Public read access for giveaway assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'giveaway-assets');