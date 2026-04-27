"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const semesterColors: Record<number, string> = {
  1: "#6C47FF",
  2: "#FF5C5C",
  3: "#06D6A0",
  4: "#FFD166",
  5: "#118AB2",
  6: "#E63946",
  7: "#9B59B6",
  8: "#2ECC71",
};

export default function SemesterSection() {
  const [semesterCounts, setSemesterCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubjects() {
      const supabase = createClient();
      const { data, error } = await supabase.from("subjects").select("semester_id");
      
      if (!error && data) {
        const counts: Record<number, number> = {};
        data.forEach((s) => {
          counts[s.semester_id] = (counts[s.semester_id] || 0) + 1;
        });
        setSemesterCounts(counts);
      }
      setLoading(false);
    }
    fetchSubjects();
  }, []);

  // Generate 8 semesters
  const semesters = Array.from({ length: 8 }, (_, i) => {
    const number = i + 1;
    return {
      number,
      subjects: semesterCounts[number] || 0,
      color: semesterColors[number],
    };
  });

  return (
    <section id="semesters" className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <span className="inline-block text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            Semesters
          </span>
          <h2 className="text-[#1a1a1a] font-[900] text-4xl md:text-5xl mb-3">
            Choose Your Semester
          </h2>
          <p className="text-gray-500 font-normal text-base max-w-lg mx-auto">
            Select your current semester to access all subjects, chapters, and
            AI-powered study tools.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {semesters.map((sem) => (
            <Link
              key={sem.number}
              href={`/semester/${sem.number}`}
              className="group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Huge faded number */}
              <span
                className="absolute top-2 right-4 text-7xl font-[900] select-none leading-none opacity-10"
                style={{ color: sem.color }}
              >
                {sem.number}
              </span>

              {/* Color dot */}
              <div
                className="w-3 h-3 rounded-full mb-4"
                style={{ backgroundColor: sem.color }}
              />

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-[#1a1a1a] font-bold text-xl mb-1">
                  Semester {sem.number}
                </h3>
                {loading ? (
                  <span className="inline-block text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium animate-pulse">
                    Loading...
                  </span>
                ) : (
                  <span className="inline-block text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                    {sem.subjects} Subjects
                  </span>
                )}
              </div>

              {/* Arrow */}
              <ArrowRight className="absolute bottom-5 right-5 w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
