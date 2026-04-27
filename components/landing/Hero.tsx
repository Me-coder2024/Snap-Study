"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowDown, Play } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/* ─── Spinning Badge ─── */
function SpinningBadge() {
  return (
    <div className="rotating-badge">
      <div className="badge-circle">
        <svg viewBox="0 0 200 200" className="badge-text-svg">
          <defs>
            <path id="bp" d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" />
          </defs>
          <text fill="#333" fontSize="11.5" fontWeight="700" letterSpacing="3">
            <textPath href="#bp">SNAPSTUDY AI · SNAPSTUDY AI ·</textPath>
          </text>
        </svg>
        <span className="badge-star">★</span>
      </div>
    </div>
  );
}

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      const supabase = createClient();
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      setStudentCount(count || 0);
    }
    fetchCount();
  }, []);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => { });
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <section className="hero">
      <SpinningBadge />

      {/* ── Left text block ── */}
      <div className="hero-left">
        <span className="hero-sm">SNAP</span>
        <div className="hero-lg-wrap">
          <span className="hero-lg">STUDY</span>
          {/* Play button overlapping end of STUDY */}
          <div className="play-circle">
            <Play className="w-4 h-4 text-[#6b7c5e] fill-[#6b7c5e]" />
          </div>
        </div>
      </div>

      {/* ── Center mascot ── */}
      <div className="hero-mascot relative">
        <Image
          src="/mascot/avatar-image.png"
          alt="SnapStudy Mascot"
          width={480}
          height={480}
          className="mascot-img relative z-10"
          style={{ transform: "translateZ(0)" }}
          priority
        />
        
        {/* Floating Paper (Static Hover Animation) */}
        <div className="absolute top-[0%] left-[-30%] w-48 h-48 animate-hover pointer-events-none z-30">
          <Image
            src="/mascot/floater-robin-2.png"
            alt="Floating Robin"
            fill
            className="object-contain mix-blend-multiply"
          />
        </div>

        {/* Laptop Hover Area */}
        <div
          className="absolute bottom-[8%] left-[25%] w-[45%] h-[35%] z-20 cursor-pointer pointer-events-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        {/* Video Card (Tablet Style) */}
        <div
          className={`absolute bottom-[-2%] left-[-4%] w-[32%] z-30 transition-all duration-300 pointer-events-none rounded-xl overflow-hidden shadow-2xl border-4 border-[#1c1c1e] bg-black ${isHovering ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
            }`}
          style={{
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            padding: "4px" // Tablet bezel
          }}
        >
          {/* tablet screen */}
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              src="/tab-video.mp4"
              className="w-full h-auto object-cover"
              muted
              loop
              playsInline
            />
          </div>
        </div>
      </div>

      {/* ── Right text block ── */}
      <div className="hero-right">
        <span className="hero-sm">FOR</span>
        <span className="hero-lg">ALL</span>
        <p className="hero-desc">
          Our platform turns your semester PDFs into
          an intelligent learning engine with AI that
          reads, explains, and quizzes you.
        </p>
      </div>

      {/* ── Bottom bar ── */}
      <div className="hero-bottom">
        {/* Avatars */}
        <div className="hero-avatars">
          <div className="avatar-stack">
            <img src="https://i.pravatar.cc/40?img=1" alt="" className="avatar-img" />
            <div className="avatar-badge">+{studentCount > 999 ? `${(studentCount / 1000).toFixed(1)}K` : studentCount}</div>
          </div>
          <div className="avatar-info">
            <strong>Students</strong>
            <span>Exploring the world of IT</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="hero-ctas">
          <a href="#courses" className="btn-primary">
            Start exploring <span className="btn-arrow">→</span>
          </a>
          <a href="#features" className="btn-outline">Learn more</a>
        </div>

        {/* Arrow */}
        <div className="hero-scroll">
          <ArrowDown className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
}
