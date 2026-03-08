import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'English',
  'Economics',
  'Management Studies',
  'Education',
  'Law',
  'Journalism',
];

export function ProfileEditor() {
  const { user, userRole } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    department: '',
    semester: '',
    enrollmentNumber: '',
    employeeId: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        department: profile.department || '',
        semester: profile.semester?.toString() || '',
        enrollmentNumber: profile.enrollment_number || '',
        employeeId: profile.employee_id || '',
      });
    }
  }, [profile]);

  const initials = (form.fullName || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Avatar must be under 2MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      await updateProfile.mutateAsync({ avatar_url: avatarUrl });
      toast({ title: 'Avatar updated', description: 'Your profile picture has been changed.' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast({ title: 'Name required', description: 'Full name cannot be empty.', variant: 'destructive' });
      return;
    }

    updateProfile.mutate(
      {
        full_name: form.fullName.trim(),
        phone: form.phone.trim() || null,
        department: form.department || null,
        semester: form.semester ? parseInt(form.semester) : null,
        enrollment_number: form.enrollmentNumber.trim() || null,
        employee_id: form.employeeId.trim() || null,
      },
      {
        onSuccess: () => toast({ title: 'Profile saved', description: 'Your changes have been saved.' }),
        onError: (err: any) =>
          toast({ title: 'Save failed', description: err?.message || 'Please try again.', variant: 'destructive' }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url || undefined} alt={form.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="font-medium text-foreground">{form.fullName || 'Your Name'}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <p className="text-xs text-muted-foreground capitalize mt-1">
              {userRole} · Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile?.email || ''} disabled className="bg-muted" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Select value={form.department} onValueChange={(v) => setForm((p) => ({ ...p, department: v }))}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {userRole === 'student' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={form.semester} onValueChange={(v) => setForm((p) => ({ ...p, semester: v }))}>
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="enrollment">Enrollment Number</Label>
                    <Input
                      id="enrollment"
                      value={form.enrollmentNumber}
                      onChange={(e) => setForm((p) => ({ ...p, enrollmentNumber: e.target.value }))}
                      placeholder="e.g. CUK-2024-CS-001"
                    />
                  </div>
                </>
              )}

              {userRole === 'teacher' && (
                <div className="space-y-1.5">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={form.employeeId}
                    onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
                    placeholder="e.g. EMP-001"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
