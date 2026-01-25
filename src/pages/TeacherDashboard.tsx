import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, BookOpen, Calendar, ClipboardList, FolderOpen, UserCheck, LogOut } from 'lucide-react';
import { TeacherNotices } from '@/components/teacher/TeacherNotices';
import { TeacherMarks } from '@/components/teacher/TeacherMarks';
import { TeacherAttendance } from '@/components/teacher/TeacherAttendance';
import { TeacherAssignments } from '@/components/teacher/TeacherAssignments';
import { TeacherResources } from '@/components/teacher/TeacherResources';
import { TeacherLeave } from '@/components/teacher/TeacherLeave';

const TeacherDashboard = () => {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">Teacher Dashboard</h1>
              <p className="text-sm opacity-90">Central University of Kashmir</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{profile?.full_name}</span>
            <Button variant="secondary" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="notices" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="notices"><Bell className="h-4 w-4 mr-2" />Notices</TabsTrigger>
            <TabsTrigger value="marks"><ClipboardList className="h-4 w-4 mr-2" />Marks</TabsTrigger>
            <TabsTrigger value="attendance"><UserCheck className="h-4 w-4 mr-2" />Attendance</TabsTrigger>
            <TabsTrigger value="assignments"><BookOpen className="h-4 w-4 mr-2" />Assignments</TabsTrigger>
            <TabsTrigger value="resources"><FolderOpen className="h-4 w-4 mr-2" />Resources</TabsTrigger>
            <TabsTrigger value="leave"><Calendar className="h-4 w-4 mr-2" />Leave</TabsTrigger>
          </TabsList>

          <TabsContent value="notices" className="mt-6"><TeacherNotices /></TabsContent>
          <TabsContent value="marks" className="mt-6"><TeacherMarks /></TabsContent>
          <TabsContent value="attendance" className="mt-6"><TeacherAttendance /></TabsContent>
          <TabsContent value="assignments" className="mt-6"><TeacherAssignments /></TabsContent>
          <TabsContent value="resources" className="mt-6"><TeacherResources /></TabsContent>
          <TabsContent value="leave" className="mt-6"><TeacherLeave /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;
