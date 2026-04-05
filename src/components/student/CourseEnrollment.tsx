import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSubjects } from '@/hooks/useSubjects';
import { useStudentEnrollments, useEnrollStudent, useClasses } from '@/hooks/useEnrollments';

export function CourseEnrollment() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: subjects = [] } = useSubjects();
  const { data: enrollments = [], isLoading: loadingEnrollments } = useStudentEnrollments();
  const { data: classes = [] } = useClasses();
  const enrollStudent = useEnrollStudent();
  const { toast } = useToast();

  const studentDept = profile?.department || '';
  const studentSemester = profile?.semester || 0;

  // Get enrolled subject IDs
  const enrolledSubjectIds = useMemo(
    () => new Set(enrollments.map((e: any) => e.subject_id)),
    [enrollments]
  );

  // Filter subjects for the student's semester & department
  const semesterSubjects = useMemo(
    () =>
      subjects.filter(
        (s: any) =>
          s.semester === studentSemester &&
          s.department === studentDept
      ),
    [subjects, studentSemester, studentDept]
  );

  // Separate core and elective
  const coreSubjects = useMemo(
    () => semesterSubjects.filter((s: any) => (s as any).course_type !== 'elective'),
    [semesterSubjects]
  );

  const electiveSubjects = useMemo(
    () => semesterSubjects.filter((s: any) => (s as any).course_type === 'elective'),
    [semesterSubjects]
  );

  // Find a class for this student's department/semester
  const matchingClass = useMemo(
    () =>
      classes.find(
        (c: any) =>
          c.department === studentDept && c.semester === studentSemester
      ),
    [classes, studentDept, studentSemester]
  );

  const handleEnroll = async (subjectId: string) => {
    if (!matchingClass) {
      toast({
        title: 'No class found',
        description: 'No class exists for your department and semester. Contact admin.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await enrollStudent.mutateAsync({
        subjectId,
        classId: matchingClass.id,
      });
      toast({ title: 'Enrolled!', description: 'You have been enrolled in this course.' });
    } catch (err: any) {
      if (err?.message?.includes('duplicate')) {
        toast({ title: 'Already enrolled', description: 'You are already enrolled in this course.' });
      } else {
        toast({ title: 'Enrollment failed', description: err?.message || 'Please try again.', variant: 'destructive' });
      }
    }
  };

  // Auto-enroll in core subjects
  useEffect(() => {
    if (!matchingClass || !user || loadingEnrollments) return;

    const unenrolledCore = coreSubjects.filter((s: any) => !enrolledSubjectIds.has(s.id));
    if (unenrolledCore.length === 0) return;

    // Enroll in all core subjects automatically
    unenrolledCore.forEach((s: any) => {
      enrollStudent.mutate(
        { subjectId: s.id, classId: matchingClass.id },
        {
          onError: () => {}, // Silently ignore duplicates
        }
      );
    });
  }, [coreSubjects, enrolledSubjectIds, matchingClass, user, loadingEnrollments]);

  if (!studentDept || !studentSemester) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Please update your <span className="font-semibold">department</span> and{' '}
            <span className="font-semibold">semester</span> in your Profile to see available courses.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Core Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            Core Subjects (Semester {studentSemester})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coreSubjects.length > 0 ? (
            <div className="space-y-3">
              {coreSubjects.map((s: any) => {
                const isEnrolled = enrolledSubjectIds.has(s.id);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{s.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.code} · {s.credits} credits · {s.profiles?.full_name || 'TBA'}
                      </p>
                    </div>
                    {isEnrolled ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        <Check className="h-3 w-3 mr-1" /> Enrolled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Auto-enrolling...
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No core subjects for your current semester.</p>
          )}
        </CardContent>
      </Card>

      {/* Elective Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Elective Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          {electiveSubjects.length > 0 ? (
            <div className="space-y-3">
              {electiveSubjects.map((s: any) => {
                const isEnrolled = enrolledSubjectIds.has(s.id);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{s.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.code} · {s.credits} credits · {s.profiles?.full_name || 'TBA'}
                      </p>
                    </div>
                    {isEnrolled ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        <Check className="h-3 w-3 mr-1" /> Enrolled
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleEnroll(s.id)}
                        disabled={enrollStudent.isPending}
                      >
                        Enroll
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No elective subjects available for your semester.</p>
          )}
        </CardContent>
      </Card>

      {/* Currently Enrolled */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Enrolled Courses ({enrollments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <div className="space-y-2">
              {enrollments.map((en: any) => (
                <div key={en.id} className="rounded-lg border border-border px-4 py-3">
                  <p className="font-semibold">{en.subjects?.name || 'Subject'}</p>
                  <p className="text-sm text-muted-foreground">
                    {en.subjects?.code} · Semester {en.subjects?.semester} · {en.classes?.name || 'Class'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No enrollments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
