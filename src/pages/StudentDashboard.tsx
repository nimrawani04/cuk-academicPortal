import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, BookOpen, Calendar, ClipboardList, FolderOpen, TrendingUp, Library, FileText, LogOut } from 'lucide-react';

const StudentDashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">Student Dashboard</h1>
              <p className="text-sm opacity-90">Central University of Kashmir</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        <Tabs defaultValue="notices" className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-6">
            <TabsTrigger value="notices">
              <Bell className="h-4 w-4 mr-2" />
              Notices
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="marks">
              <ClipboardList className="h-4 w-4 mr-2" />
              Marks
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="resources">
              <FolderOpen className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <FileText className="h-4 w-4 mr-2" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="library">
              <Library className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="leave">
              <Calendar className="h-4 w-4 mr-2" />
              Leave
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notices" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Latest Notices</CardTitle>
                <CardDescription>View important announcements and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No new notices</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>View your enrolled courses and class schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No courses enrolled yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Marks</CardTitle>
                <CardDescription>View your test scores and grades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No marks available</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Track your academic performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Performance data will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Resources</CardTitle>
                <CardDescription>Access study materials and resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No resources available</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Assignments</CardTitle>
                <CardDescription>View and submit your assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No assignments assigned</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Library Management</CardTitle>
                <CardDescription>Browse and manage your library books</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Library className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No books issued</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Applications</CardTitle>
                <CardDescription>Apply for leave and track your applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leave applications submitted</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
