"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Sparkles, BookOpen, FileText } from "lucide-react";
import type { Message } from "@/types";

interface AIBuddyProps {
  currentPageText: string;
  chapterId: string;
}

const quickActions = [
  {
    label: "Explain this page",
    prompt: "Explain this page content to me simply, like I am hearing it for the first time.",
    icon: FileText,
  },
  {
    label: "Quiz me",
    prompt: "Give me 3 quick quiz questions from this page content to test my understanding.",
    icon: Sparkles,
  },
  {
    label: "Summarize",
    prompt: "Give me a bullet-point summary of the key points on this page.",
    icon: BookOpen,
  },
];

export default function AIBuddy({ currentPageText, chapterId }: AIBuddyProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey there! 👋 I'm **SnapBuddy**, your AI study assistant. I can see the PDF page you're reading. Ask me anything about it, or try the quick actions below!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(userMessage: string) {
    if (!userMessage.trim() || isLoading) return;

    const newUserMsg: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          currentPageText: currentPageText?.slice(0, 3000) || "",
          chapterId,
          conversationHistory: messages.slice(-8),
        }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        role: "assistant",
        content: data.reply || "Sorry, I couldn't process that. Try again!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function renderMarkdown(text: string) {
    // Simple markdown: bold, bullets
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\- /gm, '• ')
      .replace(/\n/g, '<br/>');
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">AI Buddy</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[280px] px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-2xl rounded-tr-sm"
                  : "bg-gray-50 border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
              }`}
              dangerouslySetInnerHTML={
                msg.role === "assistant"
                  ? { __html: renderMarkdown(msg.content) }
                  : undefined
              }
            >
              {msg.role === "user" ? msg.content : undefined}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-3.5 h-3.5 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-2 items-start">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-2 h-2 bg-muted rounded-full animate-bounce-dot" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-muted rounded-full animate-bounce-dot" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-muted rounded-full animate-bounce-dot" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2 flex gap-2 flex-shrink-0 border-t border-gray-50">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => sendMessage(action.prompt)}
              disabled={isLoading}
              className="text-xs bg-primary/5 text-primary px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors font-medium flex items-center gap-1 disabled:opacity-50"
            >
              <Icon className="w-3 h-3" />
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-white p-3 flex gap-2 flex-shrink-0">
        <Textarea
          ref={textareaRef}
          placeholder="Ask anything about this page..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          rows={2}
          className="resize-none rounded-xl border-gray-200 text-sm"
        />
        <Button
          size="icon"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="rounded-xl h-auto w-12 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
