import { Bell, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type HeaderProps = {
  breadcrumb: string[];
  subtitle: string;
  userName: string;
  initials: string;
  notificationCount: number;
  onToggleTheme: () => void;
  darkMode: boolean;
  onOpenShortcuts: () => void;
};

export const Header = ({
  breadcrumb,
  subtitle,
  userName,
  initials,
  notificationCount,
  onToggleTheme,
  darkMode,
  onOpenShortcuts,
}: HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#f9fbfd] px-5 py-3 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{breadcrumb.join(' > ')}</p>
          <p className="text-[15px] text-slate-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Button variant="outline" onClick={onOpenShortcuts} className="hidden h-11 rounded-xl px-5 text-[15px] md:flex">
            Shortcuts
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white">
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e33f96] px-1 text-[11px] font-semibold text-white">
                    {notificationCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl">
              <DropdownMenuItem>New notice published</DropdownMenuItem>
              <DropdownMenuItem>Assignment deadline tomorrow</DropdownMenuItem>
              <DropdownMenuItem>Semester calendar updated</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={onToggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
              {initials}
            </div>
            <p className="text-[17px] font-semibold text-slate-800">{userName}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
