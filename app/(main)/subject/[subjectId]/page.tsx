"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getSubjectInitials } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { ChevronRight, Home, BookOpen, Brain, FileText, HelpCircle, Sparkles } from "lucide-react";
import type { Subject, Chapter, AIQuestion, PYQ, Syllabus } from "@/types";

export default function SubjectPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [subRes, chapRes, aiRes, pyqRes, sylRes] = await Promise.all([
        supabase.from("subjects").select("*").eq("id", subjectId).single(),
        supabase.from("chapters").select("*").eq("subject_id", subjectId).order("number"),
        supabase.from("ai_questions").select("*").eq("subject_id", subjectId),
        supabase.from("pyq").select("*").eq("subject_id", subjectId).order("year", { ascending: false }),
        supabase.from("syllabus").select("*").eq("subject_id", subjectId).limit(1).single(),
      ]);

      setSubject(subRes.data);
      setChapters(chapRes.data || []);
      setAiQuestions(aiRes.data || []);
      setPyqs(pyqRes.data || []);
      setSyllabus(sylRes.data);
      setLoading(false);
    }
    fetchData();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8FC] pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading subject..." />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-[#F8F8FC] pt-24 flex items-center justify-center">
        <EmptyState title="Subject not found" />
      </div>
    );
  }

  const stats = [
    { label: "Chapters", value: chapters.length, icon: BookOpen },
    { label: "AI Questions", value: aiQuestions.length, icon: Brain },
    { label: "PYQs", value: pyqs.length, icon: FileText },
    { label: "Question Bank", value: 0, icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8FC] pt-24 pb-12">
      {/* Sticky header */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: subject.icon_color || "#6C47FF" }}
          >
            {getSubjectInitials(subject.code, subject.name)}
          </div>
          <div>
            <h1 className="font-[800] text-2xl text-gray-900">{subject.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {subject.code && <Badge variant="secondary">{subject.code}</Badge>}
              <Badge>Semester {subject.semester_id}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6">
        <Tabs defaultValue="overview">
          <TabsList className="bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="chapters" className="rounded-lg">Chapters</TabsTrigger>
            <TabsTrigger value="practice" className="rounded-lg">Practice</TabsTrigger>
            <TabsTrigger value="pyq" className="rounded-lg">PYQ</TabsTrigger>
            <TabsTrigger value="ai-questions" className="rounded-lg">AI Questions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <Icon className="w-5 h-5 text-primary mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                  </div>
                );
              })}
            </div>
            {subject.description && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{subject.description}</p>
              </div>
            )}
          </TabsContent>

          {/* Chapters Tab */}
          <TabsContent value="chapters" className="mt-6">
            {chapters.length === 0 ? (
              <EmptyState title="No chapters yet" description="Chapters will be available once the admin uploads them." />
            ) : (
              <div className="space-y-3">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {chapter.number}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{chapter.title}</h4>
                        <p className="text-gray-500 text-xs">Chapter {chapter.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {chapter.pdf_url && (
                        <Link href={`/subject/${subjectId}/study/${chapter.id}`}>
                          <Button size="sm" className="rounded-lg text-xs">
                            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Study PDF
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Practice Tab */}
          <TabsContent value="practice" className="mt-6">
            <div className="text-center py-8">
              <Link href={`/subject/${subjectId}/practice`}>
                <Button size="lg" className="rounded-xl">
                  <Sparkles className="w-5 h-5 mr-2" /> Start Practice Session
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* PYQ Tab */}
          <TabsContent value="pyq" className="mt-6">
            {pyqs.length === 0 ? (
              <EmptyState title="No PYQs uploaded" description="Previous year question papers will appear here." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pyqs.map((pyq) => (
                  <div key={pyq.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{pyq.year}</Badge>
                      <Badge variant="secondary">{pyq.exam_type === "end" ? "End Sem" : pyq.exam_type === "mid" ? "Mid Sem" : pyq.exam_type}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{pyq.file_name}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* AI Questions Tab */}
          <TabsContent value="ai-questions" className="mt-6">
            {aiQuestions.length === 0 ? (
              <EmptyState title="No AI questions yet" description="AI questions will be generated when chapter PDFs are uploaded." />
            ) : (
              <div className="space-y-4">
                <p className="text-gray-500 text-sm">{aiQuestions.length} questions generated</p>
                {aiQuestions.slice(0, 10).map((q, idx) => (
                  <div key={q.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <p className="font-medium text-gray-900 text-sm">
                      <span className="text-primary font-bold mr-2">Q{idx + 1}.</span>
                      {q.question}
                    </p>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {["A", "B", "C", "D"].map((opt) => (
                        <div
                          key={opt}
                          className={`px-3 py-2 rounded-lg border ${
                            q.correct_answer === opt
                              ? "bg-green-50 border-green-300 text-green-800"
                              : "bg-gray-50 border-gray-200 text-gray-600"
                          }`}
                        >
                          <span className="font-semibold mr-1">{opt}.</span>
                          {q[`option_${opt.toLowerCase()}` as keyof AIQuestion]}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="mt-3 text-xs text-gray-500 bg-primary/5 p-3 rounded-lg">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
