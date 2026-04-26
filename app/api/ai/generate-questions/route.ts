import { NextRequest, NextResponse } from "next/server";
import { callGroq } from "@/lib/groq-client";
import { QUESTION_GENERATOR_PROMPT } from "@/lib/ai/prompts";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { chapterId, subjectId } = await req.json();

    // 1. Fetch chapter
    const { data: chapter } = await getSupabase()
      .from("chapters")
      .select("*")
      .eq("id", chapterId)
      .single();

    if (!chapter?.pdf_url) {
      return NextResponse.json({ error: "No PDF for this chapter" }, { status: 400 });
    }

    // 2. Get text from cache or extract
    let extractedText = chapter.pdf_text_cache || "";

    if (!extractedText) {
      // Download PDF and extract text
      const { data: signedUrl } = await getSupabase().storage
        .from("chapter-pdfs")
        .createSignedUrl(chapter.pdf_url, 600);

      if (signedUrl) {
        try {
          const pdfResponse = await fetch(signedUrl.signedUrl);
          const buffer = Buffer.from(await pdfResponse.arrayBuffer());
          const pdfParse = (await import("pdf-parse")).default;
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData.text;

          // Cache the text
          await getSupabase()
            .from("chapters")
            .update({ pdf_text_cache: extractedText.slice(0, 50000) })
            .eq("id", chapterId);
        } catch (err) {
          console.error("PDF parse error:", err);
          return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
        }
      }
    }

    // 3. Truncate text
    const text = extractedText.slice(0, 8000);

    // 4. Generate questions via Groq
    const userMessage = `Based on this chapter content, generate 15 MCQ questions.
Each question must have 4 options (A, B, C, D), a correct answer letter, and a brief explanation.
Return ONLY a valid JSON array, no other text, no markdown code blocks, just raw JSON.
Format: [{"question":"...","option_a":"...","option_b":"...","option_c":"...","option_d":"...","correct_answer":"A","explanation":"..."}]

Chapter content:
${text}`;

    const response = await callGroq(
      [{ role: "user", content: userMessage }],
      QUESTION_GENERATOR_PROMPT
    );

    // 5. Parse JSON
    let questions;
    try {
      const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      questions = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // 6. Delete existing and insert new
    await getSupabase().from("ai_questions").delete().eq("chapter_id", chapterId);

    const rows = questions.map((q: any) => ({
      subject_id: subjectId,
      chapter_id: chapterId,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation || "",
      question_type: "mcq",
      source: "ai",
    }));

    await getSupabase().from("ai_questions").insert(rows);

    return NextResponse.json({ success: true, count: rows.length });
  } catch (error: any) {
    console.error("Generate questions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
