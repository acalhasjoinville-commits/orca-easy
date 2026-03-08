
-- Create logos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Allow anyone to read logos
CREATE POLICY "Public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');

-- Allow anyone to upload logos (no auth in this app)
CREATE POLICY "Allow upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos');

-- Allow anyone to update logos
CREATE POLICY "Allow update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos');

-- Allow anyone to delete logos
CREATE POLICY "Allow delete logos" ON storage.objects FOR DELETE USING (bucket_id = 'logos');
