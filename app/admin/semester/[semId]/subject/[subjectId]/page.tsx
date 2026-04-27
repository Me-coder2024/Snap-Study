"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import FileUploader from "@/components/admin/FileUploader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, CheckCircle, XCircle, Plus } from "lucide-react";
import { getSubjectInitials } from "@/lib/utils";
import type { Subject, Chapter, PYQ, Syllabus } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSubjectManagement() {
  const params = useParams();
  const semId = params.semId as string;
  const subjectId = params.subjectId as string;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterCount, setChapterCount] = useState(0);
  const { toast } = useToast();

  async function fetchAll() {
    const supabase = createClient();
    const [subRes, chapRes, pyqRes, sylRes] = await Promise.all([
      supabase.from("subjects").select("*").eq("id", subjectId).single(),
      supabase.from("chapters").select("*").eq("subject_id", subjectId).order("number"),
      supabase.from("pyq").select("*").eq("subject_id", subjectId).order("year", { ascending: false }),
      supabase.from("syllabus").select("*").eq("subject_id", subjectId).limit(1).single(),
    ]);
    setSubject(subRes.data);
    setChapters(chapRes.data || []);
    setPyqs(pyqRes.data || []);
    setSyllabus(sylRes.data);
    setChapterCount(chapRes.data?.length || subRes.data?.total_chapters || 0);
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, [subjectId]);

  async function createChapters() {
    if (chapterCount <= 0) return;
    try {
      const res = await fetch("/api/admin/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", subjectId, count: chapterCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: `${chapterCount} chapters created` });
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  async function updateChapterTitle(id: string, title: string) {
    await fetch("/api/admin/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_title", id, title }),
    });
  }

  async function handleChapterPdfUpload(chapterId: string, url: string) {
    await fetch("/api/admin/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_pdf", id: chapterId, pdfUrl: url }),
    });
    // Auto-trigger question generation
    fetch("/api/ai/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterId, subjectId }),
    }).catch(() => {});
    fetchAll();
  }

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;
  if (!subject) return <p className="p-8 text-gray-500">Subject not found</p>;

  return (
    <div className="p-6 md:p-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/admin" className="hover:text-primary">Admin</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/admin/semester/${semId}`} className="hover:text-primary">Semester {semId}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{subject.name}</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: subject.icon_color }}>
          {getSubjectInitials(subject.code, subject.name)}
        </div>
        <div>
          <h1 className="font-[800] text-2xl text-gray-900">{subject.name}</h1>
          {subject.code && <Badge variant="secondary">{subject.code}</Badge>}
        </div>
      </div>

      <Tabs defaultValue="chapters">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="syllabus" className="rounded-lg">Syllabus</TabsTrigger>
          <TabsTrigger value="chapters" className="rounded-lg">Chapters</TabsTrigger>
          <TabsTrigger value="pyq" className="rounded-lg">PYQ</TabsTrigger>
          <TabsTrigger value="qbank" className="rounded-lg">Question Bank</TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg">AI Questions</TabsTrigger>
        </TabsList>

        {/* Syllabus */}
        <TabsContent value="syllabus" className="mt-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-semibold mb-4">Syllabus PDF</h3>
            {syllabus ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">{syllabus.file_name || "Syllabus uploaded"}</span>
              </div>
            ) : (
              <FileUploader bucket="pdfs" storagePath={`${subjectId}/syllabus.pdf`} label="Upload Syllabus PDF" onUploadComplete={async (url) => {
                await fetch("/api/admin/upload", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ table: "syllabus", subject_id: subjectId, pdf_url: url, file_name: "syllabus.pdf" }),
                });
                fetchAll();
              }} />
            )}
          </div>
        </TabsContent>

        {/* Chapters */}
        <TabsContent value="chapters" className="mt-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
            <div className="flex items-end gap-3">
              <div className="flex-1"><Label>Number of chapters</Label><Input type="number" min={1} value={chapterCount} onChange={e => setChapterCount(Number(e.target.value))} className="mt-1" /></div>
              <Button onClick={createChapters} className="rounded-xl">Set Chapters</Button>
            </div>
          </div>
          <div className="space-y-3">
            {chapters.map((ch) => (
              <div key={ch.id} className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">{ch.number}</div>
                <Input defaultValue={ch.title} onBlur={e => updateChapterTitle(ch.id, e.target.value)} className="flex-1" />
                <div className="flex items-center gap-2 flex-shrink-0">
                  {ch.pdf_url ? <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> PDF</Badge> : <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> No PDF</Badge>}
                  <FileUploader bucket="pdfs" storagePath={`${subjectId}/ch${ch.number}.pdf`} accept=".pdf" maxSizeMB={50} label="Upload PDF" onUploadComplete={(url) => handleChapterPdfUpload(ch.id, url)} />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* PYQ */}
        <TabsContent value="pyq" className="mt-6">
          <div className="flex justify-end mb-4">
            <PYQUploadDialog subjectId={subjectId} onDone={fetchAll} />
          </div>
          {pyqs.length === 0 ? <p className="text-center py-12 text-gray-500">No PYQs uploaded yet.</p> : (
            <div className="space-y-3">
              {pyqs.map(p => (
                <div key={p.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge>{p.year}</Badge>
                    <Badge variant="secondary">{p.exam_type}</Badge>
                    <span className="text-sm text-gray-600">{p.file_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Question Bank */}
        <TabsContent value="qbank" className="mt-6">
          <QBankSection subjectId={subjectId} chapters={chapters} />
        </TabsContent>

        {/* AI Questions */}
        <TabsContent value="ai" className="mt-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-semibold mb-2">AI Generated Questions</h3>
            <p className="text-gray-500 text-sm mb-4">Questions are auto-generated when chapter PDFs are uploaded.</p>
            <Button onClick={async () => {
              for (const ch of chapters) {
                if (ch.pdf_url) {
                  await fetch("/api/ai/generate-questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chapterId: ch.id, subjectId }) });
                }
              }
              toast({ title: "Regeneration started for all chapters" });
            }} variant="outline" className="rounded-xl">Regenerate All</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PYQUploadDialog({ subjectId, onDone }: { subjectId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState("2024");
  const [examType, setExamType] = useState("end");
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Add PYQ</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Upload PYQ</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-4">
          <div><Label>Year</Label><Input value={year} onChange={e => setYear(e.target.value)} /></div>
          <div><Label>Exam Type</Label><Select value={examType} onValueChange={setExamType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mid">Mid Semester</SelectItem><SelectItem value="end">End Semester</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
          <FileUploader bucket="pdfs" storagePath={`${subjectId}/pyq-${year}-${examType}.pdf`} label="Upload PYQ PDF" maxSizeMB={20} onUploadComplete={async (url) => {
            await fetch("/api/admin/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ table: "pyq", subject_id: subjectId, year, exam_type: examType, pdf_url: url, file_name: `PYQ ${year} ${examType}` }),
            });
            toast({ title: "PYQ uploaded!" }); setOpen(false); onDone();
          }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QBankSection({ subjectId, chapters }: { subjectId: string; chapters: Chapter[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ chapter_id: "", question: "", answer: "", difficulty: "medium" });
  const { toast } = useToast();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "question_bank", subject_id: subjectId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Question added!" }); setOpen(false);
      setForm({ chapter_id: "", question: "", answer: "", difficulty: "medium" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Add Question</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Question</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div><Label>Chapter</Label><Select value={form.chapter_id} onValueChange={v => setForm({...form, chapter_id: v})}><SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger><SelectContent>{chapters.map(c => <SelectItem key={c.id} value={c.id}>Ch {c.number}: {c.title}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Question</Label><Textarea value={form.question} onChange={e => setForm({...form, question: e.target.value})} required rows={3} /></div>
              <div><Label>Answer</Label><Textarea value={form.answer} onChange={e => setForm({...form, answer: e.target.value})} rows={3} /></div>
              <div><Label>Difficulty</Label><Select value={form.difficulty} onValueChange={v => setForm({...form, difficulty: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
              <Button type="submit" className="w-full rounded-xl">Add Question</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-center text-gray-500 py-8 text-sm">Manual questions will appear here once added.</p>
    </div>
  );
}
