"use client";

import { useState, useCallback } from "react";
import type { Message } from "@/types";

export function useAIBuddy(chapterId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (message: string, currentPageText: string) => {
      if (!message.trim() || isLoading) return;

      const userMsg: Message = { role: "user", content: message, timestamp: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/ai/buddy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            currentPageText: currentPageText?.slice(0, 3000) || "",
            chapterId,
            conversationHistory: messages.slice(-8),
          }),
        });

        const data = await res.json();
        const aiMsg: Message = {
          role: "assistant",
          content: data.reply || "Sorry, I couldn't process that.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Something went wrong. Try again!", timestamp: new Date() },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [chapterId, isLoading, messages]
  );

  return { messages, isLoading, sendMessage, setMessages };
}
