import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Subject = Tables<'subjects'>;

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*, profiles!subjects_teacher_id_fkey(full_name)')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Fetch subjects assigned to the current teacher via teacher_assignments table.
 * Falls back to subjects.teacher_id for backward compatibility.
 */
export function useTeacherSubjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['teacher-subjects', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get subject IDs from teacher_assignments
      const { data: assignments, error: assignError } = await supabase
        .from('teacher_assignments')
        .select('subject_id')
        .eq('teacher_id', user.id);

      if (assignError) throw assignError;

      const assignedIds = assignments?.map((a: any) => a.subject_id) || [];

      // Also get legacy subjects.teacher_id
      const { data: legacySubjects, error: legacyError } = await supabase
        .from('subjects')
        .select('id')
        .eq('teacher_id', user.id);

      if (legacyError) throw legacyError;

      const legacyIds = legacySubjects?.map((s: any) => s.id) || [];

      // Merge unique IDs
      const allIds = [...new Set([...assignedIds, ...legacyIds])];

      if (allIds.length === 0) return [] as Subject[];

      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .in('id', allIds)
        .order('name');

      if (error) throw error;
      return data as Subject[];
    },
    enabled: !!user,
  });
}

export function useCreateSubject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subject: Omit<TablesInsert<'subjects'>, 'teacher_id'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('subjects')
        .insert({ ...subject, teacher_id: user.id })
        .select()
        .single();
      
      if (error) throw error;

      // Also create teacher_assignment
      await supabase
        .from('teacher_assignments')
        .upsert({ teacher_id: user.id, subject_id: data.id }, { onConflict: 'teacher_id,subject_id' });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-subjects'] });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'subjects'> & { id: string }) => {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-subjects'] });
    },
  });
}
