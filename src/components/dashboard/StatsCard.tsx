import type { LucideIcon } from 'lucide-react';

type StatsCardProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  value: number | string;
  colorIndex?: number;
};

const accentColors = [
  { bg: 'bg-primary/10', text: 'text-primary' },
  { bg: 'bg-destructive/10', text: 'text-destructive' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
];

export const StatsCard = ({ icon: Icon, title, subtitle, value, colorIndex = 0 }: StatsCardProps) => {
  const color = accentColors[colorIndex % accentColors.length];
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-5 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`rounded-lg p-3 ${color.bg} ${color.text}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <p className="text-[46px] font-semibold leading-none text-foreground">{value}</p>
    </div>
  );
};
