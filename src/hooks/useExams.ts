import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Exam {
  id: string;
  subject_id: string;
  title: string;
  exam_date: string;
  start_time: string | null;
  end_time: string | null;
  room: string | null;
  exam_type: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  subjects?: { name: string; code: string } | null;
}

export function useExams() {
  return useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*, subjects(name, code)')
        .order('exam_date', { ascending: true });

      if (error) throw error;
      return data as Exam[];
    },
  });
}

export function useUpcomingExams() {
  return useQuery({
    queryKey: ['upcoming-exams'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('exams')
        .select('*, subjects(name, code)')
        .gte('exam_date', today)
        .order('exam_date', { ascending: true });

      if (error) throw error;
      return data as Exam[];
    },
  });
}

export function useCreateExam() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exam: Omit<Exam, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'subjects'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('exams')
        .insert({ ...exam, created_by: user.id })
        .select('*, subjects(name, code)')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-exams'] });
    },
  });
}
