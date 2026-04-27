"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import SubjectCard from "@/components/shared/SubjectCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { ChevronRight, Home } from "lucide-react";
import type { Subject, Course } from "@/types";

export default function CourseSemesterPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const semId = Number(params.semId);
  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchData();
  }, [courseId, semId]);

  return (
    <div className="min-h-screen bg-[#F8F8FC] pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary flex items-center gap-1"><Home className="w-4 h-4" /> Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/course/${courseId}`} className="hover:text-primary">{course?.name || "Course"}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Semester {semId}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 font-[800] text-4xl">Semester {semId}</h1>
          <p className="text-gray-500 mt-1">
            {course?.name} · {subjects.length} subject{subjects.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner size="lg" text="Loading subjects..." className="py-20" />
        ) : subjects.length === 0 ? (
          <EmptyState title="No subjects yet" description="Subjects for this semester haven't been added yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
