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
    color: "#6C47FF",
  },
  {
    icon: TrendingUp,
    title: "PYQ Pattern Analysis",
    description:
      "AI finds patterns from past exam papers and generates high-probability questions for you.",
    color: "#FF5C5C",
  },
  {
    icon: BookOpen,
    title: "Chapter Practice",
    description:
      "Quiz yourself chapter by chapter with AI-generated MCQs and instant explanations.",
    color: "#06D6A0",
  },
  {
    icon: LayoutDashboard,
    title: "Admin Dashboard",
    description:
      "Full content management — upload PDFs, PYQs, syllabi, question banks per semester.",
    color: "#FFD166",
  },
  {
    icon: Zap,
    title: "Always-On AI",
    description:
      "Groq-powered AI with rotating key system ensures zero downtime for all students.",
    color: "#118AB2",
  },
  {
    icon: Shield,
    title: "Secure Storage",
    description:
      "PDFs stored in encrypted Supabase storage, accessible via signed URLs with timed expiry.",
    color: "#9B59B6",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-[#F8F7F6] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-block text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            Features
          </span>
          <h2 className="text-[#1a1a1a] font-[900] text-3xl md:text-4xl mb-3">
            Everything You Need. Nothing You Don&apos;t.
          </h2>
          <p className="text-gray-500 font-normal text-base max-w-md mx-auto">
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
                className="bg-white rounded-2xl p-7 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 group animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div
                  className="rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>

                {/* Title */}
                <h3 className="text-[#1a1a1a] font-bold text-lg mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed">
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
