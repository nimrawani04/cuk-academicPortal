import { useState } from 'react';
import { useTeacherSubjects } from '@/hooks/useSubjects';
import { useMarksBySubject, useUpsertMarks, useUpdateMarks } from '@/hooks/useMarks';
import { useEnrolledStudents } from '@/hooks/useAttendance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList, Save } from 'lucide-react';

export function TeacherMarks() {
  const { data: subjects, isLoading: loadingSubjects } = useTeacherSubjects();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const { data: marks, isLoading: loadingMarks } = useMarksBySubject(selectedSubject);
  const { data: enrolledStudents } = useEnrolledStudents(selectedSubject);
  const upsertMarks = useUpsertMarks();
  const updateMarks = useUpdateMarks();
  const { toast } = useToast();
  const [marksData, setMarksData] = useState<Record<string, any>>({});

  const handleMarksChange = (studentId: string, field: string, value: string) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value ? parseFloat(value) : null,
      },
    }));
  };

  const handleSaveMarks = async (studentId: string, existingMark: any) => {
    if (!selectedSubject) return;

    const studentMarks = marksData[studentId] || {};
    const data = {
      student_id: studentId,
      subject_id: selectedSubject,
      test1_marks: studentMarks.test1_marks ?? existingMark?.test1_marks ?? null,
      test2_marks: studentMarks.test2_marks ?? existingMark?.test2_marks ?? null,
      presentation_marks: studentMarks.presentation_marks ?? existingMark?.presentation_marks ?? null,
      assignment_marks: studentMarks.assignment_marks ?? existingMark?.assignment_marks ?? null,
      attendance_marks: studentMarks.attendance_marks ?? existingMark?.attendance_marks ?? null,
    };

    try {
      if (existingMark) {
        await updateMarks.mutateAsync({ id: existingMark.id, ...data });
      } else {
        await upsertMarks.mutateAsync(data);
      }
      toast({ title: 'Marks saved successfully' });
      setMarksData((prev) => ({ ...prev, [studentId]: {} }));
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  // Merge enrolled students with their marks
  const studentsWithMarks = enrolledStudents?.map((enrollment: any) => {
    const studentMark = marks?.find((m: any) => m.student_id === enrollment.student_id);
    return {
      ...enrollment,
      marks: studentMark,
    };
  }) || [];

  if (loadingSubjects) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Marks Management</CardTitle>
          <CardDescription>Upload and manage student marks by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Select value={selectedSubject || ''} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects?.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSubject ? (
            loadingMarks ? (
              <div className="text-center py-8">Loading marks...</div>
            ) : studentsWithMarks.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Enrollment No.</TableHead>
                      <TableHead>Test I (20)</TableHead>
                      <TableHead>Test II (20)</TableHead>
                      <TableHead>Presentation (20)</TableHead>
                      <TableHead>Assignment (20)</TableHead>
                      <TableHead>Attendance (5)</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsWithMarks.map((student: any) => {
                      const existingMark = student.marks;
                      const currentData = marksData[student.student_id] || {};
                      return (
                        <TableRow key={student.id}>
                          <TableCell>{student.profiles?.full_name}</TableCell>
                          <TableCell>{student.profiles?.enrollment_number}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              className="w-16"
                              defaultValue={existingMark?.test1_marks ?? ''}
                              onChange={(e) => handleMarksChange(student.student_id, 'test1_marks', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              className="w-16"
                              defaultValue={existingMark?.test2_marks ?? ''}
                              onChange={(e) => handleMarksChange(student.student_id, 'test2_marks', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              className="w-16"
                              defaultValue={existingMark?.presentation_marks ?? ''}
                              onChange={(e) => handleMarksChange(student.student_id, 'presentation_marks', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              className="w-16"
                              defaultValue={existingMark?.assignment_marks ?? ''}
                              onChange={(e) => handleMarksChange(student.student_id, 'assignment_marks', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="5"
                              className="w-16"
                              defaultValue={existingMark?.attendance_marks ?? ''}
                              onChange={(e) => handleMarksChange(student.student_id, 'attendance_marks', e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{existingMark?.total_marks ?? '-'}</TableCell>
                          <TableCell className="font-bold">{existingMark?.grade ?? '-'}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleSaveMarks(student.student_id, existingMark)}
                              disabled={upsertMarks.isPending || updateMarks.isPending}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No students enrolled in this subject
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Select a subject to manage marks</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Marking Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-medium">95%+</p>
              <p className="text-muted-foreground">5 marks</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-medium">85-94%</p>
              <p className="text-muted-foreground">4 marks</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-medium">75-84%</p>
              <p className="text-muted-foreground">3 marks</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-medium">65-74%</p>
              <p className="text-muted-foreground">2 marks</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-medium">&lt;65%</p>
              <p className="text-muted-foreground">1 mark</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
