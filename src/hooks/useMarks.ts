import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Marks = Tables<'marks'>;

export function useStudentMarks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-marks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('marks')
        .select('*, subjects(*)')
        .eq('student_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useMarksBySubject(subjectId: string | null) {
  return useQuery({
    queryKey: ['marks-by-subject', subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      const { data, error } = await supabase
        .from('marks')
        .select('*, profiles!marks_student_id_fkey(full_name, enrollment_number)')
        .eq('subject_id', subjectId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!subjectId,
  });
}

export function useUpsertMarks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (marks: TablesInsert<'marks'>) => {
      // Calculate total and grade
      const test1 = marks.test1_marks || 0;
      const test2 = marks.test2_marks || 0;
      const presentation = marks.presentation_marks || 0;
      const assignment = marks.assignment_marks || 0;
      const attendance = marks.attendance_marks || 0;
      const total = Number(test1) + Number(test2) + Number(presentation) + Number(assignment) + Number(attendance);
      
      let grade = 'F';
      if (total >= 90) grade = 'A+';
      else if (total >= 80) grade = 'A';
      else if (total >= 70) grade = 'B+';
      else if (total >= 60) grade = 'B';
      else if (total >= 50) grade = 'C';
      else if (total >= 40) grade = 'D';

      const { data, error } = await supabase
        .from('marks')
        .upsert({ 
          ...marks, 
          total_marks: total,
          grade 
        }, {
          onConflict: 'student_id,subject_id'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks-by-subject'] });
      queryClient.invalidateQueries({ queryKey: ['student-marks'] });
    },
  });
}

export function useUpdateMarks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'marks'> & { id: string }) => {
      // Calculate total and grade
      const test1 = updates.test1_marks || 0;
      const test2 = updates.test2_marks || 0;
      const presentation = updates.presentation_marks || 0;
      const assignment = updates.assignment_marks || 0;
      const attendance = updates.attendance_marks || 0;
      const total = Number(test1) + Number(test2) + Number(presentation) + Number(assignment) + Number(attendance);
      
      let grade = 'F';
      if (total >= 90) grade = 'A+';
      else if (total >= 80) grade = 'A';
      else if (total >= 70) grade = 'B+';
      else if (total >= 60) grade = 'B';
      else if (total >= 50) grade = 'C';
      else if (total >= 40) grade = 'D';

      const { data, error } = await supabase
        .from('marks')
        .update({ ...updates, total_marks: total, grade })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks-by-subject'] });
      queryClient.invalidateQueries({ queryKey: ['student-marks'] });
    },
  });
}
