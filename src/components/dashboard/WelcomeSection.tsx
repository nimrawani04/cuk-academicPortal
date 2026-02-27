import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type WelcomeSectionProps = {
  name: string;
};

export const WelcomeSection = ({ name }: WelcomeSectionProps) => {
  return (
    <section className="mb-12 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-8">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Welcome back, {name}</h1>
        <p className="mt-2 text-[16px] text-slate-600">Manage your academic activities efficiently.</p>
      </div>
      <Button className="h-11 rounded-xl bg-[#23c3bc] px-6 text-[15px] font-semibold text-white hover:bg-[#1bb0aa]">
        <Plus className="mr-2 h-4 w-4" />
        Upload Assignment
      </Button>
    </section>
  );
};
