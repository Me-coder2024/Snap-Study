import { NextRequest, NextResponse } from "next/server";
import { callGroq } from "@/lib/groq-client";
import { PYQ_ANALYZER_PROMPT } from "@/lib/ai/prompts";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { subjectId } = await req.json();

    // Fetch all PYQs
    const { data: pyqs } = await getSupabase()
      .from("pyq")
      .select("*")
      .eq("subject_id", subjectId);

    if (!pyqs?.length) {
      return NextResponse.json({ error: "No PYQs found" }, { status: 400 });
    }

    // Extract text from PYQs
    const pyqTexts: string[] = [];
    for (const pyq of pyqs.slice(0, 3)) {
      const { data: url } = await getSupabase().storage
        .from("pyq-pdfs")
        .createSignedUrl(pyq.pdf_url, 600);
      if (url) {
        try {
          const res = await fetch(url.signedUrl);
          const buf = Buffer.from(await res.arrayBuffer());
          const pdfParse = (await import("pdf-parse")).default;
          const data = await pdfParse(buf);
          pyqTexts.push(data.text.slice(0, 3000));
        } catch {}
      }
    }

    // Fetch chapter text caches
    const { data: chapters } = await getSupabase()
      .from("chapters")
      .select("pdf_text_cache")
      .eq("subject_id", subjectId)
      .not("pdf_text_cache", "is", null);

    const chapterTexts = (chapters || [])
      .map((c) => c.pdf_text_cache?.slice(0, 2000) || "")
      .filter(Boolean);

    // Call Groq
    const userMessage = `Analyze these previous year exam questions and chapter content.
Identify patterns and generate 10 high-probability questions.
Return ONLY raw JSON array:
[{"question":"...","option_a":"...","option_b":"...","option_c":"...","option_d":"...","correct_answer":"A","explanation":"..."}]

PYQ Papers Content:
${pyqTexts.join("\n\n---\n\n")}

Chapter Content:
${chapterTexts.join("\n\n---\n\n")}`;

    const response = await callGroq(
      [{ role: "user", content: userMessage }],
      PYQ_ANALYZER_PROMPT
    );

    let questions;
    try {
      const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      questions = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Delete old pyq_pattern questions and insert new
    await getSupabase().from("ai_questions").delete().eq("subject_id", subjectId).eq("source", "pyq_pattern");

    const rows = questions.map((q: any) => ({
      subject_id: subjectId,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation || "",
      question_type: "mcq",
      source: "pyq_pattern",
    }));

    await getSupabase().from("ai_questions").insert(rows);

    return NextResponse.json({ success: true, count: rows.length });
  } catch (error: any) {
    console.error("PYQ analysis error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
