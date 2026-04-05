import { useMemo, useState } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import {
  Bell,
  BookOpen,
  Calendar,
  ClipboardList,
  FolderOpen,
  LogOut,
  Upload,
  User,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/Layout';
import type { SidebarItem } from '@/components/layout/types';
import { TeacherNotices } from '@/components/teacher/TeacherNotices';
import { TeacherMarks } from '@/components/teacher/TeacherMarks';
import { TeacherAttendance } from '@/components/teacher/TeacherAttendance';
import { TeacherAssignments } from '@/components/teacher/TeacherAssignments';
import { TeacherResources } from '@/components/teacher/TeacherResources';
import { TeacherLeave } from '@/components/teacher/TeacherLeave';
import { TeacherExams } from '@/components/teacher/TeacherExams';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { BulkUpload } from '@/components/teacher/BulkUpload';

const TeacherDashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const { data: profile } = useProfile();
  useRealtimeNotifications();
  const [activeItem, setActiveItem] = useState('notices');

  const displayName = useMemo(() => {
    const raw = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Teacher';
    return String(raw)
      .split(/[._-]/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  }, [profile?.full_name, user?.user_metadata?.full_name, user?.email]);

  const primaryItems = useMemo<SidebarItem[]>(
    () => [
      { id: 'notices', label: 'Notices', icon: Bell, section: 'Management', onClick: () => setActiveItem('notices') },
      { id: 'marks', label: 'Marks', icon: ClipboardList, section: 'Management', onClick: () => setActiveItem('marks') },
      { id: 'attendance', label: 'Attendance', icon: UserCheck, section: 'Management', onClick: () => setActiveItem('attendance') },
      { id: 'assignments', label: 'Assignments', icon: BookOpen, section: 'Management', onClick: () => setActiveItem('assignments') },
      { id: 'resources', label: 'Resources', icon: FolderOpen, section: 'Academic', onClick: () => setActiveItem('resources') },
      { id: 'exams', label: 'Exams', icon: Calendar, section: 'Academic', onClick: () => setActiveItem('exams') },
      { id: 'leave', label: 'Leave', icon: Calendar, section: 'Academic', onClick: () => setActiveItem('leave') },
      { id: 'bulk-upload', label: 'Bulk Upload', icon: Upload, section: 'Academic', onClick: () => setActiveItem('bulk-upload') },
    ],
    []
  );

  const bottomItems = useMemo<SidebarItem[]>(
    () => [
      { id: 'profile', label: 'Profile', icon: User, onClick: () => setActiveItem('profile') },
      { id: 'logout', label: 'Logout', icon: LogOut, onClick: signOut },
    ],
    [signOut]
  );

  const renderSection = () => {
    switch (activeItem) {
      case 'notices':
        return <TeacherNotices />;
      case 'marks':
        return <TeacherMarks />;
      case 'attendance':
        return <TeacherAttendance />;
      case 'assignments':
        return <TeacherAssignments />;
      case 'resources':
        return <TeacherResources />;
      case 'exams':
        return <TeacherExams />;
      case 'leave':
        return <TeacherLeave />;
      case 'bulk-upload':
        return <BulkUpload />;
      case 'profile':
        return (
          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-tight text-foreground">Profile Management</h2>
            <ProfileEditor />
          </section>
        );
      default:
        return <TeacherNotices />;
    }
  };

  return (
    <DashboardLayout
      appName="Academic"
      appSubtitle="Teacher Portal"
      logoSrc="/favicon.ico"
      userName={displayName}
      role={userRole ?? 'teacher'}
      activeItem={activeItem}
      primaryItems={primaryItems}
      bottomItems={bottomItems}
      onNavigate={setActiveItem}
    >
      {renderSection()}
    </DashboardLayout>
  );
};

export default TeacherDashboard;
