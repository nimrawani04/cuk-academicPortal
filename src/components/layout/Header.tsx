import { Bell, Moon, Sun, Megaphone, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotices } from '@/hooks/useNotices';
import { useUpcomingExams } from '@/hooks/useExams';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  onToggleTheme,
  darkMode,
  onOpenShortcuts,
}: HeaderProps) => {
  const { data: notices } = useNotices();
  const { data: exams } = useUpcomingExams();

  const recentNotices = (notices || []).slice(0, 5);
  const upcomingExams = (exams || []).slice(0, 5);
  const totalCount = recentNotices.length + upcomingExams.length;

  const priorityColor = (p: string) => {
    if (p === 'urgent') return 'bg-red-500/10 text-red-600 border-red-200';
    if (p === 'important') return 'bg-amber-500/10 text-amber-600 border-amber-200';
    return '';
  };

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
                {totalCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e33f96] px-1 text-[11px] font-semibold text-white">
                    {totalCount > 9 ? '9+' : totalCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl p-0">
              <ScrollArea className="max-h-[400px]">
                {recentNotices.length > 0 && (
                  <>
                    <DropdownMenuLabel className="flex items-center gap-2 px-4 pt-3 pb-1">
                      <Megaphone className="h-4 w-4 text-primary" />
                      Recent Notices
                    </DropdownMenuLabel>
                    {recentNotices.map((notice) => (
                      <DropdownMenuItem key={notice.id} className="flex flex-col items-start gap-1 px-4 py-2.5 cursor-default">
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="truncate font-medium text-sm">{notice.title}</span>
                          {notice.priority !== 'normal' && (
                            <Badge variant="outline" className={`text-[10px] shrink-0 ${priorityColor(notice.priority)}`}>
                              {notice.priority}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                {upcomingExams.length > 0 && (
                  <>
                    {recentNotices.length > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel className="flex items-center gap-2 px-4 pt-2 pb-1">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      Upcoming Exams
                    </DropdownMenuLabel>
                    {upcomingExams.map((exam) => (
                      <DropdownMenuItem key={exam.id} className="flex flex-col items-start gap-1 px-4 py-2.5 cursor-default">
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="truncate font-medium text-sm">{exam.title}</span>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {exam.exam_type}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {exam.exam_date} {exam.subjects?.name ? `· ${exam.subjects.name}` : ''}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                {totalCount === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                )}
              </ScrollArea>
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
