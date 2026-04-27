"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { ChevronRight, ArrowRight, BookOpen, Layers } from "lucide-react";
import type { Course } from "@/types";

const semesterColors = ["#6C47FF", "#FF5C5C", "#06D6A0", "#FFD166", "#118AB2", "#E63946", "#9B59B6", "#2ECC71"];

export default function AdminCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [semesterSubjectCounts, setSemesterSubjectCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Fetch course
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      setCourse(courseData);

      // Fetch subjects for this course and count per semester
      const { data: subjects } = await supabase
        .from("subjects")
        .select("semester_id")
        .eq("course_id", courseId);

      const counts: Record<number, number> = {};
      (subjects || []).forEach((s) => {
        counts[s.semester_id] = (counts[s.semester_id] || 0) + 1;
      });
      setSemesterSubjectCounts(counts);

      setLoading(false);
    }
    fetchData();
  }, [courseId]);

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;
  if (!course) return <p className="p-8 text-gray-500">Course not found</p>;

  const totalSemesters = course.duration_years * 2;

  return (
    <div className="p-6 md:p-8 max-w-[1200px]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-primary">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{course.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-[800] text-sm" style={{ backgroundColor: course.icon_color }}>
          {course.code ? course.code.substring(0, 3).toUpperCase() : course.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="font-[800] text-2xl text-gray-900">{course.name}</h1>
          <p className="text-gray-500 text-sm">{course.duration_years} Years · {totalSemesters} Semesters</p>
        </div>
      </div>

      {/* Year-wise Semesters Grid */}
      <div className="space-y-8">
        {Array.from({ length: course.duration_years }, (_, yearIdx) => {
          const year = yearIdx + 1;
          const sem1 = yearIdx * 2 + 1;
          const sem2 = yearIdx * 2 + 2;
          return (
            <div key={year}>
              <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-[800] text-gray-600">{year}</div>
                Year {year}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[sem1, sem2].filter(s => s <= totalSemesters).map((semNum) => (
                  <Link
                    key={semNum}
                    href={`/admin/course/${courseId}/semester/${semNum}`}
                    className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Background number */}
                    <span className="absolute top-2 right-4 text-7xl font-[900] select-none leading-none opacity-5" style={{ color: semesterColors[(semNum - 1) % semesterColors.length] }}>
                      {semNum}
                    </span>

                    <div className="flex items-center gap-4">
                      {/* Color bar */}
                      <div className="w-1.5 h-14 rounded-full" style={{ backgroundColor: semesterColors[(semNum - 1) % semesterColors.length] }} />

                      <div className="flex-1">
                        <h3 className="text-gray-900 font-bold text-lg">Semester {semNum}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Layers className="w-3 h-3" />
                            {semesterSubjectCounts[semNum] || 0} Subjects
                          </span>
                        </div>
                      </div>

                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
