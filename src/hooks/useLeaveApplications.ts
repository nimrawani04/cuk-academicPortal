import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type LeaveApplication = Tables<'leave_applications'>;

export function useStudentLeaveApplications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-leave-applications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('leave_applications')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LeaveApplication[];
    },
    enabled: !!user,
  });
}

export function useAllLeaveApplications() {
  return useQuery({
    queryKey: ['all-leave-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_applications')
        .select('*, profiles!leave_applications_student_id_fkey(full_name, enrollment_number, department)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateLeaveApplication() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (application: Omit<TablesInsert<'leave_applications'>, 'student_id'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('leave_applications')
        .insert({ ...application, student_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-leave-applications'] });
      queryClient.invalidateQueries({ queryKey: ['all-leave-applications'] });
    },
  });
}

export function useUpdateLeaveApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'leave_applications'> & { id: string }) => {
      const { data, error } = await supabase
        .from('leave_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-leave-applications'] });
      queryClient.invalidateQueries({ queryKey: ['all-leave-applications'] });
    },
  });
}

export function useReviewLeaveApplication() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: 'approved' | 'rejected'; rejectionReason?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('leave_applications')
        .update({
          status,
          rejection_reason: rejectionReason,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-leave-applications'] });
      queryClient.invalidateQueries({ queryKey: ['all-leave-applications'] });
    },
  });
}
