"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import SubjectCard from "@/components/shared/SubjectCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { ChevronRight, Home } from "lucide-react";
import type { Subject } from "@/types";

export default function SemesterPage() {
  const params = useParams();
  const semId = Number(params.semId);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubjects() {
      const supabase = createClient();
      const { data } = await supabase
        .from("subjects")
        .select("*")
        .eq("semester_id", semId)
        .order("name");
      setSubjects(data || []);
      setLoading(false);
    }
    fetchSubjects();
  }, [semId]);

  return (
    <div className="min-h-screen bg-[#F8F8FC] pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary flex items-center gap-1">
            <Home className="w-4 h-4" /> Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Semester {semId}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 font-[800] text-4xl">
            Semester {semId}
          </h1>
          <p className="text-gray-500 mt-1">
            {subjects.length} subject{subjects.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner size="lg" text="Loading subjects..." className="py-20" />
        ) : subjects.length === 0 ? (
          <EmptyState
            title="No subjects yet"
            description="Subjects for this semester haven't been added yet. Check back later!"
          />
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
