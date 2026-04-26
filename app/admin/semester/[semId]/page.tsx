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
import type { Subject } from "@/types";

const presetColors = ["#6C47FF", "#FF5C5C", "#FFD166", "#06D6A0", "#118AB2", "#E63946"];

export default function AdminSemesterPage() {
  const params = useParams();
  const semId = Number(params.semId);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", description: "", icon_color: "#6C47FF", total_chapters: 0 });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function fetchSubjects() {
    const supabase = createClient();
    const { data } = await supabase.from("subjects").select("*").eq("semester_id", semId).order("name");
    setSubjects(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchSubjects(); }, [semId]);

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("subjects").insert({ semester_id: semId, ...form });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Subject added!" }); setDialogOpen(false); setForm({ name: "", code: "", description: "", icon_color: "#6C47FF", total_chapters: 0 }); fetchSubjects(); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this subject?")) return;
    const supabase = createClient();
    await supabase.from("subjects").delete().eq("id", id);
    fetchSubjects();
  }

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="p-6 md:p-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-primary">Admin</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Semester {semId}</span>
      </nav>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-[800] text-3xl text-gray-900">Semester {semId}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Add Subject</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Subject</DialogTitle></DialogHeader>
            <form onSubmit={handleAddSubject} className="space-y-4 mt-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Code</Label><Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="CS301" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
              <div><Label>Color</Label><div className="flex gap-2 mt-1">{presetColors.map(c => <button key={c} type="button" onClick={() => setForm({...form, icon_color: c})} className={`w-8 h-8 rounded-full border-2 ${form.icon_color === c ? "border-gray-900 scale-110" : "border-transparent"}`} style={{backgroundColor: c}} />)}</div></div>
              <div><Label>Chapters</Label><Input type="number" min={0} value={form.total_chapters} onChange={e => setForm({...form, total_chapters: Number(e.target.value)})} /></div>
              <Button type="submit" className="w-full rounded-xl" disabled={saving}>{saving ? "Adding..." : "Add Subject"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {subjects.length === 0 ? <p className="text-center py-16 text-gray-500">No subjects yet.</p> : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 text-sm text-gray-500"><th className="text-left px-6 py-4">Icon</th><th className="text-left px-6 py-4">Code</th><th className="text-left px-6 py-4">Name</th><th className="text-left px-6 py-4">Chapters</th><th className="text-right px-6 py-4">Actions</th></tr></thead>
            <tbody>{subjects.map(sub => (
              <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs" style={{backgroundColor: sub.icon_color}}>{getSubjectInitials(sub.code, sub.name)}</div></td>
                <td className="px-6 py-4 text-sm text-gray-500">{sub.code || "—"}</td>
                <td className="px-6 py-4 text-sm font-medium">{sub.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{sub.total_chapters}</td>
                <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => handleDelete(sub.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button><Link href={`/admin/semester/${semId}/subject/${sub.id}`}><Button size="sm" className="rounded-lg text-xs gap-1"><Settings className="w-3.5 h-3.5" /> Manage</Button></Link></div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
