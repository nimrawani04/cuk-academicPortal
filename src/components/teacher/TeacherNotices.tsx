import { useState } from 'react';
import { useNotices, useCreateNotice, useUpdateNotice, useDeleteNotice } from '@/hooks/useNotices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bell, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

export function TeacherNotices() {
  const { data: notices, isLoading } = useNotices();
  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice();
  const deleteNotice = useDeleteNotice();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      priority: formData.get('priority') as 'normal' | 'important' | 'urgent',
      target_audience: formData.get('target_audience') as string,
      expire_at: formData.get('expire_at') ? new Date(formData.get('expire_at') as string).toISOString() : null,
    };

    try {
      if (editingNotice) {
        await updateNotice.mutateAsync({ id: editingNotice.id, ...data });
        toast({ title: 'Notice updated successfully' });
        setEditingNotice(null);
      } else {
        await createNotice.mutateAsync(data);
        toast({ title: 'Notice created successfully' });
        setIsCreateOpen(false);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotice.mutateAsync(id);
      toast({ title: 'Notice deleted successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'important': return 'default';
      default: return 'secondary';
    }
  };

  const NoticeForm = ({ notice }: { notice?: any }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={notice?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" name="content" defaultValue={notice?.content} rows={4} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select name="priority" defaultValue={notice?.priority || 'normal'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="target_audience">Target Audience</Label>
          <Select name="target_audience" defaultValue={notice?.target_audience || 'all'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="class">Specific Class</SelectItem>
              <SelectItem value="subject">Subject Students</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="expire_at">Expiry Date (Optional)</Label>
        <Input 
          id="expire_at" 
          name="expire_at" 
          type="datetime-local" 
          defaultValue={notice?.expire_at ? format(new Date(notice.expire_at), "yyyy-MM-dd'T'HH:mm") : ''} 
        />
      </div>
      <Button type="submit" className="w-full" disabled={createNotice.isPending || updateNotice.isPending}>
        {notice ? 'Update Notice' : 'Create Notice'}
      </Button>
    </form>
  );

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Notice Management</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Create Notice</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Notice</DialogTitle>
            </DialogHeader>
            <NoticeForm />
          </DialogContent>
        </Dialog>
      </div>

      {notices && notices.length > 0 ? (
        <div className="grid gap-4">
          {notices.map((notice: any) => (
            <Card key={notice.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                    <CardDescription>
                      {format(new Date(notice.created_at), 'PPP')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(notice.priority)}>{notice.priority}</Badge>
                    <Badge variant="outline">{notice.target_audience}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{notice.content}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    {notice.view_count} views
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={editingNotice?.id === notice.id} onOpenChange={(open) => !open && setEditingNotice(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingNotice(notice)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Notice</DialogTitle>
                        </DialogHeader>
                        <NoticeForm notice={notice} />
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(notice.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No notices created yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
