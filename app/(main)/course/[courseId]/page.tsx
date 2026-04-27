"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { ChevronRight, Home, BookOpen, Layers, ArrowRight } from "lucide-react";
import type { Course } from "@/types";

const semesterColors = ["#6C47FF", "#FF5C5C", "#06D6A0", "#FFD166", "#118AB2", "#E63946", "#9B59B6", "#2ECC71"];

export default function CoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [semesterSubjectCounts, setSemesterSubjectCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: courseData } = await supabase.from("courses").select("*").eq("id", courseId).single();
      setCourse(courseData);

      const { data: subjects } = await supabase.from("subjects").select("semester_id").eq("course_id", courseId);
      const counts: Record<number, number> = {};
      (subjects || []).forEach((s) => {
        counts[s.semester_id] = (counts[s.semester_id] || 0) + 1;
      });
      setSemesterSubjectCounts(counts);
      setLoading(false);
    }
    fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8FC] pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading course..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8F8FC] pt-24 flex items-center justify-center">
        <EmptyState title="Course not found" />
      </div>
    );
  }

  const totalSemesters = course.duration_years * 2;

  return (
    <div className="min-h-screen bg-[#F8F8FC] pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary flex items-center gap-1">
            <Home className="w-4 h-4" /> Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{course.name}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 mb-8">
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-[800] text-lg shadow-lg flex-shrink-0"
              style={{ backgroundColor: course.icon_color, boxShadow: `0 8px 24px ${course.icon_color}30` }}
            >
              {course.code ? course.code.substring(0, 3).toUpperCase() : course.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-gray-900 font-[800] text-3xl">{course.name}</h1>
              {course.description && <p className="text-gray-500 mt-1 max-w-xl">{course.description}</p>}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {totalSemesters} Semesters</span>
                <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> {course.duration_years} Years</span>
              </div>
            </div>
          </div>
        </div>

        {/* Year-wise Grid */}
        <div className="space-y-8">
          {Array.from({ length: course.duration_years }, (_, yearIdx) => {
            const year = yearIdx + 1;
            const sem1 = yearIdx * 2 + 1;
            const sem2 = yearIdx * 2 + 2;
            return (
              <div key={year}>
                <h2 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-[800] text-white" style={{ backgroundColor: semesterColors[(yearIdx) % semesterColors.length] }}>
                    {year}
                  </div>
                  Year {year}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[sem1, sem2].filter(s => s <= totalSemesters).map((semNum) => {
                    const subCount = semesterSubjectCounts[semNum] || 0;
                    return (
                      <Link
                        key={semNum}
                        href={`/course/${courseId}/semester/${semNum}`}
                        className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <span className="absolute top-2 right-4 text-7xl font-[900] select-none leading-none opacity-5" style={{ color: semesterColors[(semNum - 1) % semesterColors.length] }}>
                          {semNum}
                        </span>

                        <div className="flex items-center gap-4">
                          <div className="w-1.5 h-14 rounded-full" style={{ backgroundColor: semesterColors[(semNum - 1) % semesterColors.length] }} />
                          <div className="flex-1">
                            <h3 className="text-gray-900 font-bold text-lg">Semester {semNum}</h3>
                            <span className="inline-block text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium mt-1">
                              {subCount} Subject{subCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
