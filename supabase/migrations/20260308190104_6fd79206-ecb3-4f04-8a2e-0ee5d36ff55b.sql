
-- Create resources storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

-- Everyone can view resources
CREATE POLICY "Anyone can view resources" ON storage.objects FOR SELECT USING (bucket_id = 'resources');

-- Teachers can upload resources
CREATE POLICY "Teachers can upload resources" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resources' AND public.has_role(auth.uid(), 'teacher'));

-- Teachers can update their resources
CREATE POLICY "Teachers can update resources" ON storage.objects FOR UPDATE
USING (bucket_id = 'resources' AND public.has_role(auth.uid(), 'teacher'));

-- Teachers can delete their resources
CREATE POLICY "Teachers can delete resources" ON storage.objects FOR DELETE
USING (bucket_id = 'resources' AND public.has_role(auth.uid(), 'teacher'));

-- Admins full access
CREATE POLICY "Admins manage resources storage" ON storage.objects FOR ALL
USING (bucket_id = 'resources' AND public.has_role(auth.uid(), 'admin'));
