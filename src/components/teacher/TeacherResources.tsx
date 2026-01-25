import { useState } from 'react';
import { useTeacherResources, useCreateResource, useDeleteResource } from '@/hooks/useResources';
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
import { FolderOpen, Plus, Trash2, Download, Eye, FileText, Video, Image } from 'lucide-react';
import { format } from 'date-fns';

export function TeacherResources() {
  const { data: resources, isLoading } = useTeacherResources();
  const { data: subjects } = useTeacherSubjects();
  const createResource = useCreateResource();
  const deleteResource = useDeleteResource();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      subject_id: formData.get('subject_id') as string,
      resource_type: formData.get('resource_type') as 'lecture_notes' | 'presentation' | 'video_tutorial' | 'document' | 'other',
      access_level: formData.get('access_level') as string,
      file_url: formData.get('file_url') as string,
    };

    try {
      await createResource.mutateAsync(data);
      toast({ title: 'Resource uploaded successfully' });
      setIsCreateOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Resource Management</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Upload Resource</Button>
          </DialogTrigger>
          <DialogContent>
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
              <div className="space-y-2">
                <Label htmlFor="file_url">File URL</Label>
                <Input id="file_url" name="file_url" placeholder="https://..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={createResource.isPending}>
                Upload Resource
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
                  <Badge variant="outline">{resource.resource_type.replace('_', ' ')}</Badge>
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
