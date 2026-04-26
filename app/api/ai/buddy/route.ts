import { NextRequest, NextResponse } from "next/server";
import { callGroq } from "@/lib/groq-client";
import { BUDDY_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { message, currentPageText, chapterId, conversationHistory } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Build messages from conversation history (last 8)
    const history = (conversationHistory || []).slice(-8).map((msg: any) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Build the user message with page context
    const userContent = currentPageText
      ? `[Current PDF page text: "${currentPageText.slice(0, 3000)}"]\n\nStudent question: ${message}`
      : message;

    const messages = [
      ...history,
      { role: "user" as const, content: userContent },
    ];

    const reply = await callGroq(messages, BUDDY_SYSTEM_PROMPT);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Buddy error:", error);
    return NextResponse.json(
      { reply: "I'm having trouble right now. Please try again in a moment!" },
      { status: 200 }
    );
  }
}
