import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SemesterCardProps {
  number: number;
  subjectCount?: number;
  href: string;
}

export default function SemesterCard({ number, subjectCount = 0, href }: SemesterCardProps) {
  return (
    <Link
      href={href}
      className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <span className="absolute top-2 right-4 text-6xl font-[900] text-primary/10 select-none leading-none">
        {number}
      </span>

      <div className="relative z-10">
        <h3 className="text-gray-900 font-bold text-xl">Semester {number}</h3>
        <p className="text-gray-500 text-sm mt-1">
          {subjectCount} subject{subjectCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex items-center gap-1 mt-4 text-primary font-semibold text-sm">
        Manage
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
