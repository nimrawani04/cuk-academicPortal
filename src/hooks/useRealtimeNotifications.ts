import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export function useRealtimeNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  useEffect(() => {
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notices' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notices'] });
          // Don't notify teachers about their own notices
          if (userRole !== 'teacher') {
            const notice = payload.new as any;
            toast({
              title: '📢 New Notice',
              description: notice.title,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'exams' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['exams'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-exams'] });
          if (userRole !== 'teacher') {
            const exam = payload.new as any;
            toast({
              title: '📝 New Exam Scheduled',
              description: `${exam.title} on ${exam.exam_date}`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notices' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notices'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'exams' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['exams'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-exams'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'notices' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notices'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'exams' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['exams'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-exams'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, queryClient, userRole]);
}
