import Link from "next/link";
import { ArrowRight } from "lucide-react";

const semesters = [
  { number: 1, subjects: 6 },
  { number: 2, subjects: 6 },
  { number: 3, subjects: 5 },
  { number: 4, subjects: 5 },
  { number: 5, subjects: 5 },
  { number: 6, subjects: 4 },
  { number: 7, subjects: 4 },
  { number: 8, subjects: 3 },
];

export default function SemesterSection() {
  return (
    <section id="semesters" className="bg-dark py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-white font-[800] text-4xl md:text-5xl mb-3">
            Choose Your Semester
          </h2>
          <p className="text-muted font-light text-base max-w-lg mx-auto">
            Select your current semester to access all subjects, chapters, and
            AI-powered study tools.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {semesters.map((sem) => (
            <Link
              key={sem.number}
              href={`/semester/${sem.number}`}
              className="group relative bg-card border border-white/5 rounded-2xl p-6 hover:border-primary/40 hover:bg-card2 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Huge faded number */}
              <span className="absolute top-2 right-4 text-7xl font-[900] text-primary/10 select-none leading-none">
                {sem.number}
              </span>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-white font-bold text-xl mb-2">
                  Semester {sem.number}
                </h3>
                <span className="inline-block text-xs bg-primary/10 text-primary/80 px-2 py-1 rounded-full font-medium">
                  {sem.subjects} Subjects
                </span>
              </div>

              {/* Arrow */}
              <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-muted group-hover:text-primary transition-colors duration-200" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
