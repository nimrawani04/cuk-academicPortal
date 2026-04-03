import { Bell } from 'lucide-react';

export type NoticeItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  tag: 'Important' | 'Exam' | 'Holiday' | 'General';
};

type NoticeListProps = {
  notices: NoticeItem[];
  onViewAll?: () => void;
};

const tagClass: Record<NoticeItem['tag'], string> = {
  Important: 'bg-destructive/10 text-destructive',
  Exam: 'bg-primary/10 text-primary',
  Holiday: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  General: 'bg-muted text-muted-foreground',
};

export const NoticeList = ({ notices, onViewAll }: NoticeListProps) => {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[22px] font-semibold tracking-tight text-foreground">Latest Notices</h2>
        <button onClick={onViewAll} className="text-[15px] text-primary hover:underline">View All</button>
      </div>

      {notices.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-5 py-10 text-center shadow-sm">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-[24px] font-semibold text-foreground">No new notices</p>
          <p className="mt-1 text-[15px] text-muted-foreground">You are all caught up for now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <article key={notice.id} className="rounded-xl border border-border bg-card px-5 py-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-[18px] font-semibold text-foreground">{notice.title}</h3>
                  <p className="mt-1 text-[14px] text-muted-foreground">{notice.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tagClass[notice.tag]}`}>{notice.tag}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{notice.date}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
