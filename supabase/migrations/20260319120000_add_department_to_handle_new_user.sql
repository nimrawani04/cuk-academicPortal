-- Capture department during signup if provided in user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  selected_role public.app_role;
  selected_department text;
BEGIN
  selected_role :=
    CASE
      WHEN (new.raw_user_meta_data->>'role') IN ('student', 'teacher', 'admin')
        THEN (new.raw_user_meta_data->>'role')::public.app_role
      ELSE 'student'::public.app_role
    END;

  selected_department := NULLIF(TRIM(new.raw_user_meta_data->>'department'), '');

  INSERT INTO public.profiles (user_id, full_name, email, department)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    selected_department
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, selected_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
END;
$function$;
