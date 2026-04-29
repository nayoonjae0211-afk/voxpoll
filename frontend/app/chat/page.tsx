import Link from "next/link";
import { ChevronLeft, Bot } from "lucide-react";
import { ChatRoom } from "@/components/chat/ChatRoom";

export const metadata = { title: "챗봇 · VoxPoll" };

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b border-border/40 backdrop-blur sticky top-0 z-10 bg-bg/80">
        <div className="mx-auto h-full max-w-7xl px-6 flex items-center justify-between">
          <Link
            href="/"
            className="btn-ghost h-9 px-2 -ml-2"
            aria-label="홈으로"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-body-sm">홈</span>
          </Link>
          <div className="flex items-center gap-2 text-text">
            <Bot className="h-4 w-4 text-accent" />
            <span className="text-body-sm font-medium">인터로이드 회사 챗봇</span>
          </div>
          <div className="text-caption text-text-subtle font-mono">
            RAG · Gemini · Chroma
          </div>
        </div>
      </header>
      <ChatRoom />
    </div>
  );
}
