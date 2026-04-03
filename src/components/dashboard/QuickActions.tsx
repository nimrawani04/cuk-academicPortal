import { Clock3, Upload, GraduationCap, Mail } from 'lucide-react';

type QuickActionsProps = {
  deadlines: string[];
  onUploadAssignment?: () => void;
  onViewMarks?: () => void;
  onContactFaculty?: () => void;
};

export const QuickActions = ({ deadlines, onUploadAssignment, onViewMarks, onContactFaculty }: QuickActionsProps) => {
  return (
    <section className="space-y-10">
      <div>
        <h2 className="mb-4 text-[22px] font-semibold tracking-tight text-foreground">Upcoming Deadlines</h2>
        <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          {deadlines.length ? (
            <ul className="space-y-3 text-sm text-foreground">
              {deadlines.map((d) => (
                <li key={d} className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  {d}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming deadlines yet.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-[22px] font-semibold tracking-tight text-foreground">Quick Actions</h2>
        <div className="rounded-xl border border-border bg-transparent px-1">
          <button onClick={onUploadAssignment} className="flex w-full items-center border-b border-border py-4 text-left text-[16px] font-semibold text-foreground hover:text-primary">
            <Upload className="mr-3 h-4 w-4 text-primary" />
            Upload Assignment
          </button>
          <button onClick={onViewMarks} className="flex w-full items-center border-b border-border py-4 text-left text-[16px] font-semibold text-foreground hover:text-primary">
            <GraduationCap className="mr-3 h-4 w-4 text-primary" />
            View Marks
          </button>
          <button onClick={onContactFaculty} className="flex w-full items-center py-4 text-left text-[16px] font-semibold text-foreground hover:text-primary">
            <Mail className="mr-3 h-4 w-4 text-primary" />
            Contact Faculty
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
        <p className="text-[22px] font-semibold text-primary">Pro Tip</p>
        <p className="mt-1 text-[14px] text-primary/70">Complete assignments early to improve consistency.</p>
      </div>
    </section>
  );
};
