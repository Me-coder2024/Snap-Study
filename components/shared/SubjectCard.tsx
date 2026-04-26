import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getSubjectInitials } from "@/lib/utils";
import type { Subject } from "@/types";

interface SubjectCardProps {
  subject: Subject;
  showAiBadge?: boolean;
}

export default function SubjectCard({ subject, showAiBadge }: SubjectCardProps) {
  return (
    <Link
      href={`/subject/${subject.id}`}
      className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 cursor-pointer block"
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: subject.icon_color || "#6C47FF" }}
      >
        {getSubjectInitials(subject.code, subject.name)}
      </div>

      {/* Name */}
      <h3 className="font-bold text-gray-900 text-lg mt-4">{subject.name}</h3>

      {/* Code */}
      {subject.code && (
        <p className="text-gray-500 text-sm">{subject.code}</p>
      )}

      {/* Chapter count */}
      <div className="flex items-center gap-1.5 mt-2 text-gray-600 text-sm">
        <BookOpen className="w-4 h-4" />
        <span>{subject.total_chapters} Chapters</span>
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-2 mt-3">
        {showAiBadge && (
          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
            AI Ready
          </span>
        )}
      </div>

      {/* Open link */}
      <div className="flex items-center gap-1 mt-4 text-primary font-semibold text-sm group-hover:gap-2 transition-all">
        Open Subject
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
