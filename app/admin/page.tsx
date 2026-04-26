"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import SemesterCard from "@/components/shared/SemesterCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { BookOpen, FileText, Brain, Layers } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ subjects: 0, chapters: 0, pdfs: 0, aiQuestions: 0 });
  const [semesterCounts, setSemesterCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      const [subRes, chapRes, aiRes] = await Promise.all([
        supabase.from("subjects").select("id, semester_id"),
        supabase.from("chapters").select("id, pdf_url"),
        supabase.from("ai_questions").select("id"),
      ]);

      const subjects = subRes.data || [];
      const chapters = chapRes.data || [];
      const aiQuestions = aiRes.data || [];
      const pdfs = chapters.filter((c) => c.pdf_url).length;

      setStats({
        subjects: subjects.length,
        chapters: chapters.length,
        pdfs,
        aiQuestions: aiQuestions.length,
      });

      // Count subjects per semester
      const counts: Record<number, number> = {};
      subjects.forEach((s) => {
        counts[s.semester_id] = (counts[s.semester_id] || 0) + 1;
      });
      setSemesterCounts(counts);
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Subjects", value: stats.subjects, icon: Layers, color: "text-primary" },
    { label: "Total Chapters", value: stats.chapters, icon: BookOpen, color: "text-blue-500" },
    { label: "PDFs Uploaded", value: stats.pdfs, icon: FileText, color: "text-green-500" },
    { label: "AI Questions", value: stats.aiQuestions, icon: Brain, color: "text-purple-500" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-[800] text-3xl text-gray-900 mb-8">Content Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <Icon className={`w-6 h-6 ${card.color} mb-3`} />
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-gray-500 text-sm mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Semesters */}
      <h2 className="font-bold text-xl text-gray-900 mb-6">Manage Semesters</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
          <SemesterCard
            key={num}
            number={num}
            subjectCount={semesterCounts[num] || 0}
            href={`/admin/semester/${num}`}
          />
        ))}
      </div>
    </div>
  );
}
