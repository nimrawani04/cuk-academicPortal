import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useTeacherSubjects } from '@/hooks/useSubjects';
import { useEnrolledStudents, useUpsertAttendance } from '@/hooks/useAttendance';
import { useUpsertMarks } from '@/hooks/useMarks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Download, Loader2 } from 'lucide-react';

type UploadType = 'marks' | 'attendance';

interface ParsedRow {
  enrollment_number: string;
  student_name?: string;
  matched_student_id?: string;
  matched_name?: string;
  status: 'matched' | 'unmatched';
  data: Record<string, any>;
}

export function BulkUpload() {
  const { data: subjects } = useTeacherSubjects();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<UploadType>('marks');
  const { data: enrolledStudents } = useEnrolledStudents(selectedSubject);
  const upsertMarks = useUpsertMarks();
  const upsertAttendance = useUpsertAttendance();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedSubject) {
      toast({ title: 'Select a subject first', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

        if (!json.length) {
          toast({ title: 'Empty file', description: 'No data found in the Excel file.', variant: 'destructive' });
          return;
        }

        // Match rows to enrolled students by enrollment_number
        const rows: ParsedRow[] = json.map((row) => {
          const enrollNum = String(
            row['Enrollment Number'] || row['enrollment_number'] || row['Enrollment No'] || row['Enrollment No.'] || ''
          ).trim();

          const match = enrolledStudents?.find(
            (s: any) =>
              s.profiles?.enrollment_number?.toLowerCase() === enrollNum.toLowerCase()
          );

          return {
            enrollment_number: enrollNum,
            student_name: row['Student Name'] || row['student_name'] || row['Name'] || '',
            matched_student_id: match?.student_id,
            matched_name: match?.profiles?.full_name,
            status: match ? 'matched' : 'unmatched',
            data: row,
          };
        });

        setParsedRows(rows);
        setUploadResult(null);
        toast({
          title: `Parsed ${rows.length} rows`,
          description: `${rows.filter((r) => r.status === 'matched').length} matched, ${rows.filter((r) => r.status === 'unmatched').length} unmatched`,
        });
      } catch (err: any) {
        toast({ title: 'Parse error', description: err?.message || 'Could not read the file.', variant: 'destructive' });
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleBulkUpload = async () => {
    if (!selectedSubject) return;
    const matchedRows = parsedRows.filter((r) => r.status === 'matched' && r.matched_student_id);
    if (!matchedRows.length) {
      toast({ title: 'No matched students', description: 'No rows could be matched to enrolled students.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    let success = 0;
    let failed = 0;

    for (const row of matchedRows) {
      try {
        if (uploadType === 'marks') {
          const d = row.data;
          await upsertMarks.mutateAsync({
            student_id: row.matched_student_id!,
            subject_id: selectedSubject,
            test1_marks: parseNum(d['Test I'] ?? d['test1_marks'] ?? d['Test 1']),
            test2_marks: parseNum(d['Test II'] ?? d['test2_marks'] ?? d['Test 2']),
            presentation_marks: parseNum(d['Presentation'] ?? d['presentation_marks']),
            assignment_marks: parseNum(d['Assignment'] ?? d['assignment_marks']),
            attendance_marks: parseNum(d['Attendance'] ?? d['attendance_marks']),
          });
          success++;
        } else {
          const d = row.data;
          const status = String(d['Status'] || d['status'] || 'present').toLowerCase();
          const date = d['Date'] || d['date'] || new Date().toISOString().split('T')[0];
          const validStatuses = ['present', 'absent', 'late', 'on_leave'];
          await upsertAttendance.mutateAsync({
            student_id: row.matched_student_id!,
            subject_id: selectedSubject,
            date: String(date),
            status: (validStatuses.includes(status) ? status : 'present') as any,
          });
          success++;
        }
      } catch {
        failed++;
      }
    }

    setUploading(false);
    setUploadResult({ success, failed });
    toast({
      title: 'Bulk upload complete',
      description: `${success} saved, ${failed} failed`,
    });
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet(
      uploadType === 'marks'
        ? [
            ['Enrollment Number', 'Student Name', 'Test I', 'Test II', 'Presentation', 'Assignment', 'Attendance'],
            ['CUK-2024-CS-001', 'Example Student', 18, 17, 15, 16, 5],
          ]
        : [
            ['Enrollment Number', 'Student Name', 'Date', 'Status'],
            ['CUK-2024-CS-001', 'Example Student', '2026-03-08', 'present'],
          ]
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${uploadType}_template.xlsx`);
  };

  const matchedCount = parsedRows.filter((r) => r.status === 'matched').length;
  const unmatchedCount = parsedRows.filter((r) => r.status === 'unmatched').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Upload
          </CardTitle>
          <CardDescription>
            Upload an Excel file to bulk-update marks or attendance. Students are matched by their enrollment number.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Select value={uploadType} onValueChange={(v) => { setUploadType(v as UploadType); setParsedRows([]); setUploadResult(null); }}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marks">Marks</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSubject || ''} onValueChange={(v) => { setSelectedSubject(v); setParsedRows([]); setUploadResult(null); }}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={!selectedSubject}
              variant="outline"
              className="border-dashed"
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Excel File
            </Button>
            <p className="text-sm text-muted-foreground">
              Supported: .xlsx, .xls, .csv
            </p>
          </div>
        </CardContent>
      </Card>

      {parsedRows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Preview ({parsedRows.length} rows)</CardTitle>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {matchedCount} matched
                </Badge>
                {unmatchedCount > 0 && (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    {unmatchedCount} unmatched
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrollment No.</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Matched To</TableHead>
                    {uploadType === 'marks' ? (
                      <>
                        <TableHead>Test I</TableHead>
                        <TableHead>Test II</TableHead>
                        <TableHead>Presentation</TableHead>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Attendance</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.map((row, i) => (
                    <TableRow key={i} className={row.status === 'unmatched' ? 'bg-red-50' : ''}>
                      <TableCell>
                        {row.status === 'matched' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{row.enrollment_number}</TableCell>
                      <TableCell>{row.student_name}</TableCell>
                      <TableCell>{row.matched_name || '—'}</TableCell>
                      {uploadType === 'marks' ? (
                        <>
                          <TableCell>{row.data['Test I'] ?? row.data['test1_marks'] ?? '—'}</TableCell>
                          <TableCell>{row.data['Test II'] ?? row.data['test2_marks'] ?? '—'}</TableCell>
                          <TableCell>{row.data['Presentation'] ?? row.data['presentation_marks'] ?? '—'}</TableCell>
                          <TableCell>{row.data['Assignment'] ?? row.data['assignment_marks'] ?? '—'}</TableCell>
                          <TableCell>{row.data['Attendance'] ?? row.data['attendance_marks'] ?? '—'}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{row.data['Date'] ?? row.data['date'] ?? '—'}</TableCell>
                          <TableCell className="capitalize">{row.data['Status'] ?? row.data['status'] ?? '—'}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              {uploadResult && (
                <p className="text-sm text-muted-foreground">
                  Last upload: {uploadResult.success} saved, {uploadResult.failed} failed
                </p>
              )}
              <Button
                onClick={handleBulkUpload}
                disabled={uploading || matchedCount === 0}
                className="ml-auto"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload {matchedCount} Matched {uploadType === 'marks' ? 'Marks' : 'Records'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Select the <strong>upload type</strong> (Marks or Attendance) and the <strong>subject</strong>.</li>
            <li>Download the <strong>template</strong> and fill in student data. Use the <strong>Enrollment Number</strong> column to identify students.</li>
            <li>Upload the filled Excel file. The system matches each row to enrolled students by enrollment number.</li>
            <li>Review the preview — <span className="text-green-600 font-medium">green</span> rows are matched, <span className="text-red-500 font-medium">red</span> rows could not be matched.</li>
            <li>Click <strong>Upload</strong> to save all matched records. Each student will see only their own data when they log in.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function parseNum(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}
