"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, GraduationCap, Settings, LogOut, Menu, X, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Courses", href: "/admin", icon: GraduationCap },
  { label: "Site Config", href: "/admin/settings", icon: Settings },
  { label: "View Site", href: "/", icon: Globe },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    document.cookie = "admin_bypass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-0.5">
          <span className="text-white font-[900] text-xl">Snap</span>
          <span className="text-primary font-[900] text-xl">Study</span>
        </Link>
        <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1 font-semibold">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-gray-600 text-[10px] uppercase tracking-widest font-semibold px-3 mb-2">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href && item.label !== "View Site";
          return (
            <Link
              key={item.label}
              href={item.href}
              target={item.label === "View Site" ? "_blank" : undefined}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4.5 h-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-gray-500 hover:text-red-400 hover:bg-red-500/5 text-sm font-medium transition-all"
        >
          <LogOut className="w-4.5 h-4.5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 w-64 bg-[#0F0F12] h-screen flex-col z-40">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0F0F12] px-4 py-3 flex items-center justify-between border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-0.5">
          <span className="text-white font-[900] text-lg">Snap</span>
          <span className="text-primary font-[900] text-lg">Study</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-2">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 w-64 bg-[#0F0F12] h-full flex flex-col border-r border-white/5">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
