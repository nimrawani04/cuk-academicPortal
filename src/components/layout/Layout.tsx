import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { AppRole, SidebarItem } from './types';
import { cn } from '@/lib/utils';
import { useAccentColor } from '@/hooks/useAccentColor';

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
  onNavigate?: (section: string) => void;
  scrollable?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
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
  onNavigate,
  scrollable = true,
  headerTitle,
  headerSubtitle,
  primaryActionLabel,
  onPrimaryAction,
}: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  useAccentColor();

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

  useEffect(() => {
    document.body.style.overflow = scrollable ? 'auto' : 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [scrollable]);

  return (
    <div className={cn('app-shell smooth-ui h-dvh overflow-hidden text-foreground')}>
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

        <main className={cn('min-w-0 flex-1', scrollable ? 'overflow-y-auto' : 'overflow-hidden')}>
          <Header
            breadcrumb={headerTitle ? undefined : ['Dashboard', 'Overview']}
            subtitle={headerSubtitle ?? (headerTitle ? undefined : 'Stay updated with important announcements')}
            title={headerTitle}
            userName={userName}
            initials={initials}
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode((prev) => !prev)}
            onNavigate={onNavigate}
            primaryActionLabel={primaryActionLabel}
            onPrimaryAction={onPrimaryAction}
          />

          <div className={cn(scrollable ? 'px-5 py-6 lg:px-8 lg:py-8' : 'px-4 py-4 lg:px-6 lg:py-5')}>
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};
