import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const normalize = (value?: string | null) => value?.trim() || '';

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const [classesRes, subjectsRes, profilesRes] = await Promise.all([
        supabase.from('classes').select('department'),
        supabase.from('subjects').select('department'),
        supabase.from('profiles').select('department'),
      ]);

      if (classesRes.error) throw classesRes.error;
      if (subjectsRes.error) throw subjectsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const values = [
        ...(classesRes.data || []).map((row) => normalize(row.department)),
        ...(subjectsRes.data || []).map((row) => normalize(row.department)),
        ...(profilesRes.data || []).map((row) => normalize(row.department)),
      ].filter(Boolean);

      const unique = Array.from(new Set(values));
      unique.sort((a, b) => a.localeCompare(b));
      return unique;
    },
  });
}
