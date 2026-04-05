-- Add course_type to subjects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'course_type'
  ) THEN
    CREATE TYPE public.course_type AS ENUM ('core', 'elective');
  END IF;
END$$;

ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS course_type public.course_type NOT NULL DEFAULT 'core';

-- Create teacher_assignments table for many-to-many teacher-course mapping
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, subject_id)
);

ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view teacher_assignments"
ON public.teacher_assignments FOR SELECT
USING (true);

CREATE POLICY "Admins can manage teacher_assignments"
ON public.teacher_assignments FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view own assignments"
ON public.teacher_assignments FOR SELECT
USING (auth.uid() = teacher_id);

-- Migrate existing subjects.teacher_id data into teacher_assignments
INSERT INTO public.teacher_assignments (teacher_id, subject_id)
SELECT teacher_id, id FROM public.subjects WHERE teacher_id IS NOT NULL
ON CONFLICT (teacher_id, subject_id) DO NOTHING;