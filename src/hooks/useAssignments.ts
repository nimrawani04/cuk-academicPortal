import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Assignment = Tables<'assignments'>;
export type AssignmentSubmission = Tables<'assignment_submissions'>;

export function useAssignments() {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*, subjects(*)')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useTeacherAssignments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['teacher-assignments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('assignments')
        .select('*, subjects(*)')
        .eq('created_by', user.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateAssignment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignment: Omit<TablesInsert<'assignments'>, 'created_by'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('assignments')
        .insert({ ...assignment, created_by: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'assignments'> & { id: string }) => {
      const { data, error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
    },
  });
}

export function useStudentSubmissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-submissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*, assignments(*, subjects(*))')
        .eq('student_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useSubmissionsByAssignment(assignmentId: string | null) {
  return useQuery({
    queryKey: ['submissions-by-assignment', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return [];
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*, profiles!assignment_submissions_student_id_fkey(full_name, enrollment_number)')
        .eq('assignment_id', assignmentId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!assignmentId,
  });
}

export function useSubmitAssignment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, submissionUrl }: { assignmentId: string; submissionUrl: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('assignment_submissions')
        .insert({
          assignment_id: assignmentId,
          student_id: user.id,
          submission_url: submissionUrl,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submissions-by-assignment'] });
    },
  });
}

export function useGradeSubmission() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, marks, feedback }: { id: string; marks: number; feedback: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          marks,
          feedback,
          graded_by: user.id,
          graded_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submissions-by-assignment'] });
    },
  });
}
