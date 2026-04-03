import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type WelcomeSectionProps = {
  name: string;
  onUploadAssignment?: () => void;
};

export const WelcomeSection = ({ name, onUploadAssignment }: WelcomeSectionProps) => {
  return (
    <section className="mb-12 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-8">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Welcome back, {name}</h1>
        <p className="mt-2 text-[16px] text-muted-foreground">Manage your academic activities efficiently.</p>
      </div>
      <Button
        onClick={onUploadAssignment}
        className="h-11 rounded-xl px-6 text-[15px] font-semibold"
        style={{ background: `hsl(var(--accent-hue), 70%, 45%)` }}
      >
        <Plus className="mr-2 h-4 w-4" />
        Upload Assignment
      </Button>
    </section>
  );
};
