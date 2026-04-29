import { NextRequest, NextResponse } from "next/server";
import { callGroq } from "@/lib/groq-client";
import { BUDDY_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { message, currentPageText, chapterId, conversationHistory, currentPageNumber } =
      await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Optionally fetch chapter metadata from Supabase for extra context
    let chapterContext = "";
    if (chapterId) {
      try {
        const supabase = await createServiceClient();
        const { data: chapter } = await supabase
          .from("chapters")
          .select("title, number")
          .eq("id", chapterId)
          .single();
        if (chapter) {
          chapterContext = `Chapter ${chapter.number}: ${chapter.title}`;
        }
      } catch {
        // Silently ignore — chapter context is optional enrichment
      }
    }

    // Build conversation history (last 8 turns)
    const history = (conversationHistory || []).slice(-8).map((msg: any) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Build the user message with full page context injected
    let contextBlock = "";
    if (chapterContext) {
      contextBlock += `[Subject: ${chapterContext}]\n`;
    }
    if (currentPageText && currentPageText.trim().length > 0) {
      contextBlock += `[Current PDF page ${currentPageNumber ?? ""} content:\n"${currentPageText
        .trim()
        .slice(0, 3500)}"]\n`;
    } else {
      contextBlock += `[Note: No PDF page text available yet — the student may still be loading the page.]\n`;
    }

    const userContent = `${contextBlock}\nStudent question: ${message}`;

    const messages = [
      ...history,
      { role: "user" as const, content: userContent },
    ];

    const reply = await callGroq(messages, BUDDY_SYSTEM_PROMPT);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Buddy error:", error?.message || error);
    return NextResponse.json(
      { reply: "I'm having trouble right now. Please try again in a moment!" },
      { status: 200 }
    );
  }
}
