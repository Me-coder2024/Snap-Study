import {
  Bot,
  TrendingUp,
  BookOpen,
  LayoutDashboard,
  Zap,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Study Buddy",
    description:
      "Reads your current PDF page and explains it like a friend would. Ask anything, get instant answers.",
  },
  {
    icon: TrendingUp,
    title: "PYQ Pattern Analysis",
    description:
      "AI finds patterns from past exam papers and generates high-probability questions for you.",
  },
  {
    icon: BookOpen,
    title: "Chapter Practice",
    description:
      "Quiz yourself chapter by chapter with AI-generated MCQs and instant explanations.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin Dashboard",
    description:
      "Full content management — upload PDFs, PYQs, syllabi, question banks per semester.",
  },
  {
    icon: Zap,
    title: "Always-On AI",
    description:
      "Groq-powered AI with rotating key system ensures zero downtime for all students.",
  },
  {
    icon: Shield,
    title: "Secure Storage",
    description:
      "PDFs stored in encrypted Supabase storage, accessible via signed URLs with timed expiry.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-card py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-white font-[900] text-3xl md:text-4xl mb-3">
            Everything You Need. Nothing You Don&apos;t.
          </h2>
          <p className="text-muted font-light text-base max-w-md mx-auto">
            Built for engineering students who want to study smarter, not harder.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-card2 rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all duration-300 group animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="rounded-xl bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-lg mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
