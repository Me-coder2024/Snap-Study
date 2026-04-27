import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <>
      {/* CTA Section */}
      <section id="contact" className="bg-[#F8F7F6] py-24 px-6">
        <div className="max-w-3xl mx-auto relative">
          <div className="bg-[#1a1a1a] rounded-3xl py-16 px-8 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-white font-[900] text-3xl md:text-4xl mb-3">
                Ready to Snap Your Studies?
              </h2>
              <p className="text-gray-400 font-normal text-base mb-8 max-w-md mx-auto">
                Join thousands of engineering students who study smarter with
                AI-powered tools.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="rounded-full bg-primary text-white font-semibold px-8 py-3 text-sm hover:bg-primary/80 transition-all duration-300"
                >
                  Sign Up Free
                </Link>
                <a
                  href="#features"
                  className="rounded-full border border-white/20 text-white font-medium px-8 py-3 text-sm hover:bg-white/10 transition-all duration-300"
                >
                  Watch Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-0.5">
            <span className="text-[#1a1a1a] font-[900] text-lg uppercase">Snap</span>
            <span className="text-primary font-[900] text-lg uppercase">Study</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 text-sm hover:text-[#1a1a1a] transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-400 text-sm hover:text-[#1a1a1a] transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-400 text-sm hover:text-[#1a1a1a] transition-colors">
              Contact
            </a>
          </div>

          <p className="text-gray-400 text-sm">
            © 2025 SnapStudy. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
