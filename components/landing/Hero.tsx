import Link from "next/link";
import { ArrowDown } from "lucide-react";

function OwlMascot() {
  return (
    <svg
      viewBox="0 0 200 220"
      className="w-48 h-52 md:w-64 md:h-72 animate-float drop-shadow-2xl"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <ellipse cx="100" cy="130" rx="65" ry="75" fill="#6C47FF" />
      <ellipse cx="100" cy="130" rx="55" ry="65" fill="#7B5CFF" />

      {/* Belly */}
      <ellipse cx="100" cy="150" rx="35" ry="40" fill="#9B82FF" opacity="0.5" />

      {/* Left ear */}
      <polygon points="50,70 35,30 70,65" fill="#6C47FF" />
      <polygon points="55,68 42,38 68,64" fill="#7B5CFF" />

      {/* Right ear */}
      <polygon points="150,70 165,30 130,65" fill="#6C47FF" />
      <polygon points="145,68 158,38 132,64" fill="#7B5CFF" />

      {/* Left eye white */}
      <circle cx="75" cy="105" r="22" fill="white" />
      {/* Left pupil */}
      <circle cx="78" cy="105" r="12" fill="#0A0A14" />
      <circle cx="82" cy="100" r="4" fill="white" />

      {/* Right eye white */}
      <circle cx="125" cy="105" r="22" fill="white" />
      {/* Right pupil */}
      <circle cx="122" cy="105" r="12" fill="#0A0A14" />
      <circle cx="126" cy="100" r="4" fill="white" />

      {/* Beak */}
      <polygon points="100,120 90,132 110,132" fill="#FFD166" />

      {/* Tablet / Book */}
      <rect x="60" y="165" width="80" height="50" rx="6" fill="#1C1C2E" stroke="#6C47FF" strokeWidth="2" />
      <rect x="66" y="171" width="68" height="38" rx="3" fill="#13131F" />
      {/* Screen glow */}
      <rect x="66" y="171" width="68" height="38" rx="3" fill="#6C47FF" opacity="0.15" />
      {/* Screen lines */}
      <line x1="72" y1="180" x2="128" y2="180" stroke="#6C47FF" strokeWidth="1.5" opacity="0.4" />
      <line x1="72" y1="187" x2="118" y2="187" stroke="#6C47FF" strokeWidth="1.5" opacity="0.3" />
      <line x1="72" y1="194" x2="110" y2="194" stroke="#6C47FF" strokeWidth="1.5" opacity="0.2" />

      {/* Feet */}
      <ellipse cx="80" cy="205" rx="15" ry="6" fill="#5A35E0" />
      <ellipse cx="120" cy="205" rx="15" ry="6" fill="#5A35E0" />

      {/* Wing left */}
      <path d="M35,110 Q20,140 40,170 Q50,150 45,125Z" fill="#5A35E0" opacity="0.7" />

      {/* Wing right */}
      <path d="M165,110 Q180,140 160,170 Q150,150 155,125Z" fill="#5A35E0" opacity="0.7" />
    </svg>
  );
}

function SpinningBadge() {
  return (
    <div className="absolute top-24 right-8 md:top-28 md:right-16 w-28 h-28 md:w-36 md:h-36 animate-spin-slow opacity-40">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <path
            id="circlePath"
            d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"
          />
        </defs>
        <text fill="#6C47FF" fontSize="14" fontWeight="600">
          <textPath href="#circlePath">
            AI POWERED · SNAP STUDY · SMART LEARNING · 
          </textPath>
        </text>
      </svg>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-dark flex flex-col justify-between pt-24 pb-8 px-6 overflow-hidden">
      {/* Spinning badge */}
      <SpinningBadge />

      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Typography layout */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          {/* SNAP text */}
          <h1
            className="text-white font-[900] leading-none tracking-tighter"
            style={{ fontSize: "clamp(5rem, 12vw, 9rem)" }}
          >
            SNAP
          </h1>

          {/* Center mascot */}
          <div className="flex flex-col items-center gap-4">
            <OwlMascot />
            <span className="text-muted font-light text-sm tracking-[0.3em] uppercase">
              AI-Powered
            </span>
          </div>

          {/* STUDY text */}
          <h1
            className="text-primary font-[900] leading-none tracking-tighter"
            style={{ fontSize: "clamp(5rem, 12vw, 9rem)" }}
          >
            STUDY
          </h1>
        </div>

        {/* Subtitle - right aligned */}
        <p className="text-muted font-light text-sm leading-relaxed max-w-xs ml-auto mt-8 text-right hidden md:block">
          Snap Study turns your semester PDFs into an intelligent learning
          engine with AI that reads, explains, and quizzes you.
        </p>
        <p className="text-muted font-light text-sm leading-relaxed text-center mt-6 md:hidden">
          Snap Study turns your semester PDFs into an intelligent learning
          engine with AI that reads, explains, and quizzes you.
        </p>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
        {/* Avatars */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-primary/20 border-2 border-dark flex items-center justify-center text-primary text-xs font-bold"
              >
                {["AK", "SR", "MP"][i]}
              </div>
            ))}
          </div>
          <span className="text-white font-medium text-sm">+2K Students</span>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/semester/1"
            className="rounded-full bg-white text-dark px-6 py-3 font-semibold text-sm hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2"
          >
            Start Exploring
            <span className="text-lg">→</span>
          </Link>
          <a
            href="#features"
            className="rounded-full border border-white/20 text-white px-6 py-3 font-medium text-sm hover:bg-white/10 transition-all duration-300"
          >
            Learn More
          </a>
        </div>

        {/* Scroll arrow */}
        <div className="hidden md:flex flex-col items-center gap-1 text-muted">
          <span className="text-xs">Scroll</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
