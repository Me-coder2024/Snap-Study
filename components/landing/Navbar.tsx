"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, Shield, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Course } from "@/types";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const supabase = createClient();

      // Auth check
      const { data: { session } } = await supabase.auth.getSession();
      const adminCookie = document.cookie.includes("admin_bypass=true");
      if (session || adminCookie) setIsLoggedIn(true);
      if (adminCookie || session?.user?.email === "piyushgupta4969@gmail.com") {
        setIsAdmin(true);
      } else if (session) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        if (profile?.role === "admin") setIsAdmin(true);
      }

      // Fetch courses
      const { data: coursesData } = await supabase.from("courses").select("*").order("name");
      setCourses(coursesData || []);
    }
    init();
  }, []);

  async function handleLogout() {
    document.cookie = "admin_bypass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsAdmin(false);
    router.refresh();
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-[#0D0D0D] text-xl tracking-tight uppercase" style={{ fontFamily: "'Black Han Sans', sans-serif" }}>SNAP</span>
          <span className="text-[#7B5CF0] text-xl tracking-tight uppercase" style={{ fontFamily: "'Black Han Sans', sans-serif" }}>STUDY</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7">
          {/* Courses Dropdown */}
          <div className="relative" onMouseEnter={() => setCoursesOpen(true)} onMouseLeave={() => setCoursesOpen(false)}>
            <button className="flex items-center gap-1 text-gray-500 text-[13px] font-medium hover:text-[#0D0D0D] transition-colors">
              Courses <ChevronDown className={`w-3.5 h-3.5 transition-transform ${coursesOpen ? "rotate-180" : ""}`} />
            </button>
            {coursesOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-gray-100 shadow-xl py-2 z-50">
                {courses.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-gray-400">No courses available yet</p>
                ) : (
                  courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/course/${course.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => setCoursesOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: course.icon_color }}>
                        {course.code ? course.code.substring(0, 3).toUpperCase() : course.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{course.name}</p>
                        <p className="text-[11px] text-gray-400">{course.duration_years} years · {course.duration_years * 2} semesters</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-gray-500 text-[13px] font-medium hover:text-[#0D0D0D] transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  <Shield className="w-4 h-4" /> Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-full border border-gray-200 text-gray-600 text-[13px] font-semibold px-5 py-2 hover:bg-gray-50 transition-all duration-300">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-full border border-[#0D0D0D] text-[#0D0D0D] text-[13px] font-semibold px-5 py-2 hover:bg-[#0D0D0D] hover:text-white transition-all duration-300">
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-[#0D0D0D] p-1" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {/* Mobile courses */}
          {courses.length > 0 && (
            <div className="pb-3 border-b border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Courses</p>
              {courses.map((course) => (
                <Link key={course.id} href={`/course/${course.id}`} className="flex items-center gap-3 py-2" onClick={() => setMobileOpen(false)}>
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: course.icon_color }}>
                    {course.code ? course.code.substring(0, 2) : course.name.substring(0, 2)}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{course.name}</span>
                </Link>
              ))}
            </div>
          )}

          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="block text-gray-500 text-sm hover:text-[#0D0D0D]" onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
          ))}

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center justify-center gap-2 rounded-full bg-primary/10 text-primary text-sm font-semibold px-5 py-2" onClick={() => setMobileOpen(false)}>
                    <Shield className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center justify-center gap-2 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold px-5 py-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="block text-center rounded-full border border-[#0D0D0D] text-[#0D0D0D] text-sm font-semibold px-5 py-2" onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
