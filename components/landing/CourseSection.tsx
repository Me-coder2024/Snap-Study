"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, BookOpen, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { Course } from "@/types";

export default function CourseSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [courseRes, subRes] = await Promise.all([
        supabase.from("courses").select("*").order("name"),
        supabase.from("subjects").select("course_id"),
      ]);

      setCourses(courseRes.data || []);

      const counts: Record<string, number> = {};
      (subRes.data || []).forEach((s) => {
        if (s.course_id) counts[s.course_id] = (counts[s.course_id] || 0) + 1;
      });
      setSubjectCounts(counts);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <section id="courses" className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <span className="inline-block text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            Courses
          </span>
          <h2 className="text-[#1a1a1a] font-[900] text-4xl md:text-5xl mb-3">
            Choose Your Course
          </h2>
          <p className="text-gray-500 font-normal text-base max-w-lg mx-auto">
            Select your course to access all semesters, subjects, chapters, and AI-powered study tools.
          </p>
        </div>

        {/* Course Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 animate-pulse h-48" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">Courses will be available soon. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/course/${course.id}`}
                className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-400 overflow-hidden"
              >
                {/* Top gradient bar */}
                <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${course.icon_color}, ${course.icon_color}88)` }} />

                <div className="p-7">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-[800] text-base mb-5 shadow-lg"
                    style={{ backgroundColor: course.icon_color, boxShadow: `0 8px 24px ${course.icon_color}30` }}
                  >
                    {course.code ? course.code.substring(0, 3).toUpperCase() : course.name.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Title */}
                  <h3 className="text-[#1a1a1a] font-[800] text-xl mb-1 group-hover:text-primary transition-colors">
                    {course.name}
                  </h3>

                  {course.description && (
                    <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{course.description}</p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 mb-5">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {course.duration_years} Years
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <BookOpen className="w-3.5 h-3.5" /> {course.duration_years * 2} Semesters
                    </span>
                    <span className="inline-block text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
                      {subjectCounts[course.id] || 0} Subjects
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    Explore Course
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
