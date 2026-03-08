import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface UserWithRole {
  user_id: string;
  full_name: string;
  email: string;
  department: string | null;
  semester: number | null;
  phone: string | null;
  created_at: string;
  role: AppRole | null;
}

export function useAllUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, department, semester, phone, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]));

      return (profiles ?? []).map((p) => ({
        ...p,
        role: roleMap.get(p.user_id) ?? null,
      })) as UserWithRole[];
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Upsert: delete existing then insert
      await supabase.from('user_roles').delete().eq('user_id', userId);
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useAllSubjects() {
  return useQuery({
    queryKey: ['admin-subjects'],
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

export function useAllClasses() {
  return useQuery({
    queryKey: ['admin-classes'],
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

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cls: { name: string; department: string; semester: number }) => {
      const { error } = await supabase.from('classes').insert(cls);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-classes'] }),
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-classes'] }),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-subjects'] }),
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [profiles, subjects, classes, notices, leaves, enrollments] = await Promise.all([
        supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('notices').select('id', { count: 'exact', head: true }),
        supabase.from('leave_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('enrollments').select('id', { count: 'exact', head: true }),
      ]);

      const { data: roles } = await supabase.from('user_roles').select('role');
      const students = roles?.filter((r) => r.role === 'student').length ?? 0;
      const teachers = roles?.filter((r) => r.role === 'teacher').length ?? 0;
      const admins = roles?.filter((r) => r.role === 'admin').length ?? 0;

      return {
        totalUsers: profiles.count ?? 0,
        students,
        teachers,
        admins,
        totalSubjects: subjects.count ?? 0,
        totalClasses: classes.count ?? 0,
        totalNotices: notices.count ?? 0,
        pendingLeaves: leaves.count ?? 0,
        totalEnrollments: enrollments.count ?? 0,
      };
    },
  });
}
