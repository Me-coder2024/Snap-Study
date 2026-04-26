"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { ChevronLeft, Sparkles, Trophy, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import type { AIQuestion, Chapter, Subject } from "@/types";

export default function PracticePage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [subRes, chapRes] = await Promise.all([
        supabase.from("subjects").select("*").eq("id", subjectId).single(),
        supabase.from("chapters").select("*").eq("subject_id", subjectId).order("number"),
      ]);
      setSubject(subRes.data);
      setChapters(chapRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, [subjectId]);

  useEffect(() => {
    async function fetchQuestions() {
      const supabase = createClient();
      let query = supabase.from("ai_questions").select("*").eq("subject_id", subjectId);
      if (selectedChapter !== "all") {
        query = query.eq("chapter_id", selectedChapter);
      }
      const { data } = await query;
      setQuestions(data || []);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setShowScore(false);
    }
    if (!loading) fetchQuestions();
  }, [subjectId, selectedChapter, loading]);

  async function generateQuestions() {
    if (!selectedChapter || selectedChapter === "all") return;
    setGenerating(true);
    try {
      await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: selectedChapter, subjectId }),
      });
      // Refetch
      const supabase = createClient();
      const { data } = await supabase.from("ai_questions").select("*").eq("chapter_id", selectedChapter);
      setQuestions(data || []);
    } catch {}
    setGenerating(false);
  }

  function handleAnswer(answer: string) {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    if (answer === questions[currentIndex].correct_answer) {
      setScore((s) => s + 1);
    }
  }

  function nextQuestion() {
    if (currentIndex + 1 >= questions.length) {
      setShowScore(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
    }
  }

  function restart() {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowScore(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8FC] pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8F8FC] pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link href={`/subject/${subjectId}`} className="inline-flex items-center gap-1 text-gray-500 text-sm hover:text-primary mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to subject
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-[800] text-3xl text-gray-900">Practice Mode</h1>
            {subject && <Badge className="mt-1">{subject.name}</Badge>}
          </div>
        </div>

        {/* Chapter selector */}
        <div className="mb-8">
          <Select value={selectedChapter} onValueChange={setSelectedChapter}>
            <SelectTrigger className="w-full max-w-xs bg-white rounded-xl">
              <SelectValue placeholder="Select chapter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>
              {chapters.map((ch) => (
                <SelectItem key={ch.id} value={ch.id}>
                  Chapter {ch.number}: {ch.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {generating ? (
          <LoadingSpinner size="lg" text="Generating AI questions..." className="py-20" />
        ) : questions.length === 0 ? (
          <EmptyState
            title="No questions available"
            description={selectedChapter !== "all" ? "Generate AI questions for this chapter" : "Select a specific chapter to generate questions"}
            action={selectedChapter !== "all" ? { label: "Generate Questions", onClick: generateQuestions } : undefined}
          />
        ) : showScore ? (
          /* Score Panel */
          <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm text-center">
            <div className="w-28 h-28 rounded-full border-4 border-primary flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-[900] text-primary">{score}/{questions.length}</span>
            </div>
            <p className="text-5xl font-[900] text-gray-900">{percentage}%</p>
            <p className="text-gray-500 mt-2 text-lg">
              {percentage < 50 ? "Keep practicing! You'll get there 💪" : percentage < 80 ? "Good effort! Almost there 🎯" : "Excellent work! You're acing it 🏆"}
            </p>
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button onClick={restart} variant="outline" className="rounded-xl gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
              <Link href={`/subject/${subjectId}`}>
                <Button className="rounded-xl">Back to Subject</Button>
              </Link>
            </div>
          </div>
        ) : currentQ ? (
          /* Question Card */
          <div>
            {/* Progress */}
            <div className="flex items-center gap-3 mb-6">
              <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />
              <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Badge>Question {currentIndex + 1}</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-6">{currentQ.question}</h3>

              {/* Options */}
              <div className="space-y-3">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const optKey = `option_${opt.toLowerCase()}` as keyof AIQuestion;
                  const isCorrect = currentQ.correct_answer === opt;
                  const isSelected = selectedAnswer === opt;

                  let optionStyle = "bg-gray-50 border-gray-200 text-gray-800 hover:border-primary/40 hover:bg-primary/5";
                  if (selectedAnswer) {
                    if (isCorrect) optionStyle = "bg-green-50 border-green-400 text-green-700";
                    else if (isSelected) optionStyle = "bg-red-50 border-red-400 text-red-700";
                    else optionStyle = "bg-gray-50 border-gray-200 text-gray-500";
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      disabled={!!selectedAnswer}
                      className={`w-full text-left border rounded-xl px-5 py-3.5 text-sm font-medium transition-all flex items-center gap-3 ${optionStyle}`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-white border border-current/20 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {opt}
                      </span>
                      <span className="flex-1">{currentQ[optKey] as string}</span>
                      {selectedAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                      {selectedAnswer && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {selectedAnswer && currentQ.explanation && (
                <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-primary">💡 Explanation:</span>{" "}
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Next button */}
              {selectedAnswer && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={nextQuestion} className="rounded-xl px-6">
                    {currentIndex + 1 >= questions.length ? "See Results" : "Next Question →"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
