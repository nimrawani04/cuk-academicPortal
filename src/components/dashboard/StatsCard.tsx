import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatsCardProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  value: number | string;
  accentClass: string;
};

export const StatsCard = ({ icon: Icon, title, subtitle, value, accentClass }: StatsCardProps) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_2px_6px_rgba(15,23,42,0.05)]">
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn('rounded-lg p-3', accentClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <p className="text-[46px] font-semibold leading-none text-slate-900">{value}</p>
    </div>
  );
};
