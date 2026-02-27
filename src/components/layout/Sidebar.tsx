import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AppRole, SidebarItem } from './types';

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  appName: string;
  appSubtitle: string;
  logoSrc: string;
  userName: string;
  role: AppRole;
  initials: string;
  activeItem: string;
  primaryItems: SidebarItem[];
  bottomItems: SidebarItem[];
};

export const Sidebar = ({
  collapsed,
  onToggle,
  appName,
  appSubtitle,
  logoSrc,
  userName,
  role,
  initials,
  activeItem,
  primaryItems,
  bottomItems,
}: SidebarProps) => {
  const sectionOrder = [...new Set(primaryItems.map((item) => item.section || 'General'))];

  return (
    <aside
      className={cn(
        'relative hidden h-full shrink-0 flex-col overflow-hidden border-r border-[#132b5e] bg-[#0f1f44] text-white transition-all duration-300 lg:flex',
        collapsed ? 'w-[78px]' : 'w-[244px]'
      )}
    >
      <button
        onClick={onToggle}
        className="absolute right-3 top-6 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[#d82f87] bg-[#0f1f44] text-white shadow-md"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div className="border-b border-white/10 px-3 py-4">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="Portal logo" className="h-9 w-9 object-contain" />
          {!collapsed && (
            <div>
              <p className="text-[17px] font-bold leading-none tracking-tight">{appName}</p>
              <p className="mt-0.5 text-[11px] text-white/70">{appSubtitle}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 px-3 py-4">
        <div className={cn('mb-4 flex items-center', collapsed ? 'justify-center' : 'gap-2.5')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d61f82] text-[15px] font-bold">
            {initials}
          </div>
          {!collapsed && (
            <div>
              <p className="text-[15px] font-semibold leading-tight">{userName}</p>
              <p className="text-[11px] capitalize text-white/70">{role}</p>
            </div>
          )}
        </div>

        <nav className="space-y-4">
          {sectionOrder.map((section) => {
            const items = primaryItems.filter((item) => (item.section || 'General') === section);
            return (
              <div key={section}>
                {!collapsed && (
                  <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-white/45">{section}</p>
                )}
                <div className="space-y-1">
                  {items.map((item) => {
                    const isActive = item.id === activeItem;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        title={collapsed ? item.label : undefined}
                        onClick={item.onClick}
                        className={cn(
                          'flex h-10 w-full items-center rounded-lg text-left transition-colors',
                          collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                          isActive
                            ? 'border-l-4 border-l-[#ec4899] bg-[#ec4899]/10 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-[13px] font-semibold">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 px-3 pb-3 pt-2.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isLogout = item.id === 'logout';
          return (
            <button
              key={item.id}
              title={collapsed ? item.label : undefined}
              onClick={item.onClick}
              className={cn(
                'flex h-9 w-full items-center rounded-lg transition-colors',
                collapsed ? 'justify-center px-0' : 'gap-3 px-4'
              )}
            >
              <Icon className={cn('h-3.5 w-3.5 shrink-0', isLogout ? 'text-[#ff5a67]' : 'text-white/80')} />
              {!collapsed && (
                <span className={cn('text-[12px] font-semibold', isLogout ? 'text-[#ff5a67]' : 'text-white/85')}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
