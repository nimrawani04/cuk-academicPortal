import { useSystemStats } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, School, Bell, ClipboardList, Calendar, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'text-blue-500' },
  { key: 'students', label: 'Students', icon: GraduationCap, color: 'text-emerald-500' },
  { key: 'teachers', label: 'Teachers', icon: School, color: 'text-amber-500' },
  { key: 'admins', label: 'Admins', icon: ShieldCheck, color: 'text-rose-500' },
  { key: 'totalSubjects', label: 'Subjects', icon: BookOpen, color: 'text-violet-500' },
  { key: 'totalClasses', label: 'Classes', icon: ClipboardList, color: 'text-cyan-500' },
  { key: 'totalNotices', label: 'Notices', icon: Bell, color: 'text-orange-500' },
  { key: 'pendingLeaves', label: 'Pending Leaves', icon: Calendar, color: 'text-pink-500' },
] as const;

export function AdminOverview() {
  const { data: stats, isLoading } = useSystemStats();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, color }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-5 w-5 ${color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold">{stats?.[key] ?? 0}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
