import { NextRequest, NextResponse } from "next/server";
import { callGroq } from "@/lib/groq-client";
import { PAGE_EXPLAINER_PROMPT } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { pageText } = await req.json();

    if (!pageText) {
      return NextResponse.json({ error: "No page text provided" }, { status: 400 });
    }

    const userMessage = `Explain this textbook page content clearly and simply:

${pageText.slice(0, 4000)}`;

    const reply = await callGroq(
      [{ role: "user", content: userMessage }],
      PAGE_EXPLAINER_PROMPT
    );

    return NextResponse.json({ explanation: reply });
  } catch (error: any) {
    console.error("Explain page error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
