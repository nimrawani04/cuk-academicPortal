import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';

const StudentDashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();
  const [activeItem, setActiveItem] = useState('notices');
  const [submissionUrlByAssignment, setSubmissionUrlByAssignment] = useState<Record<string, string>>({});
  const [leaveForm, setLeaveForm] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
    contactInfo: '',
  });
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    department: '',
    phone: '',
    avatarUrl: '',
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

  const submitAssignment = useSubmitAssignment();
  const createLeave = useCreateLeaveApplication();
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.full_name || '',
        department: profile.department || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatar_url || '',
      });
    }
  }, [profile]);

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

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      {
        full_name: profileForm.fullName || null,
        department: profileForm.department || null,
        phone: profileForm.phone || null,
        avatar_url: profileForm.avatarUrl || null,
      },
      {
        onSuccess: () => toast({ title: 'Profile updated', description: 'Your profile changes are saved.' }),
        onError: (err: any) =>
          toast({ title: 'Profile update failed', description: err?.message || 'Please try again.', variant: 'destructive' }),
      }
    );
  };

  const renderOverview = () => (
    <>
      <WelcomeSection name={displayName} />

      <section className="mb-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={BookOpen} title="Enrolled Courses" subtitle="This semester" value={enrollments.length} accentClass="bg-[#e6efff] text-[#245ed4]" />
        <StatsCard icon={ClipboardList} title="Assignments Pending" subtitle="This semester" value={pendingAssignments.length} accentClass="bg-[#fde8f3] text-[#d42682]" />
        <StatsCard icon={FolderOpen} title="Average Marks" subtitle="Current score" value={averageMarks} accentClass="bg-[#e8f8ee] text-[#1f8c50]" />
        <StatsCard icon={Calendar} title="Upcoming Deadlines" subtitle="Next 14 days" value={upcomingDeadlines.length} accentClass="bg-[#f8eedf] text-[#f3a629]" />
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
      <h2 className="mb-4 text-[24px] font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_6px_rgba(15,23,42,0.05)]">{content}</div>
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
              <div key={en.id} className="rounded-lg border border-slate-200 px-4 py-3">
                <p className="text-[16px] font-semibold">{en.subjects?.name || 'Subject'}</p>
                <p className="text-sm text-slate-500">{en.subjects?.code} · Semester {en.subjects?.semester} · {en.classes?.name || 'Class'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">You are not enrolled in any courses yet.</p>
        )
      );
    }

    if (activeItem === 'exams') {
      return sectionShell(
        'Exams & Upcoming Assessments',
        upcomingDeadlines.length ? (
          <ul className="space-y-2">
            {upcomingDeadlines.map((d) => (
              <li key={d} className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700">{d}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No upcoming exams or deadlines.</p>
        )
      );
    }

    if (activeItem === 'marks') {
      return sectionShell(
        'My Marks',
        marks.length ? (
          <div className="space-y-3">
            {marks.map((m: any) => (
              <div key={m.id} className="rounded-lg border border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{m.subjects?.name || 'Subject'}</p>
                  <p className="text-sm font-semibold text-[#245ed4]">Grade {m.grade || '-'}</p>
                </div>
                <p className="text-sm text-slate-500">Total: {m.total_marks ?? 0}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No marks published yet.</p>
        )
      );
    }

    if (activeItem === 'performance') {
      return sectionShell(
        'Performance Overview',
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 px-4 py-4">
            <p className="text-sm text-slate-500">Average Marks</p>
            <p className="text-3xl font-semibold">{averageMarks}</p>
          </div>
          <div className="rounded-lg border border-slate-200 px-4 py-4">
            <p className="text-sm text-slate-500">Attendance Rate</p>
            <p className="text-3xl font-semibold">{attendanceRate}</p>
          </div>
        </div>
      );
    }

    if (activeItem === 'resources') {
      return sectionShell(
        'Learning Resources',
        resources.length ? (
          <div className="space-y-3">
            {resources.slice(0, 20).map((r: any) => (
              <div key={r.id} className="rounded-lg border border-slate-200 px-4 py-3">
                <p className="font-semibold">{r.title}</p>
                <p className="text-sm text-slate-500">{r.subjects?.name || 'General'} · {r.resource_type}</p>
                {r.file_url ? (
                  <a className="mt-1 inline-block text-xs font-semibold text-[#245ed4] hover:underline" href={r.file_url} target="_blank" rel="noreferrer">
                    Open Resource
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No resources available.</p>
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
                <div key={a.id} className="rounded-lg border border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{a.title}</p>
                    <p className={`text-xs font-semibold ${submitted ? 'text-[#1f8c50]' : 'text-[#d42682]'}`}>{submitted ? 'Submitted' : 'Pending'}</p>
                  </div>
                  <p className="text-sm text-slate-500">Due: {new Date(a.due_date).toLocaleDateString()}</p>
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
          <p className="text-sm text-slate-500">No assignments available.</p>
        )
      );
    }

    if (activeItem === 'library') {
      return sectionShell(
        'Library',
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Issued Books</p>
            {issues.length ? (
              <ul className="space-y-2">
                {issues.map((issue: any) => (
                  <li key={issue.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    {issue.library_books?.title || 'Book'} ({issue.status})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No books issued.</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Available Books</p>
            <p className="text-3xl font-semibold">{books.filter((b: any) => b.available_copies > 0).length}</p>
            <p className="text-sm text-slate-500">out of {books.length} total titles</p>
          </div>
        </div>
      );
    }

    if (activeItem === 'leave') {
      return sectionShell(
        'Leave Management',
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <form onSubmit={handleLeaveSubmit} className="space-y-3 rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Apply for Leave</h3>
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

          <div className="space-y-3 rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Leave History</h3>
            {leaves.length ? (
              leaves.map((l: any) => (
                <div key={l.id} className="rounded-lg border border-slate-200 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{l.leave_type}</p>
                    <p className="text-xs font-semibold uppercase text-slate-600">{l.status}</p>
                  </div>
                  <p className="text-xs text-slate-500">{l.from_date} to {l.to_date}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No leave applications submitted yet.</p>
            )}
          </div>
        </div>
      );
    }

    if (activeItem === 'profile') {
      return sectionShell(
        'Profile Management',
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={profileForm.fullName} onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profile?.email || user?.email || ''} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input value={profileForm.department} onChange={(e) => setProfileForm((p) => ({ ...p, department: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Avatar URL</Label>
            <Input value={profileForm.avatarUrl} onChange={(e) => setProfileForm((p) => ({ ...p, avatarUrl: e.target.value }))} />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={updateProfile.isPending}>Save Profile</Button>
            <Button type="button" variant="outline" onClick={() => toast({ title: 'Password change', description: 'Use Supabase reset password flow from Auth page.' })}>
              Change Password
            </Button>
          </div>
        </form>
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
    >
      {renderSection()}
    </DashboardLayout>
  );
};

export default StudentDashboard;