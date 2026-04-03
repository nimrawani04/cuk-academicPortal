import { useMemo, useState, type ReactNode } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import {
  Bell,
  BookOpen,
  Calendar,
  ClipboardList,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  User,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/Layout';
import type { SidebarItem } from '@/components/layout/types';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { NoticeList } from '@/components/dashboard/NoticeList';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNotices } from '@/hooks/useNotices';
import { useStudentEnrollments } from '@/hooks/useEnrollments';
import { useAssignments, useStudentSubmissions, useSubmitAssignment } from '@/hooks/useAssignments';
import { useStudentMarks } from '@/hooks/useMarks';
import { useStudentAttendance } from '@/hooks/useAttendance';
import { useResources } from '@/hooks/useResources';
import { useLibraryBooks, useStudentBookIssues } from '@/hooks/useLibrary';
import { useCreateLeaveApplication, useStudentLeaveApplications } from '@/hooks/useLeaveApplications';
import { useProfile } from '@/hooks/useProfile';
import { useUpcomingExams } from '@/hooks/useExams';
import { PerformanceCharts } from '@/components/student/PerformanceCharts';
import { ProfileEditor } from '@/components/profile/ProfileEditor';

const StudentDashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();
  useRealtimeNotifications();
  const [activeItem, setActiveItem] = useState('notices');
  const [submissionUrlByAssignment, setSubmissionUrlByAssignment] = useState<Record<string, string>>({});
  const [leaveForm, setLeaveForm] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
    contactInfo: '',
  });

  const { data: notices = [] } = useNotices();
  const { data: enrollments = [] } = useStudentEnrollments();
  const { data: assignments = [] } = useAssignments();
  const { data: submissions = [] } = useStudentSubmissions();
  const { data: marks = [] } = useStudentMarks();
  const { data: attendance = [] } = useStudentAttendance();
  const { data: resources = [] } = useResources();
  const { data: books = [] } = useLibraryBooks();
  const { data: issues = [] } = useStudentBookIssues();
  const { data: leaves = [] } = useStudentLeaveApplications();
  const { data: profile } = useProfile();
  const { data: upcomingExams = [] } = useUpcomingExams();

  const submitAssignment = useSubmitAssignment();
  const createLeave = useCreateLeaveApplication();
  


  const displayName = useMemo(() => {
    const prefix = (profile?.full_name?.trim() || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student') as string;
    return prefix
      .split(/[._-]/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  }, [profile?.full_name, user?.user_metadata?.full_name, user?.email]);

  const subjectIds = useMemo(() => new Set(enrollments.map((e: any) => e.subject_id)), [enrollments]);

  const studentAssignments = useMemo(
    () => assignments.filter((a: any) => subjectIds.has(a.subject_id)),
    [assignments, subjectIds]
  );

  const submittedSet = useMemo(() => new Set(submissions.map((s: any) => s.assignment_id)), [submissions]);

  const pendingAssignments = useMemo(
    () => studentAssignments.filter((a: any) => !submittedSet.has(a.id)),
    [studentAssignments, submittedSet]
  );

  const upcomingDeadlines = useMemo(
    () =>
      pendingAssignments
        .map((a: any) => ({ title: a.title, due: a.due_date }))
        .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
        .slice(0, 3)
        .map((d) => `${d.title} - ${new Date(d.due).toLocaleDateString()}`),
    [pendingAssignments]
  );

  const averageMarks = useMemo(() => {
    if (!marks.length) return '0%';
    const totals = marks.map((m: any) => Number(m.total_marks || 0));
    const avg = totals.reduce((sum, n) => sum + n, 0) / totals.length;
    return `${Math.round(avg)}%`;
  }, [marks]);

  const attendanceRate = useMemo(() => {
    if (!attendance.length) return '0%';
    const presentCount = attendance.filter((a: any) => a.status === 'present' || a.status === 'late').length;
    return `${Math.round((presentCount / attendance.length) * 100)}%`;
  }, [attendance]);

  const mappedNotices = useMemo(
    () =>
      notices.slice(0, 6).map((n: any) => ({
        id: n.id,
        title: n.title,
        description: n.content,
        date: new Date(n.created_at).toLocaleDateString(),
        tag: (n.priority === 'urgent' ? 'Important' : n.title?.toLowerCase().includes('exam') ? 'Exam' : 'General') as
          | 'Important'
          | 'Exam'
          | 'Holiday'
          | 'General',
      })),
    [notices]
  );

  const primaryItems = useMemo<SidebarItem[]>(
    () => [
      { id: 'notices', label: 'Notices', icon: Bell, section: 'Dashboard', onClick: () => setActiveItem('notices') },
      { id: 'courses', label: 'My Courses', icon: BookOpen, section: 'Dashboard', onClick: () => setActiveItem('courses') },
      { id: 'exams', label: 'Exams', icon: Calendar, section: 'Dashboard', onClick: () => setActiveItem('exams') },
      { id: 'marks', label: 'Marks', icon: GraduationCap, section: 'Dashboard', onClick: () => setActiveItem('marks') },
      { id: 'performance', label: 'Performance', icon: TrendingUp, section: 'Dashboard', onClick: () => setActiveItem('performance') },
      { id: 'resources', label: 'Resources', icon: FolderOpen, section: 'Academic', onClick: () => setActiveItem('resources') },
      { id: 'assignments', label: 'Assignments', icon: ClipboardList, section: 'Academic', onClick: () => setActiveItem('assignments') },
      { id: 'library', label: 'Library', icon: BookOpen, section: 'Academic', onClick: () => setActiveItem('library') },
      { id: 'leave', label: 'Leave', icon: Calendar, section: 'Academic', onClick: () => setActiveItem('leave') },
    ],
    []
  );

  const bottomItems = useMemo<SidebarItem[]>(
    () => [
      { id: 'profile', label: 'Profile', icon: User, onClick: () => setActiveItem('profile') },
      { id: 'logout', label: 'Logout', icon: LogOut, onClick: signOut },
    ],
    [signOut]
  );

  const handleAssignmentSubmit = (assignmentId: string) => {
    const submissionUrl = submissionUrlByAssignment[assignmentId]?.trim();
    if (!submissionUrl) {
      toast({ title: 'Missing URL', description: 'Please paste your submission URL.', variant: 'destructive' });
      return;
    }

    submitAssignment.mutate(
      { assignmentId, submissionUrl },
      {
        onSuccess: () => {
          toast({ title: 'Submitted', description: 'Assignment submitted successfully.' });
          setSubmissionUrlByAssignment((prev) => ({ ...prev, [assignmentId]: '' }));
        },
        onError: (err: any) => {
          toast({ title: 'Submission failed', description: err?.message || 'Please try again.', variant: 'destructive' });
        },
      }
    );
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.leaveType || !leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) {
      toast({ title: 'Missing fields', description: 'Fill leave type, dates and reason.', variant: 'destructive' });
      return;
    }

    createLeave.mutate(
      {
        leave_type: leaveForm.leaveType,
        from_date: leaveForm.fromDate,
        to_date: leaveForm.toDate,
        reason: leaveForm.reason,
        contact_info: leaveForm.contactInfo || null,
        priority: 'normal',
      },
      {
        onSuccess: () => {
          toast({ title: 'Leave applied', description: 'Your leave application has been submitted.' });
          setLeaveForm({ leaveType: '', fromDate: '', toDate: '', reason: '', contactInfo: '' });
        },
        onError: (err: any) => {
          toast({ title: 'Leave apply failed', description: err?.message || 'Please try again.', variant: 'destructive' });
        },
      }
    );
  };


  const renderOverview = () => (
    <>
      <WelcomeSection name={displayName} onUploadAssignment={() => setActiveItem('assignments')} />

      <section className="mb-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={BookOpen} title="Enrolled Courses" subtitle="This semester" value={enrollments.length} colorIndex={0} />
        <StatsCard icon={ClipboardList} title="Assignments Pending" subtitle="This semester" value={pendingAssignments.length} colorIndex={1} />
        <StatsCard icon={FolderOpen} title="Average Marks" subtitle="Current score" value={averageMarks} colorIndex={2} />
        <StatsCard icon={Calendar} title="Upcoming Deadlines" subtitle="Next 14 days" value={upcomingDeadlines.length} colorIndex={3} />
      </section>

      <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <NoticeList notices={mappedNotices} />
        <QuickActions
          deadlines={upcomingDeadlines}
          onUploadAssignment={() => setActiveItem('assignments')}
          onViewMarks={() => setActiveItem('marks')}
          onContactFaculty={() => setActiveItem('courses')}
        />
      </div>
    </>
  );

  const sectionShell = (title: string, content: ReactNode) => (
    <section>
      <h2 className="mb-4 text-[24px] font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">{content}</div>
    </section>
  );

  const renderSection = () => {
    if (activeItem === 'notices') return renderOverview();

    if (activeItem === 'courses') {
      return sectionShell(
        'My Courses',
        enrollments.length ? (
          <div className="space-y-3">
            {enrollments.map((en: any) => (
              <div key={en.id} className="rounded-lg border border-border px-4 py-3">
                <p className="text-[16px] font-semibold">{en.subjects?.name || 'Subject'}</p>
                <p className="text-sm text-muted-foreground">{en.subjects?.code} · Semester {en.subjects?.semester} · {en.classes?.name || 'Class'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">You are not enrolled in any courses yet.</p>
        )
      );
    }

    if (activeItem === 'exams') {
      return sectionShell(
        'Exam Schedule',
        upcomingExams.length ? (
          <div className="space-y-3">
            {upcomingExams.map((exam: any) => {
              const examDate = new Date(exam.exam_date);
              const isPast = examDate < new Date(new Date().toDateString());
              const isToday = exam.exam_date === new Date().toISOString().split('T')[0];
              return (
                <div
                  key={exam.id}
                  className={`rounded-xl border px-5 py-4 transition-colors ${
                    isToday
                      ? 'border-primary/40 bg-primary/5'
                      : isPast
                      ? 'border-border bg-muted opacity-60'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[16px] font-semibold text-foreground">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {exam.subjects?.name || 'N/A'} · {exam.subjects?.code || ''}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        exam.exam_type === 'final'
                          ? 'bg-red-100 text-red-700'
                          : exam.exam_type === 'midterm'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {exam.exam_type.charAt(0).toUpperCase() + exam.exam_type.slice(1)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {examDate.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                      {isToday && <span className="ml-1 text-xs font-bold text-primary">TODAY</span>}
                    </span>
                    {(exam.start_time || exam.end_time) && (
                      <span>
                        🕐 {exam.start_time?.slice(0, 5) || '?'} – {exam.end_time?.slice(0, 5) || '?'}
                      </span>
                    )}
                    {exam.room && <span>📍 {exam.room}</span>}
                  </div>
                  {exam.notes && (
                    <p className="mt-2 text-xs text-muted-foreground italic">{exam.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming exams scheduled.</p>
        )
      );
    }

    if (activeItem === 'marks') {
      return sectionShell(
        'My Marks',
        marks.length ? (
          <div className="space-y-4">
            {marks.map((m: any) => (
              <div key={m.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[16px] font-semibold">{m.subjects?.name || 'Subject'}</p>
                  <span className="rounded-full bg-primary/10 px-3 py-0.5 text-sm font-bold text-primary">
                    {m.grade || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Test I', value: m.test1_marks, max: 20 },
                    { label: 'Test II', value: m.test2_marks, max: 20 },
                    { label: 'Presentation', value: m.presentation_marks, max: 20 },
                    { label: 'Assignment', value: m.assignment_marks, max: 20 },
                    { label: 'Attendance', value: m.attendance_marks, max: 5 },
                    { label: 'Total', value: m.total_marks, max: 100 },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-lg p-2.5 text-center ${item.label === 'Total' ? 'bg-primary/10' : 'bg-muted'}`}>
                      <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                      <p className={`text-lg font-bold ${item.label === 'Total' ? 'text-primary' : 'text-foreground'}`}>
                        {item.value ?? '-'}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70">/ {item.max}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No marks published yet.</p>
        )
      );
    }

    if (activeItem === 'performance') {
      return (
        <section>
          <h2 className="mb-4 text-[24px] font-semibold tracking-tight text-foreground">Performance Overview</h2>
          <PerformanceCharts marks={marks as any} attendance={attendance as any} />
        </section>
      );
    }

    if (activeItem === 'resources') {
      return sectionShell(
        'Learning Resources',
        resources.length ? (
          <div className="space-y-3">
            {resources.slice(0, 20).map((r: any) => (
              <div key={r.id} className="rounded-lg border border-border px-4 py-3">
                <p className="font-semibold">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.subjects?.name || 'General'} · {r.resource_type}</p>
                {r.file_url ? (
                  <a className="mt-1 inline-block text-xs font-semibold text-primary hover:underline" href={r.file_url} target="_blank" rel="noreferrer">
                    Open Resource
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No resources available.</p>
        )
      );
    }

    if (activeItem === 'assignments') {
      return sectionShell(
        'Assignments',
        studentAssignments.length ? (
          <div className="space-y-4">
            {studentAssignments.map((a: any) => {
              const submitted = submittedSet.has(a.id);
              return (
                <div key={a.id} className="rounded-lg border border-border px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{a.title}</p>
                    <p className={`text-xs font-semibold ${submitted ? 'text-emerald-600' : 'text-destructive'}`}>{submitted ? 'Submitted' : 'Pending'}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Due: {new Date(a.due_date).toLocaleDateString()}</p>
                  {!submitted && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Input
                        placeholder="Paste submission URL"
                        value={submissionUrlByAssignment[a.id] || ''}
                        onChange={(e) =>
                          setSubmissionUrlByAssignment((prev) => ({
                            ...prev,
                            [a.id]: e.target.value,
                          }))
                        }
                        className="h-9 max-w-md"
                      />
                      <Button
                        className="h-9"
                        onClick={() => handleAssignmentSubmit(a.id)}
                        disabled={submitAssignment.isPending}
                      >
                        Submit
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No assignments available.</p>
        )
      );
    }

    if (activeItem === 'library') {
      return sectionShell(
        'Library',
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground/80">Issued Books</p>
            {issues.length ? (
              <ul className="space-y-2">
                {issues.map((issue: any) => (
                  <li key={issue.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                    {issue.library_books?.title || 'Book'} ({issue.status})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No books issued.</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground/80">Available Books</p>
            <p className="text-3xl font-semibold">{books.filter((b: any) => b.available_copies > 0).length}</p>
            <p className="text-sm text-muted-foreground">out of {books.length} total titles</p>
          </div>
        </div>
      );
    }

    if (activeItem === 'leave') {
      return sectionShell(
        'Leave Management',
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <form onSubmit={handleLeaveSubmit} className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground/80">Apply for Leave</h3>
            <div className="space-y-1.5">
              <Label>Leave Type</Label>
              <Input value={leaveForm.leaveType} onChange={(e) => setLeaveForm((p) => ({ ...p, leaveType: e.target.value }))} placeholder="Medical / Personal" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>From</Label>
                <Input type="date" value={leaveForm.fromDate} onChange={(e) => setLeaveForm((p) => ({ ...p, fromDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>To</Label>
                <Input type="date" value={leaveForm.toDate} onChange={(e) => setLeaveForm((p) => ({ ...p, toDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Textarea value={leaveForm.reason} onChange={(e) => setLeaveForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Reason for leave" />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Info</Label>
              <Input value={leaveForm.contactInfo} onChange={(e) => setLeaveForm((p) => ({ ...p, contactInfo: e.target.value }))} placeholder="Phone / Email" />
            </div>
            <Button type="submit" disabled={createLeave.isPending}>Submit Leave Request</Button>
          </form>

          <div className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground/80">Leave History</h3>
            {leaves.length ? (
              leaves.map((l: any) => (
                <div key={l.id} className="rounded-lg border border-border px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{l.leave_type}</p>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">{l.status}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{l.from_date} to {l.to_date}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No leave applications submitted yet.</p>
            )}
          </div>
        </div>
      );
    }

    if (activeItem === 'profile') {
      return (
        <section>
          <h2 className="mb-4 text-[24px] font-semibold tracking-tight text-foreground">Profile Management</h2>
          <ProfileEditor />
        </section>
      );
    }

    return renderOverview();
  };

  return (
    <DashboardLayout
      appName="Academic"
      appSubtitle="Student Portal"
      logoSrc="/favicon.ico"
      userName={displayName}
      role={userRole ?? 'student'}
      activeItem={activeItem}
      primaryItems={primaryItems}
      bottomItems={bottomItems}
      onNavigate={setActiveItem}
    >
      {renderSection()}
    </DashboardLayout>
  );
};

export default StudentDashboard;