import { useState } from 'react';
import { useAllSubjects, useDeleteSubject, useCreateSubjectAdmin, useUpdateSubjectAdmin, useTeachersList } from '@/hooks/useAdmin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm = { code: '', name: '', department: '', semester: '', credits: '', teacher_id: '' };

export function AdminSubjects() {
  const { data: subjects, isLoading } = useAllSubjects();
  const { data: teachers } = useTeachersList();
  const deleteSubject = useDeleteSubject();
  const createSubject = useCreateSubjectAdmin();
  const updateSubject = useUpdateSubjectAdmin();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (s: any) => {
    setEditId(s.id);
    setForm({
      code: s.code,
      name: s.name,
      department: s.department,
      semester: String(s.semester),
      credits: String(s.credits),
      teacher_id: s.teacher_id ?? '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.code || !form.name || !form.department || !form.semester || !form.credits) {
      toast({ title: 'Validation', description: 'All fields except teacher are required', variant: 'destructive' });
      return;
    }
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      department: form.department.trim(),
      semester: Number(form.semester),
      credits: Number(form.credits),
      teacher_id: form.teacher_id || null,
    };
    try {
      if (editId) {
        await updateSubject.mutateAsync({ id: editId, ...payload });
        toast({ title: 'Subject updated' });
      } else {
        await createSubject.mutateAsync(payload);
        toast({ title: 'Subject created' });
      }
      setOpen(false);
      setForm(emptyForm);
      setEditId(null);
    } catch {
      toast({ title: 'Error', description: 'Operation failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete subject "${name}"? This cannot be undone.`)) return;
    try {
      await deleteSubject.mutateAsync(id);
      toast({ title: 'Deleted', description: `${name} removed` });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete subject', variant: 'destructive' });
    }
  };

  const isPending = createSubject.isPending || updateSubject.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subjects</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Subject</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Edit Subject' : 'New Subject'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} maxLength={20} placeholder="CS301" /></div>
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} placeholder="Data Structures" /></div>
              <div><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} maxLength={100} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Semester</Label><Input type="number" min={1} max={10} value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></div>
                <div><Label>Credits</Label><Input type="number" min={1} max={10} value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} /></div>
              </div>
              <div>
                <Label>Assign Teacher</Label>
                <Select value={form.teacher_id} onValueChange={(v) => setForm({ ...form, teacher_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select teacher (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {teachers?.map((t) => (
                      <SelectItem key={t.user_id} value={t.user_id}>{t.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} disabled={isPending} className="w-full">
                {isPending ? 'Saving...' : editId ? 'Update Subject' : 'Create Subject'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects?.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono">{s.code}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell>{s.semester}</TableCell>
                  <TableCell>{s.credits}</TableCell>
                  <TableCell>{s.profiles?.full_name ?? '—'}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id, s.name)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {subjects?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No subjects</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
