import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Snap Study — AI-Powered Engineering Study Platform",
  description:
    "Turn your semester PDFs into an intelligent learning engine with AI that reads, explains, and quizzes you. Chapter-wise practice, PYQ analysis, and a real-time AI Study Buddy.",
  keywords: [
    "engineering",
    "study",
    "AI",
    "exam prep",
    "MCQ",
    "PDF",
    "study buddy",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
