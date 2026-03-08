
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
declare
  selected_role public.app_role;
begin
  selected_role :=
    case
      when (new.raw_user_meta_data->>'role') in ('student', 'teacher', 'admin')
        then (new.raw_user_meta_data->>'role')::public.app_role
      else 'student'::public.app_role
    end;

  insert into public.profiles (user_id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email
  )
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, selected_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$function$;
