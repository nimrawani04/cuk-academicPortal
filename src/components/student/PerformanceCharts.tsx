import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';

type MarksRecord = {
  id: string;
  subjects?: { name: string; code: string } | null;
  test1_marks: number | null;
  test2_marks: number | null;
  presentation_marks: number | null;
  assignment_marks: number | null;
  attendance_marks: number | null;
  total_marks: number | null;
  grade: string | null;
};

type AttendanceRecord = {
  id: string;
  date: string;
  status: string;
  subjects?: { name: string } | null;
};

const COLORS = [
  'hsl(221, 72%, 49%)',
  'hsl(330, 68%, 49%)',
  'hsl(150, 63%, 34%)',
  'hsl(38, 90%, 55%)',
  'hsl(262, 52%, 47%)',
  'hsl(190, 70%, 42%)',
];

export function PerformanceCharts({
  marks,
  attendance,
}: {
  marks: MarksRecord[];
  attendance: AttendanceRecord[];
}) {
  // --- Marks bar chart data ---
  const marksBarData = useMemo(
    () =>
      marks.map((m) => ({
        subject: m.subjects?.code || m.subjects?.name || 'N/A',
        Test1: Number(m.test1_marks || 0),
        Test2: Number(m.test2_marks || 0),
        Presentation: Number(m.presentation_marks || 0),
        Assignment: Number(m.assignment_marks || 0),
        Attendance: Number(m.attendance_marks || 0),
        Total: Number(m.total_marks || 0),
      })),
    [marks],
  );

  // --- Radar chart: average component scores ---
  const radarData = useMemo(() => {
    if (!marks.length) return [];
    const avg = (key: keyof MarksRecord) =>
      marks.reduce((s, m) => s + Number((m as any)[key] || 0), 0) / marks.length;
    return [
      { metric: 'Test 1', value: Math.round(avg('test1_marks')), fullMark: 30 },
      { metric: 'Test 2', value: Math.round(avg('test2_marks')), fullMark: 30 },
      { metric: 'Presentation', value: Math.round(avg('presentation_marks')), fullMark: 15 },
      { metric: 'Assignment', value: Math.round(avg('assignment_marks')), fullMark: 15 },
      { metric: 'Attendance', value: Math.round(avg('attendance_marks')), fullMark: 10 },
    ];
  }, [marks]);

  // --- Attendance pie chart ---
  const attendancePieData = useMemo(() => {
    const counts = { Present: 0, Absent: 0, Late: 0, 'On Leave': 0 };
    attendance.forEach((a) => {
      if (a.status === 'present') counts.Present++;
      else if (a.status === 'absent') counts.Absent++;
      else if (a.status === 'late') counts.Late++;
      else counts['On Leave']++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [attendance]);

  // --- Attendance trend (area chart by date) ---
  const attendanceTrendData = useMemo(() => {
    const byDate = new Map<string, { total: number; present: number }>();
    const sorted = [...attendance].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach((a) => {
      const entry = byDate.get(a.date) || { total: 0, present: 0 };
      entry.total++;
      if (a.status === 'present' || a.status === 'late') entry.present++;
      byDate.set(a.date, entry);
    });
    let cumTotal = 0;
    let cumPresent = 0;
    return Array.from(byDate.entries()).map(([date, { total, present }]) => {
      cumTotal += total;
      cumPresent += present;
      return {
        date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        rate: Math.round((cumPresent / cumTotal) * 100),
      };
    });
  }, [attendance]);

  const PIE_COLORS = ['hsl(150, 63%, 34%)', 'hsl(0, 72%, 51%)', 'hsl(38, 90%, 55%)', 'hsl(221, 72%, 49%)'];

  const hasMarks = marks.length > 0;
  const hasAttendance = attendance.length > 0;

  if (!hasMarks && !hasAttendance) {
    return <p className="text-sm text-muted-foreground">No performance data available yet.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Average Marks"
          value={hasMarks ? `${Math.round(marks.reduce((s, m) => s + Number(m.total_marks || 0), 0) / marks.length)}%` : '-'}
        />
        <SummaryCard
          label="Attendance Rate"
          value={
            hasAttendance
              ? `${Math.round(
                  (attendance.filter((a) => a.status === 'present' || a.status === 'late').length /
                    attendance.length) *
                    100,
                )}%`
              : '-'
          }
        />
        <SummaryCard label="Subjects" value={hasMarks ? marks.length.toString() : '-'} />
      </div>

      {/* Marks breakdown bar chart */}
      {hasMarks && (
        <ChartCard title="Marks Breakdown by Subject">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={marksBarData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="subject" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="Test1" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Test2" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Presentation" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Assignment" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Attendance" fill={COLORS[4]} radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar chart */}
        {hasMarks && radarData.length > 0 && (
          <ChartCard title="Strengths Radar">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                <Radar dataKey="value" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Attendance pie */}
        {hasAttendance && (
          <ChartCard title="Attendance Distribution">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={attendancePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {attendancePieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Attendance trend */}
      {hasAttendance && attendanceTrendData.length > 1 && (
        <ChartCard title="Attendance Trend Over Time">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={attendanceTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${value}%`, 'Cumulative Rate']}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={COLORS[2]}
                fill={COLORS[2]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}
