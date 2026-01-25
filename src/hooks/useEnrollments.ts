import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Enrollment = Tables<'enrollments'>;

export function useStudentEnrollments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-enrollments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, subjects(*), classes(*)')
        .eq('student_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useEnrollStudent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subjectId, classId }: { subjectId: string; classId: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          subject_id: subjectId,
          class_id: classId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-enrollments'] });
    },
  });
}

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}
