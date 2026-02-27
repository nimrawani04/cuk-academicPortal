import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { AppRole, SidebarItem } from './types';
import { cn } from '@/lib/utils';

type DashboardLayoutProps = {
  appName: string;
  appSubtitle: string;
  logoSrc: string;
  userName: string;
  role: AppRole;
  activeItem: string;
  primaryItems: SidebarItem[];
  bottomItems: SidebarItem[];
  children: ReactNode;
};

export const DashboardLayout = ({
  appName,
  appSubtitle,
  logoSrc,
  userName,
  role,
  activeItem,
  primaryItems,
  bottomItems,
  children,
}: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const initials = useMemo(() => {
    const words = userName.split(' ').filter(Boolean);
    if (!words.length) return 'AP';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }, [userName]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={cn('h-dvh overflow-hidden', darkMode ? 'bg-[#1f1f2b] text-slate-100' : 'bg-[#f6edf4] text-slate-900')}>
      <div className="flex h-full">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
          appName={appName}
          appSubtitle={appSubtitle}
          logoSrc={logoSrc}
          userName={userName}
          role={role}
          initials={initials}
          activeItem={activeItem}
          primaryItems={primaryItems}
          bottomItems={bottomItems}
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <Header
            breadcrumb={['Dashboard', 'Overview']}
            subtitle="Stay updated with important announcements"
            userName={userName}
            initials={initials}
            notificationCount={3}
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode((prev) => !prev)}
            onOpenShortcuts={() => setShortcutsOpen(true)}
          />

          <div className="px-5 py-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>

      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Shortcuts</DialogTitle>
            <DialogDescription>Quick navigation for common actions</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 text-sm">
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50">Go to Notices</button>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50">Check Assignments</button>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50">Open Library</button>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50">Apply for Leave</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
