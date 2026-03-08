import { useMemo, useState } from 'react';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  School,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/Layout';
import type { SidebarItem } from '@/components/layout/types';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminSubjects } from '@/components/admin/AdminSubjects';
import { AdminClasses } from '@/components/admin/AdminClasses';
import { ProfileEditor } from '@/components/profile/ProfileEditor';

const AdminDashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const { data: profile } = useProfile();
  useRealtimeNotifications();
  const [activeItem, setActiveItem] = useState('overview');

  const displayName = useMemo(() => {
    const raw = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
    return String(raw)
      .split(/[._-]/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  }, [profile?.full_name, user?.user_metadata?.full_name, user?.email]);

  const primaryItems = useMemo<SidebarItem[]>(
    () => [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard, section: 'Dashboard', onClick: () => setActiveItem('overview') },
      { id: 'users', label: 'Users', icon: Users, section: 'Dashboard', onClick: () => setActiveItem('users') },
      { id: 'subjects', label: 'Subjects', icon: BookOpen, section: 'Management', onClick: () => setActiveItem('subjects') },
      { id: 'classes', label: 'Classes', icon: School, section: 'Management', onClick: () => setActiveItem('classes') },
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
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <AdminUsers />;
      case 'subjects':
        return <AdminSubjects />;
      case 'classes':
        return <AdminClasses />;
      case 'profile':
        return (
          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-tight text-slate-900">Profile Management</h2>
            <ProfileEditor />
          </section>
        );
      default:
        return <AdminOverview />;
    }
  };

  return (
    <DashboardLayout
      appName="Academic"
      appSubtitle="Admin Portal"
      logoSrc="/favicon.ico"
      userName={displayName}
      role={userRole ?? 'admin'}
      activeItem={activeItem}
      primaryItems={primaryItems}
      bottomItems={bottomItems}
    >
      {renderSection()}
    </DashboardLayout>
  );
};

export default AdminDashboard;
