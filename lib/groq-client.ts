// ============================================
// Groq AI Client with Key Rotation System
// ============================================
// Collects all GROQ_API_KEY_N env vars and rotates
// through them on 429 (rate limit) errors.
// ============================================

const groqKeys: string[] = [];
let i = 1;
while (process.env[`GROQ_API_KEY_${i}`]) {
  groqKeys.push(process.env[`GROQ_API_KEY_${i}`]!);
  i++;
}

// Module-level rotating index — persists across calls in the same server instance
let currentKeyIndex = 0;

export async function callGroq(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  systemPrompt?: string
): Promise<string> {
  if (groqKeys.length === 0) {
    throw new Error(
      "No Groq API keys configured. Add GROQ_API_KEY_1, GROQ_API_KEY_2, etc. to .env.local"
    );
  }

  const maxAttempts = groqKeys.length;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const apiKey = groqKeys[currentKeyIndex];

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.GROQ_MODEL ?? "llama3-70b-8192",
            messages: systemPrompt
              ? [{ role: "system" as const, content: systemPrompt }, ...messages]
              : messages,
            max_tokens: 2048,
            temperature: 0.7,
          }),
        }
      );

      // If rate limited: rotate key and retry
      if (response.status === 429) {
        currentKeyIndex = (currentKeyIndex + 1) % groqKeys.length;
        attempts++;
        continue;
      }

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content as string;
    } catch (err: unknown) {
      const error = err as Error & { status?: number };
      if (error?.message?.includes("rate_limit") || error?.status === 429) {
        currentKeyIndex = (currentKeyIndex + 1) % groqKeys.length;
        attempts++;
        continue;
      }
      throw err;
    }
  }

  // All keys exhausted in this rotation cycle
  currentKeyIndex = 0;
  throw new Error("AI is busy right now. Please try again in a moment.");
}
