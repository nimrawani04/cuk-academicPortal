import { useState } from 'react';
import { Calendar, Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useExams, useCreateExam } from '@/hooks/useExams';
import { useSubjects } from '@/hooks/useSubjects';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const EXAM_TYPES = ['midterm', 'final', 'quiz', 'practical', 'assignment'];

export function TeacherExams() {
  const { toast } = useToast();
  const { data: exams = [], isLoading } = useExams();
  const { data: subjects = [] } = useSubjects();
  const createExam = useCreateExam();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    subject_id: '',
    title: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    room: '',
    exam_type: 'midterm',
    notes: '',
  });

  const resetForm = () => {
    setForm({ subject_id: '', title: '', exam_date: '', start_time: '', end_time: '', room: '', exam_type: 'midterm', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject_id || !form.title || !form.exam_date) {
      toast({ title: 'Missing fields', description: 'Subject, title, and date are required.', variant: 'destructive' });
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('exams')
          .update({
            subject_id: form.subject_id,
            title: form.title,
            exam_date: form.exam_date,
            start_time: form.start_time || null,
            end_time: form.end_time || null,
            room: form.room || null,
            exam_type: form.exam_type,
            notes: form.notes || null,
          })
          .eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Exam updated' });
      } else {
        await createExam.mutateAsync({
          subject_id: form.subject_id,
          title: form.title,
          exam_date: form.exam_date,
          start_time: form.start_time || null,
          end_time: form.end_time || null,
          room: form.room || null,
          exam_type: form.exam_type,
          notes: form.notes || null,
        });
        toast({ title: 'Exam created' });
      }
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-exams'] });
      resetForm();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleEdit = (exam: any) => {
    setForm({
      subject_id: exam.subject_id,
      title: exam.title,
      exam_date: exam.exam_date,
      start_time: exam.start_time?.slice(0, 5) || '',
      end_time: exam.end_time?.slice(0, 5) || '',
      room: exam.room || '',
      exam_type: exam.exam_type,
      notes: exam.notes || '',
    });
    setEditingId(exam.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Exam deleted' });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-exams'] });
    }
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[24px] font-semibold tracking-tight text-foreground">Exam Management</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Add Exam
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">{editingId ? 'Edit Exam' : 'New Exam'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Subject *</Label>
                <Select value={form.subject_id} onValueChange={(v) => setForm((p) => ({ ...p, subject_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Midterm Exam" />
              </div>
              <div className="space-y-1.5">
                <Label>Date *</Label>
                <Input type="date" value={form.exam_date} onChange={(e) => setForm((p) => ({ ...p, exam_date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Exam Type</Label>
                <Select value={form.exam_type} onValueChange={(v) => setForm((p) => ({ ...p, exam_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Room / Venue</Label>
                <Input value={form.room} onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))} placeholder="e.g. Hall A - Room 101" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Syllabus, instructions..." rows={2} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createExam.isPending}>
                {editingId ? 'Update Exam' : 'Create Exam'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <p className="p-5 text-sm text-muted-foreground">Loading exams...</p>
        ) : exams.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No exams created yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {exams.map((exam: any) => {
              const examDate = new Date(exam.exam_date);
              const isPast = examDate < new Date(new Date().toDateString());
              return (
                <div key={exam.id} className={`flex items-start justify-between gap-4 px-5 py-4 ${isPast ? 'opacity-50' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{exam.title}</p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        exam.exam_type === 'final' ? 'bg-red-100 text-red-700'
                        : exam.exam_type === 'midterm' ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                        {exam.exam_type.charAt(0).toUpperCase() + exam.exam_type.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{exam.subjects?.name} · {exam.subjects?.code}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {examDate.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      {(exam.start_time || exam.end_time) && (
                        <span>🕐 {exam.start_time?.slice(0, 5) || '?'} – {exam.end_time?.slice(0, 5) || '?'}</span>
                      )}
                      {exam.room && <span>📍 {exam.room}</span>}
                    </div>
                    {exam.notes && <p className="mt-1 text-xs italic text-muted-foreground">{exam.notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(exam)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(exam.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
