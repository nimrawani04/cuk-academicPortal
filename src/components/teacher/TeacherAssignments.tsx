import { useState } from 'react';
import { useTeacherAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment, useSubmissionsByAssignment } from '@/hooks/useAssignments';
import { useTeacherSubjects } from '@/hooks/useSubjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';

export function TeacherAssignments() {
  const { data: assignments, isLoading } = useTeacherAssignments();
  const { data: subjects } = useTeacherSubjects();
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  const deleteAssignment = useDeleteAssignment();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [viewingSubmissions, setViewingSubmissions] = useState<string | null>(null);
  const { data: submissions } = useSubmissionsByAssignment(viewingSubmissions);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      subject_id: formData.get('subject_id') as string,
      due_date: new Date(formData.get('due_date') as string).toISOString(),
      max_marks: parseInt(formData.get('max_marks') as string),
    };

    try {
      if (editingAssignment) {
        await updateAssignment.mutateAsync({ id: editingAssignment.id, ...data });
        toast({ title: 'Assignment updated successfully' });
        setEditingAssignment(null);
      } else {
        await createAssignment.mutateAsync(data);
        toast({ title: 'Assignment created successfully' });
        setIsCreateOpen(false);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment.mutateAsync(id);
      toast({ title: 'Assignment deleted successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const AssignmentForm = ({ assignment }: { assignment?: any }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={assignment?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject_id">Subject</Label>
        <Select name="subject_id" defaultValue={assignment?.subject_id}>
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects?.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={assignment?.description} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            name="due_date"
            type="datetime-local"
            defaultValue={assignment?.due_date ? format(new Date(assignment.due_date), "yyyy-MM-dd'T'HH:mm") : ''}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_marks">Max Marks</Label>
          <Input
            id="max_marks"
            name="max_marks"
            type="number"
            defaultValue={assignment?.max_marks || 100}
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={createAssignment.isPending || updateAssignment.isPending}>
        {assignment ? 'Update Assignment' : 'Create Assignment'}
      </Button>
    </form>
  );

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assignment Management</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Create Assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <AssignmentForm />
          </DialogContent>
        </Dialog>
      </div>

      {assignments && assignments.length > 0 ? (
        <div className="grid gap-4">
          {assignments.map((assignment: any) => (
            <Card key={assignment.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <CardDescription>{assignment.subjects?.name}</CardDescription>
                  </div>
                  <Badge variant={new Date(assignment.due_date) < new Date() ? 'destructive' : 'default'}>
                    Due: {format(new Date(assignment.due_date), 'PPP')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Max Marks: {assignment.max_marks}
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setViewingSubmissions(assignment.id)}>
                          <Users className="h-4 w-4 mr-2" />
                          Submissions
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Submissions for {assignment.title}</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-96 overflow-y-auto">
                          {submissions && submissions.length > 0 ? (
                            <div className="space-y-2">
                              {submissions.map((sub: any) => (
                                <div key={sub.id} className="p-3 border rounded flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{sub.profiles?.full_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Submitted: {format(new Date(sub.submitted_at), 'PPP')}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    {sub.marks !== null ? (
                                      <Badge>{sub.marks}/{assignment.max_marks}</Badge>
                                    ) : (
                                      <Badge variant="outline">Pending</Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center py-8 text-muted-foreground">No submissions yet</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={editingAssignment?.id === assignment.id} onOpenChange={(open) => !open && setEditingAssignment(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingAssignment(assignment)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Assignment</DialogTitle>
                        </DialogHeader>
                        <AssignmentForm assignment={assignment} />
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(assignment.id)}>
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
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No assignments created yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
