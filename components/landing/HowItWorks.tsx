import { Upload, Brain, GraduationCap, Trophy } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Admin Uploads",
    description:
      "Admin adds subjects, chapter PDFs, PYQs, and syllabus per semester",
  },
  {
    icon: Brain,
    title: "AI Analyzes",
    description:
      "AI reads all PDFs and PYQs, finds patterns, generates smart questions",
  },
  {
    icon: GraduationCap,
    title: "Student Studies",
    description:
      "Students browse semester → subject → chapter, read PDFs with AI Buddy",
  },
  {
    icon: Trophy,
    title: "Practice & Ace",
    description:
      "Practice chapter-wise MCQs, ask AI anything, ace your exams",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-dark py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-white font-[900] text-3xl md:text-4xl mb-3">
            How It Works
          </h2>
          <p className="text-muted font-light text-base max-w-md mx-auto">
            From upload to exam success in four simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-12 md:gap-4">
          {/* Dashed connector line (desktop) */}
          <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-white/10" />

          {/* Vertical connector (mobile) */}
          <div className="md:hidden absolute top-8 bottom-8 left-8 w-0.5 border-l-2 border-dashed border-white/10" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative flex md:flex-col items-start md:items-center gap-4 md:gap-3 flex-1 z-10"
              >
                {/* Step circle */}
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/25">
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Text */}
                <div className="md:text-center">
                  <span className="text-primary/60 text-xs font-semibold uppercase tracking-widest">
                    Step {index + 1}
                  </span>
                  <h3 className="text-white font-bold text-lg mt-1">
                    {step.title}
                  </h3>
                  <p className="text-muted font-light text-sm mt-1 max-w-[200px]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
