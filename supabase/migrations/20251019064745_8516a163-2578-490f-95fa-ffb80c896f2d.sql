-- Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'admin');

-- Create priority enum
CREATE TYPE public.priority_level AS ENUM ('normal', 'important', 'urgent');

-- Create attendance status enum
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'on_leave');

-- Create leave status enum
CREATE TYPE public.leave_status AS ENUM ('pending', 'approved', 'rejected');

-- Create resource type enum
CREATE TYPE public.resource_type AS ENUM ('lecture_notes', 'presentation', 'video_tutorial', 'document', 'other');

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Profiles table (for both students and teachers)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    enrollment_number TEXT,
    employee_id TEXT,
    department TEXT,
    semester INTEGER,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Classes table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    semester INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subjects table
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    credits INTEGER NOT NULL,
    department TEXT NOT NULL,
    semester INTEGER NOT NULL,
    teacher_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enrollments table (student-subject relationship)
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'enrolled',
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, subject_id)
);

-- Notices table
CREATE TABLE public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority priority_level NOT NULL DEFAULT 'normal',
    target_audience TEXT NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    expire_at TIMESTAMPTZ,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marks table
CREATE TABLE public.marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    test1_marks NUMERIC(5,2),
    test2_marks NUMERIC(5,2),
    presentation_marks NUMERIC(5,2),
    assignment_marks NUMERIC(5,2),
    attendance_marks NUMERIC(5,2),
    total_marks NUMERIC(5,2),
    grade TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, subject_id)
);

-- Attendance table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'present',
    marked_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, subject_id, date)
);

-- Assignments table
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    max_marks INTEGER NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assignment submissions table
CREATE TABLE public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    submission_url TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    marks NUMERIC(5,2),
    feedback TEXT,
    graded_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    graded_at TIMESTAMPTZ,
    UNIQUE (assignment_id, student_id)
);

-- Resources table
CREATE TABLE public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    resource_type resource_type NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    access_level TEXT NOT NULL DEFAULT 'all_students',
    uploaded_by UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    download_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leave applications table
CREATE TABLE public.leave_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    leave_type TEXT NOT NULL,
    priority priority_level NOT NULL DEFAULT 'normal',
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    contact_info TEXT,
    status leave_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Library books table
CREATE TABLE public.library_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    category TEXT,
    total_copies INTEGER NOT NULL DEFAULT 1,
    available_copies INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Book issues table
CREATE TABLE public.book_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.library_books(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    status TEXT NOT NULL DEFAULT 'active',
    late_fee NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_issues ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for classes
CREATE POLICY "Everyone can view classes"
ON public.classes FOR SELECT
USING (true);

CREATE POLICY "Teachers can manage classes"
ON public.classes FOR ALL
USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for subjects
CREATE POLICY "Everyone can view subjects"
ON public.subjects FOR SELECT
USING (true);

CREATE POLICY "Teachers can manage subjects"
ON public.subjects FOR ALL
USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for enrollments
CREATE POLICY "Students can view their enrollments"
ON public.enrollments FOR SELECT
USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Students can create enrollments"
ON public.enrollments FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can manage enrollments"
ON public.enrollments FOR ALL
USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for notices
CREATE POLICY "Everyone can view notices"
ON public.notices FOR SELECT
USING (true);

CREATE POLICY "Teachers can manage notices"
ON public.notices FOR ALL
USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for marks
CREATE POLICY "Students can view their own marks"
ON public.marks FOR SELECT
USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can manage marks"
ON public.marks FOR ALL
USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for attendance
CREATE POLICY "Students can view their attendance"
ON public.attendance FOR SELECT
USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can manage attendance"
ON public.attendance FOR ALL
USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for assignments
CREATE POLICY "Students can view assignments"
ON public.assignments FOR SELECT
USING (true);

CREATE POLICY "Teachers can manage assignments"
ON public.assignments FOR ALL
USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for assignment_submissions
CREATE POLICY "Students can view their submissions"
ON public.assignment_submissions FOR SELECT
USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Students can create submissions"
ON public.assignment_submissions FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their submissions"
ON public.assignment_submissions FOR UPDATE
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can grade submissions"
ON public.assignment_submissions FOR UPDATE
USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for resources
CREATE POLICY "Students can view resources"
ON public.resources FOR SELECT
USING (true);

CREATE POLICY "Teachers can manage resources"
ON public.resources FOR ALL
USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for leave_applications
CREATE POLICY "Students can view their leave applications"
ON public.leave_applications FOR SELECT
USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Students can create leave applications"
ON public.leave_applications FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their pending applications"
ON public.leave_applications FOR UPDATE
USING (auth.uid() = student_id AND status = 'pending');

CREATE POLICY "Teachers can manage leave applications"
ON public.leave_applications FOR ALL
USING (public.has_role(auth.uid(), 'teacher'));

-- RLS Policies for library_books
CREATE POLICY "Everyone can view books"
ON public.library_books FOR SELECT
USING (true);

-- RLS Policies for book_issues
CREATE POLICY "Students can view their book issues"
ON public.book_issues FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can create book issues"
ON public.book_issues FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notices_updated_at
BEFORE UPDATE ON public.notices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marks_updated_at
BEFORE UPDATE ON public.marks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_applications_updated_at
BEFORE UPDATE ON public.leave_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_library_books_updated_at
BEFORE UPDATE ON public.library_books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_issues_updated_at
BEFORE UPDATE ON public.book_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();