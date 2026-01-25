import { useState } from 'react';
import { useTeacherSubjects } from '@/hooks/useSubjects';
import { useEnrolledStudents, useAttendanceBySubjectDate, useUpsertAttendance } from '@/hooks/useAttendance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Save } from 'lucide-react';
import { format } from 'date-fns';

export function TeacherAttendance() {
  const { data: subjects, isLoading: loadingSubjects } = useTeacherSubjects();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const { data: enrolledStudents } = useEnrolledStudents(selectedSubject);
  const { data: existingAttendance, isLoading: loadingAttendance } = useAttendanceBySubjectDate(selectedSubject, selectedDate);
  const upsertAttendance = useUpsertAttendance();
  const { toast } = useToast();
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async (studentId: string) => {
    if (!selectedSubject || !selectedDate) return;

    const existingRecord = existingAttendance?.find((a: any) => a.student_id === studentId);
    const status = attendanceData[studentId] || existingRecord?.status || 'present';

    try {
      await upsertAttendance.mutateAsync({
        student_id: studentId,
        subject_id: selectedSubject,
        date: selectedDate,
        status: status as 'present' | 'absent' | 'late' | 'on_leave',
      });
      toast({ title: 'Attendance saved' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600';
      case 'absent': return 'text-red-600';
      case 'late': return 'text-yellow-600';
      case 'on_leave': return 'text-blue-600';
      default: return '';
    }
  };

  // Merge enrolled students with their attendance
  const studentsWithAttendance = enrolledStudents?.map((enrollment: any) => {
    const attendance = existingAttendance?.find((a: any) => a.student_id === enrollment.student_id);
    return {
      ...enrollment,
      attendance,
    };
  }) || [];

  if (loadingSubjects) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Management</CardTitle>
        <CardDescription>Mark and track student attendance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
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
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48"
          />
        </div>

        {selectedSubject ? (
          loadingAttendance ? (
            <div className="text-center py-8">Loading attendance...</div>
          ) : studentsWithAttendance.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Enrollment No.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsWithAttendance.map((student: any) => {
                  const currentStatus = attendanceData[student.student_id] || student.attendance?.status || 'present';
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.profiles?.full_name}</TableCell>
                      <TableCell>{student.profiles?.enrollment_number}</TableCell>
                      <TableCell>
                        <Select 
                          value={currentStatus} 
                          onValueChange={(value) => handleStatusChange(student.student_id, value)}
                        >
                          <SelectTrigger className={`w-32 ${getStatusColor(currentStatus)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="on_leave">On Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleSaveAttendance(student.student_id)}
                          disabled={upsertAttendance.isPending}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No students enrolled in this subject
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Select a subject and date to mark attendance</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
