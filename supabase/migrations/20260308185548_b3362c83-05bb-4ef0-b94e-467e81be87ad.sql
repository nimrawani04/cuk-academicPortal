
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  room TEXT,
  exam_type TEXT NOT NULL DEFAULT 'midterm',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Teachers can manage exams" ON public.exams FOR ALL USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Admins can manage exams" ON public.exams FOR ALL USING (public.has_role(auth.uid(), 'admin'));
