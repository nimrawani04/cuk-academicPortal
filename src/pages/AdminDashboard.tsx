import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Users, BookOpen, School, LogOut, ShieldCheck, User } from 'lucide-react';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminSubjects } from '@/components/admin/AdminSubjects';
import { AdminClasses } from '@/components/admin/AdminClasses';
import { ProfileEditor } from '@/components/profile/ProfileEditor';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-rose-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview"><LayoutDashboard className="h-4 w-4 mr-2" />Overview</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />Users</TabsTrigger>
            <TabsTrigger value="subjects"><BookOpen className="h-4 w-4 mr-2" />Subjects</TabsTrigger>
            <TabsTrigger value="classes"><School className="h-4 w-4 mr-2" />Classes</TabsTrigger>
            <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6"><AdminOverview /></TabsContent>
          <TabsContent value="users" className="mt-6"><AdminUsers /></TabsContent>
          <TabsContent value="subjects" className="mt-6"><AdminSubjects /></TabsContent>
          <TabsContent value="classes" className="mt-6"><AdminClasses /></TabsContent>
          <TabsContent value="profile" className="mt-6"><ProfileEditor /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
