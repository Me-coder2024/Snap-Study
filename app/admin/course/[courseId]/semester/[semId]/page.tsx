"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { Plus, ChevronRight, Trash2, Settings } from "lucide-react";
import { getSubjectInitials } from "@/lib/utils";
import type { Subject, Course } from "@/types";

const presetColors = ["#6C47FF", "#FF5C5C", "#FFD166", "#06D6A0", "#118AB2", "#E63946"];

export default function AdminCourseSemesterPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const semId = Number(params.semId);
  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", description: "", icon_color: "#6C47FF", total_chapters: 0 });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function fetchData() {
    const supabase = createClient();
    const [courseRes, subRes] = await Promise.all([
      supabase.from("courses").select("*").eq("id", courseId).single(),
      supabase.from("subjects").select("*").eq("course_id", courseId).eq("semester_id", semId).order("name"),
    ]);
    setCourse(courseRes.data);
    setSubjects(subRes.data || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [courseId, semId]);

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semester_id: semId, course_id: courseId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Subject added!" });
      setDialogOpen(false);
      setForm({ name: "", code: "", description: "", icon_color: "#6C47FF", total_chapters: 0 });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this subject?")) return;
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="p-6 md:p-8 max-w-[1200px]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/admin" className="hover:text-primary">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/admin/course/${courseId}`} className="hover:text-primary">{course?.name || "Course"}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Semester {semId}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[800] text-3xl text-gray-900">Semester {semId}</h1>
          <p className="text-gray-500 text-sm mt-1">{course?.name} · {subjects.length} subjects</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle className="text-xl font-[800]">Add New Subject</DialogTitle></DialogHeader>
            <form onSubmit={handleAddSubject} className="space-y-5 mt-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Name *</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1.5" placeholder="Database Management Systems" required />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Code</Label>
                <Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="mt-1.5" placeholder="CS301" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Color</Label>
                <div className="flex gap-2 mt-2">
                  {presetColors.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, icon_color: c})}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${form.icon_color === c ? "border-gray-900 scale-110 shadow-lg" : "border-transparent hover:scale-105"}`}
                      style={{backgroundColor: c}} />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Number of Chapters</Label>
                <Input type="number" min={0} value={form.total_chapters} onChange={e => setForm({...form, total_chapters: Number(e.target.value)})} className="mt-1.5" />
              </div>
              <Button type="submit" className="w-full rounded-xl h-11 text-sm font-semibold" disabled={saving}>
                {saving ? "Adding..." : "Add Subject"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subject Cards */}
      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
          <p className="text-gray-400 text-sm">No subjects yet. Click "Add Subject" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subjects.map(sub => (
            <div key={sub.id} className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{backgroundColor: sub.icon_color}}>
                  {getSubjectInitials(sub.code, sub.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{sub.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {sub.code && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">{sub.code}</span>}
                    <span className="text-xs text-gray-400">{sub.total_chapters} chapters</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDelete(sub.id)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link href={`/admin/course/${courseId}/semester/${semId}/subject/${sub.id}`}>
                    <Button size="sm" className="rounded-lg text-xs gap-1">
                      <Settings className="w-3.5 h-3.5" /> Manage
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
