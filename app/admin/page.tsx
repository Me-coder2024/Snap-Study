"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen, FileText, Brain, Layers, GraduationCap, ChevronRight, Trash2, Users, Clock } from "lucide-react";
import type { Course } from "@/types";

const presetColors = ["#6C47FF", "#FF5C5C", "#FFD166", "#06D6A0", "#118AB2", "#E63946", "#9B59B6", "#2ECC71"];

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({ subjects: 0, chapters: 0, pdfs: 0, aiQuestions: 0, students: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", duration_years: 4, icon_color: "#6C47FF", description: "" });
  const { toast } = useToast();

  // Course subject counts
  const [courseSubjectCounts, setCourseSubjectCounts] = useState<Record<string, number>>({});

  async function fetchData() {
    const supabase = createClient();

    const [courseRes, subRes, chapRes, aiRes, profileRes] = await Promise.all([
      supabase.from("courses").select("*").order("name"),
      supabase.from("subjects").select("id, semester_id, course_id"),
      supabase.from("chapters").select("id, pdf_url"),
      supabase.from("ai_questions").select("id"),
      supabase.from("profiles").select("id"),
    ]);

    setCourses(courseRes.data || []);

    const subjects = subRes.data || [];
    const chapters = chapRes.data || [];
    const aiQuestions = aiRes.data || [];
    const pdfs = chapters.filter((c) => c.pdf_url).length;

    setStats({
      subjects: subjects.length,
      chapters: chapters.length,
      pdfs,
      aiQuestions: aiQuestions.length,
      students: profileRes.data?.length || 0,
    });

    // Count subjects per course
    const counts: Record<string, number> = {};
    subjects.forEach((s) => {
      if (s.course_id) counts[s.course_id] = (counts[s.course_id] || 0) + 1;
    });
    setCourseSubjectCounts(counts);

    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Course created!", description: `${form.name} with ${form.duration_years * 2} semesters` });
      setDialogOpen(false);
      setForm({ name: "", code: "", duration_years: 4, icon_color: "#6C47FF", description: "" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  }

  async function handleDeleteCourse(id: string, name: string) {
    if (!confirm(`Delete "${name}" and ALL its subjects?`)) return;
    try {
      const res = await fetch("/api/admin/courses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Course deleted" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const statCards = [
    { label: "Total Courses", value: courses.length, icon: GraduationCap, color: "#6C47FF", bg: "bg-purple-50" },
    { label: "Total Subjects", value: stats.subjects, icon: Layers, color: "#FF5C5C", bg: "bg-red-50" },
    { label: "Chapters", value: stats.chapters, icon: BookOpen, color: "#118AB2", bg: "bg-blue-50" },
    { label: "PDFs Uploaded", value: stats.pdfs, icon: FileText, color: "#06D6A0", bg: "bg-green-50" },
    { label: "AI Questions", value: stats.aiQuestions, icon: Brain, color: "#9B59B6", bg: "bg-purple-50" },
    { label: "Students", value: stats.students, icon: Users, color: "#FFD166", bg: "bg-yellow-50" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[800] text-3xl text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage courses, subjects, and content</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.bg} rounded-2xl p-5 border border-gray-100/50`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${card.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-2xl font-[800] text-gray-900">{card.value}</p>
              <p className="text-gray-500 text-xs mt-0.5 font-medium">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Courses Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl text-gray-900">Courses</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-[800]">Create New Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-5 mt-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Course Name *</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="BTech CSE Core" className="mt-1.5" required />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Course Code</Label>
                <Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="CSE-CORE" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Duration (Years) *</Label>
                <Input type="number" min={1} max={6} value={form.duration_years} onChange={e => setForm({...form, duration_years: Number(e.target.value)})} className="mt-1.5" />
                <p className="text-xs text-gray-400 mt-1">
                  {form.duration_years} years = <span className="font-semibold text-primary">{form.duration_years * 2} semesters</span> (auto-generated)
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Color</Label>
                <div className="flex gap-2 mt-2">
                  {presetColors.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, icon_color: c})} className={`w-9 h-9 rounded-full border-2 transition-all ${form.icon_color === c ? "border-gray-900 scale-110 shadow-lg" : "border-transparent hover:scale-105"}`} style={{backgroundColor: c}} />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="mt-1.5" placeholder="Brief description of the course..." />
              </div>
              <Button type="submit" className="w-full rounded-xl h-11 text-sm font-semibold" disabled={saving}>
                {saving ? "Creating..." : `Create Course (${form.duration_years * 2} Semesters)`}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Course Cards */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-600 text-lg">No courses yet</h3>
          <p className="text-gray-400 text-sm mt-1 mb-6">Create your first course to get started</p>
          <Button onClick={() => setDialogOpen(true)} className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Add Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div key={course.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-100/80 transition-all duration-300">
              {/* Top color bar */}
              <div className="h-2" style={{ backgroundColor: course.icon_color }} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-[800] text-sm" style={{ backgroundColor: course.icon_color }}>
                    {course.code ? course.code.substring(0, 3).toUpperCase() : course.name.substring(0, 2).toUpperCase()}
                  </div>
                  <button onClick={() => handleDeleteCourse(course.id, course.name)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-[700] text-lg text-gray-900 mb-1">{course.name}</h3>
                {course.code && <span className="inline-block text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-medium mb-3">{course.code}</span>}

                {course.description && (
                  <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">{course.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.duration_years} Years</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{course.duration_years * 2} Semesters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{courseSubjectCounts[course.id] || 0} Subjects</span>
                  </div>
                </div>

                <Link href={`/admin/course/${course.id}`}>
                  <Button className="w-full rounded-xl gap-2 h-10 text-sm" variant="outline">
                    Manage Course <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
