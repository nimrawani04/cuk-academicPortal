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
};

const tagClass: Record<NoticeItem['tag'], string> = {
  Important: 'bg-[#fde8f3] text-[#d42682]',
  Exam: 'bg-[#e6efff] text-[#245ed4]',
  Holiday: 'bg-[#e8f8ee] text-[#1f8c50]',
  General: 'bg-slate-100 text-slate-700',
};

export const NoticeList = ({ notices }: NoticeListProps) => {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[22px] font-semibold tracking-tight">Latest Notices</h2>
        <button className="text-[15px] text-[#e33f96] hover:underline">View All</button>
      </div>

      {notices.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center shadow-[0_2px_6px_rgba(15,23,42,0.05)]">
          <Bell className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-[24px] font-semibold text-slate-800">No new notices</p>
          <p className="mt-1 text-[15px] text-slate-500">You are all caught up for now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <article key={notice.id} className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_2px_6px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-[18px] font-semibold text-slate-900">{notice.title}</h3>
                  <p className="mt-1 text-[14px] text-slate-600">{notice.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tagClass[notice.tag]}`}>{notice.tag}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{notice.date}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
