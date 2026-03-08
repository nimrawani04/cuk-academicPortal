import { useState } from 'react';
import { useAllClasses, useCreateClass, useDeleteClass, useUpdateClass } from '@/hooks/useAdmin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm = { name: '', department: '', semester: '' };

export function AdminClasses() {
  const { data: classes, isLoading } = useAllClasses();
  const createClass = useCreateClass();
  const deleteClass = useDeleteClass();
  const updateClass = useUpdateClass();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setOpen(true); };

  const openEdit = (c: any) => {
    setEditId(c.id);
    setForm({ name: c.name, department: c.department, semester: String(c.semester) });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.department || !form.semester) return;
    const payload = { name: form.name.trim(), department: form.department.trim(), semester: Number(form.semester) };
    try {
      if (editId) {
        await updateClass.mutateAsync({ id: editId, ...payload });
        toast({ title: 'Class updated' });
      } else {
        await createClass.mutateAsync(payload);
        toast({ title: 'Class created' });
      }
      setForm(emptyForm);
      setEditId(null);
      setOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Operation failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete class "${name}"?`)) return;
    try {
      await deleteClass.mutateAsync(id);
      toast({ title: 'Deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete class', variant: 'destructive' });
    }
  };

  const isPending = createClass.isPending || updateClass.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Classes</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Class</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Edit Class' : 'New Class'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} /></div>
              <div><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} maxLength={100} /></div>
              <div><Label>Semester</Label><Input type="number" min={1} max={10} value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></div>
              <Button onClick={handleSubmit} disabled={isPending} className="w-full">
                {isPending ? 'Saving...' : editId ? 'Update Class' : 'Create Class'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.department}</TableCell>
                  <TableCell>{c.semester}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id, c.name)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {classes?.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No classes</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
