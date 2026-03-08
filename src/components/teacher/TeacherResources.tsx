import { useRef, useState } from 'react';
import { useTeacherResources, useCreateResource, useDeleteResource } from '@/hooks/useResources';
import { useTeacherSubjects } from '@/hooks/useSubjects';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FolderOpen, Plus, Trash2, Download, Eye, FileText, Video, Image, Upload, Loader2, Link } from 'lucide-react';

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.mp4,.mp3,.zip,.txt,.csv';

export function TeacherResources() {
  const { user } = useAuth();
  const { data: resources, isLoading } = useTeacherResources();
  const { data: subjects } = useTeacherSubjects();
  const createResource = useCreateResource();
  const deleteResource = useDeleteResource();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const subject_id = formData.get('subject_id') as string;
    const resource_type = formData.get('resource_type') as 'lecture_notes' | 'presentation' | 'video_tutorial' | 'document' | 'other';
    const access_level = formData.get('access_level') as string;

    if (!subject_id) {
      toast({ title: 'Subject required', variant: 'destructive' });
      return;
    }

    let file_url = '';

    if (uploadMode === 'file') {
      if (!selectedFile) {
        toast({ title: 'Please select a file', variant: 'destructive' });
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Max 50MB allowed.', variant: 'destructive' });
        return;
      }

      setUploading(true);
      try {
        const ext = selectedFile.name.split('.').pop();
        const filePath = `${user!.id}/${Date.now()}-${selectedFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(filePath, selectedFile, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('resources')
          .getPublicUrl(filePath);

        file_url = urlData.publicUrl;
      } catch (err: any) {
        toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
        setUploading(false);
        return;
      }
    } else {
      file_url = formData.get('file_url') as string;
      if (!file_url) {
        toast({ title: 'Please enter a URL', variant: 'destructive' });
        return;
      }
    }

    try {
      await createResource.mutateAsync({
        title,
        description,
        subject_id,
        resource_type,
        access_level,
        file_url,
        file_size: selectedFile?.size || null,
      });
      toast({ title: 'Resource uploaded successfully' });
      setIsCreateOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResource.mutateAsync(id);
      toast({ title: 'Resource deleted successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video_tutorial': return <Video className="h-4 w-4" />;
      case 'presentation': return <Image className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Resource Management</h3>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) { setSelectedFile(null); setUploadMode('file'); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Upload Resource</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload New Resource</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject_id">Subject</Label>
                <Select name="subject_id">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resource_type">Resource Type</Label>
                  <Select name="resource_type" defaultValue="document">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture_notes">Lecture Notes</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="video_tutorial">Video Tutorial</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="access_level">Access Level</Label>
                  <Select name="access_level" defaultValue="all_students">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_students">All Students</SelectItem>
                      <SelectItem value="enrolled_only">Enrolled Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Upload mode toggle */}
              <div className="space-y-2">
                <Label>Source</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={uploadMode === 'file' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUploadMode('file')}
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={uploadMode === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUploadMode('url')}
                  >
                    <Link className="mr-1.5 h-3.5 w-3.5" /> Paste URL
                  </Button>
                </div>
              </div>

              {uploadMode === 'file' ? (
                <div className="space-y-2">
                  <Label>File (max 50MB)</Label>
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedFile ? (
                      <>
                        <FileText className="mb-2 h-8 w-8 text-primary" />
                        <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to select a file</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, PPT, images, videos...</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="file_url">File URL</Label>
                  <Input id="file_url" name="file_url" placeholder="https://..." />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={2} />
              </div>
              <Button type="submit" className="w-full" disabled={createResource.isPending || uploading}>
                {uploading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                ) : (
                  'Upload Resource'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {resources && resources.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((resource: any) => (
            <Card key={resource.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getResourceIcon(resource.resource_type)}
                    <div>
                      <CardTitle className="text-base">{resource.title}</CardTitle>
                      <CardDescription>{resource.subjects?.name}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline">{resource.resource_type.replace('_', ' ')}</Badge>
                    {resource.file_size && (
                      <span className="text-[10px] text-muted-foreground">{formatFileSize(resource.file_size)}</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {resource.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" /> {resource.download_count}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(resource.id)}>
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
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No resources uploaded yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
