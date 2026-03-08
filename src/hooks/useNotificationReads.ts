import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useNotificationReads() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notification-reads', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_reads' as any)
        .select('notification_type, notification_id')
        .eq('user_id', user!.id);

      if (error) throw error;
      const set = new Set<string>();
      (data as any[])?.forEach((r: any) => set.add(`${r.notification_type}:${r.notification_id}`));
      return set;
    },
  });
}

export function useMarkAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, id }: { type: 'notice' | 'exam'; id: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('notification_reads' as any)
        .upsert(
          { user_id: user.id, notification_type: type, notification_id: id } as any,
          { onConflict: 'user_id,notification_type,notification_id' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-reads'] });
    },
  });
}

export function useMarkAllAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { type: 'notice' | 'exam'; id: string }[]) => {
      if (!user) throw new Error('Not authenticated');
      const rows = items.map((item) => ({
        user_id: user.id,
        notification_type: item.type,
        notification_id: item.id,
      }));
      const { error } = await supabase
        .from('notification_reads' as any)
        .upsert(rows as any, { onConflict: 'user_id,notification_type,notification_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-reads'] });
    },
  });
}
