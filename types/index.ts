// ============================================
// Snap Study — TypeScript Interfaces
// ============================================

export interface Semester {
  id: number;
  number: number;
  title: string;
  is_active: boolean;
}

export interface Subject {
  id: string;
  semester_id: number;
  name: string;
  code: string;
  description: string;
  icon_color: string;
  total_chapters: number;
  created_at: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  number: number;
  title: string;
  pdf_url: string | null;
  ppt_url: string | null;
  pdf_text_cache: string | null;
  created_at: string;
}

export interface Syllabus {
  id: string;
  subject_id: string;
  pdf_url: string;
  file_name: string;
  uploaded_at: string;
}

export interface PYQ {
  id: string;
  subject_id: string;
  year: string;
  exam_type: string;
  pdf_url: string;
  file_name: string;
  uploaded_at: string;
}

export interface QuestionBank {
  id: string;
  subject_id: string;
  chapter_id: string;
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  created_at: string;
}

export interface AIQuestion {
  id: string;
  subject_id: string;
  chapter_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  question_type: string;
  source: "ai" | "pyq_pattern";
  generated_at: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "admin";
  avatar_url: string | null;
  created_at: string;
}
