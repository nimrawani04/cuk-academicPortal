import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Attendance = Tables<'attendance'>;

export function useStudentAttendance() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-attendance', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('*, subjects(*)')
        .eq('student_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAttendanceBySubjectDate(subjectId: string | null, date: string | null) {
  return useQuery({
    queryKey: ['attendance-by-subject-date', subjectId, date],
    queryFn: async () => {
      if (!subjectId || !date) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('*, profiles!attendance_student_id_fkey(full_name, enrollment_number)')
        .eq('subject_id', subjectId)
        .eq('date', date);
      
      if (error) throw error;
      return data;
    },
    enabled: !!subjectId && !!date,
  });
}

export function useEnrolledStudents(subjectId: string | null) {
  return useQuery({
    queryKey: ['enrolled-students', subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, profiles!enrollments_student_id_fkey(id, user_id, full_name, enrollment_number)')
        .eq('subject_id', subjectId)
        .eq('status', 'enrolled');
      
      if (error) throw error;
      return data;
    },
    enabled: !!subjectId,
  });
}

export function useUpsertAttendance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendance: Omit<TablesInsert<'attendance'>, 'marked_by'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('attendance')
        .upsert({ 
          ...attendance, 
          marked_by: user.id 
        }, {
          onConflict: 'student_id,subject_id,date'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-by-subject-date'] });
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
    },
  });
}
