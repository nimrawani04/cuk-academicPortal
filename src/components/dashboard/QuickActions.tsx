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
        <h2 className="mb-4 text-[22px] font-semibold tracking-tight">Upcoming Deadlines</h2>
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-[0_2px_6px_rgba(15,23,42,0.05)]">
          {deadlines.length ? (
            <ul className="space-y-3 text-sm text-slate-700">
              {deadlines.map((d) => (
                <li key={d} className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#e33f96]" />
                  {d}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No upcoming deadlines yet.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-[22px] font-semibold tracking-tight">Quick Actions</h2>
        <div className="rounded-xl border border-slate-200 bg-transparent px-1">
          <button onClick={onUploadAssignment} className="flex w-full items-center border-b border-slate-200 py-4 text-left text-[16px] font-semibold text-slate-800 hover:text-[#cf2d82]">
            <Upload className="mr-3 h-4 w-4 text-[#e33f96]" />
            Upload Assignment
          </button>
          <button onClick={onViewMarks} className="flex w-full items-center border-b border-slate-200 py-4 text-left text-[16px] font-semibold text-slate-800 hover:text-[#cf2d82]">
            <GraduationCap className="mr-3 h-4 w-4 text-[#e33f96]" />
            View Marks
          </button>
          <button onClick={onContactFaculty} className="flex w-full items-center py-4 text-left text-[16px] font-semibold text-slate-800 hover:text-[#cf2d82]">
            <Mail className="mr-3 h-4 w-4 text-[#e33f96]" />
            Contact Faculty
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#f0c6dd] bg-[#f8deeb] px-5 py-4">
        <p className="text-[22px] font-semibold text-[#cf2d82]">Pro Tip</p>
        <p className="mt-1 text-[14px] text-[#b24882]">Complete assignments early to improve consistency.</p>
      </div>
    </section>
  );
};
