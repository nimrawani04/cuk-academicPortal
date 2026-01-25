import { useState } from 'react';
import { useAllLeaveApplications, useReviewLeaveApplication } from '@/hooks/useLeaveApplications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Check, X, Clock, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export function TeacherLeave() {
  const { data: applications, isLoading } = useAllLeaveApplications();
  const reviewApplication = useReviewLeaveApplication();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async (id: string) => {
    try {
      await reviewApplication.mutateAsync({ id, status: 'approved' });
      toast({ title: 'Leave application approved' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reviewApplication.mutateAsync({ id, status: 'rejected', rejectionReason });
      toast({ title: 'Leave application rejected' });
      setRejectionReason('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'important': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const filteredApplications = applications?.filter((app: any) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (typeFilter !== 'all' && app.leave_type !== typeFilter) return false;
    return true;
  });

  const stats = {
    pending: applications?.filter((a: any) => a.status === 'pending').length || 0,
    approved: applications?.filter((a: any) => a.status === 'approved').length || 0,
    rejected: applications?.filter((a: any) => a.status === 'rejected').length || 0,
    total: applications?.length || 0,
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sick">Sick Leave</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      {filteredApplications && filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((app: any) => (
            <Card key={app.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(app.priority)}
                    <div>
                      <CardTitle className="text-lg">{app.profiles?.full_name}</CardTitle>
                      <CardDescription>
                        {app.profiles?.enrollment_number} • {app.profiles?.department}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(app.status)}>{app.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium">Leave Type</p>
                    <p className="text-sm text-muted-foreground capitalize">{app.leave_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(app.from_date), 'PP')} - {format(new Date(app.to_date), 'PP')}
                      ({differenceInDays(new Date(app.to_date), new Date(app.from_date)) + 1} days)
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium">Reason</p>
                  <p className="text-sm text-muted-foreground">{app.reason}</p>
                </div>
                {app.contact_info && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">Contact</p>
                    <p className="text-sm text-muted-foreground">{app.contact_info}</p>
                  </div>
                )}
                {app.status === 'pending' && (
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(app.id)}
                      disabled={reviewApplication.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Leave Application</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p className="text-sm">Reason for rejection (optional)</p>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Enter reason..."
                            />
                          </div>
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleReject(app.id)}
                            disabled={reviewApplication.isPending}
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
                {app.status === 'rejected' && app.rejection_reason && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded">
                    <p className="text-sm font-medium text-red-600">Rejection Reason:</p>
                    <p className="text-sm text-red-500">{app.rejection_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No leave applications found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
