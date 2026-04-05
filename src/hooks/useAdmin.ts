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

      // Also fetch teacher_assignments for each subject
      const { data: assignments } = await supabase
        .from('teacher_assignments')
        .select('subject_id, teacher_id');

      const assignmentMap = new Map<string, string[]>();
      assignments?.forEach((a: any) => {
        const existing = assignmentMap.get(a.subject_id) || [];
        existing.push(a.teacher_id);
        assignmentMap.set(a.subject_id, existing);
      });

      return data?.map((s: any) => ({
        ...s,
        assigned_teacher_ids: assignmentMap.get(s.id) || [],
      }));
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

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; department?: string; semester?: number }) => {
      const { error } = await supabase.from('classes').update(updates).eq('id', id);
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

export function useCreateSubjectAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subject: {
      code: string;
      name: string;
      department: string;
      semester: number;
      credits: number;
      teacher_id?: string | null;
      course_type?: string;
    }) => {
      const { course_type, ...subjectData } = subject;
      // Note: course_type is stored but the types file hasn't updated yet,
      // so we use raw query approach
      const { data, error } = await supabase
        .from('subjects')
        .insert(subjectData as any)
        .select()
        .single();
      if (error) throw error;

      // If teacher_id is set, also create teacher_assignment
      if (subject.teacher_id) {
        await supabase
          .from('teacher_assignments')
          .upsert(
            { teacher_id: subject.teacher_id, subject_id: data.id },
            { onConflict: 'teacher_id,subject_id' }
          );
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subjects'] });
      qc.invalidateQueries({ queryKey: ['teacher-subjects'] });
    },
  });
}

export function useUpdateSubjectAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      code?: string;
      name?: string;
      department?: string;
      semester?: number;
      credits?: number;
      teacher_id?: string | null;
      course_type?: string;
    }) => {
      const { course_type, ...subjectUpdates } = updates;
      const { error } = await supabase.from('subjects').update(subjectUpdates as any).eq('id', id);
      if (error) throw error;

      // Sync teacher_assignment if teacher_id changed
      if (updates.teacher_id !== undefined) {
        // Remove old assignment for this subject from old teacher (if any)
        // and add new one
        if (updates.teacher_id) {
          await supabase
            .from('teacher_assignments')
            .upsert(
              { teacher_id: updates.teacher_id, subject_id: id },
              { onConflict: 'teacher_id,subject_id' }
            );
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subjects'] });
      qc.invalidateQueries({ queryKey: ['teacher-subjects'] });
    },
  });
}

/** Assign a teacher to a course (teacher_assignments table) */
export function useAssignTeacherToCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teacherId, subjectId }: { teacherId: string; subjectId: string }) => {
      const { error } = await supabase
        .from('teacher_assignments')
        .upsert(
          { teacher_id: teacherId, subject_id: subjectId },
          { onConflict: 'teacher_id,subject_id' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subjects'] });
      qc.invalidateQueries({ queryKey: ['teacher-subjects'] });
    },
  });
}

/** Remove a teacher from a course */
export function useRemoveTeacherFromCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teacherId, subjectId }: { teacherId: string; subjectId: string }) => {
      const { error } = await supabase
        .from('teacher_assignments')
        .delete()
        .eq('teacher_id', teacherId)
        .eq('subject_id', subjectId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subjects'] });
      qc.invalidateQueries({ queryKey: ['teacher-subjects'] });
    },
  });
}

export function useTeachersList() {
  return useQuery({
    queryKey: ['admin-teachers-list'],
    queryFn: async () => {
      const { data: teacherRoles } = await supabase.from('user_roles').select('user_id').eq('role', 'teacher');
      if (!teacherRoles?.length) return [];
      const ids = teacherRoles.map((r) => r.user_id);
      const { data, error } = await supabase.from('profiles').select('user_id, full_name').in('user_id', ids).order('full_name');
      if (error) throw error;
      return data ?? [];
    },
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
