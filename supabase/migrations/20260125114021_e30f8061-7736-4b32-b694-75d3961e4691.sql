-- Add unique constraint for marks upsert
ALTER TABLE public.marks ADD CONSTRAINT marks_student_subject_unique UNIQUE (student_id, subject_id);

-- Add unique constraint for attendance upsert  
ALTER TABLE public.attendance ADD CONSTRAINT attendance_student_subject_date_unique UNIQUE (student_id, subject_id, date);