"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { parseSSEStream } from "@/lib/sse";
import { cn } from "@/lib/utils";
import { MessageBubble, type Role } from "./MessageBubble";
import { CitationsPanel, type Citation } from "./CitationsPanel";

type Message = { role: Role; content: string };

// Next.js dev의 rewrite proxy는 SSE를 버퍼링한다 → 백엔드 직접 호출.
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

const SUGGESTED = [
  "인터로이드는 어떤 회사야?",
  "SeiRen Suite의 구성 요소를 알려줘.",
  "LLM Chatbot 솔루션의 RAG 지원 형식은?",
  "이 채용 공고의 우대사항이 뭐야?",
];

export function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  async function send(question: string) {
    if (!question.trim() || streaming) return;
    setError(null);
    setInput("");
    const history = [...messages];
    const next: Message[] = [
      ...history,
      { role: "user", content: question },
      { role: "assistant", content: "" },
    ];
    setMessages(next);
    setStreaming(true);
    setCitations([]);

    try {
      const res = await fetch(`${BACKEND}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ question, history }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      let assistant = "";
      for await (const ev of parseSSEStream(res)) {
        if (ev.event === "citations") {
          try {
            setCitations(JSON.parse(ev.data) as Citation[]);
          } catch {}
        } else if (ev.event === "delta") {
          assistant += ev.data;
          setMessages((cur) => {
            const copy = [...cur];
            copy[copy.length - 1] = { role: "assistant", content: assistant };
            return copy;
          });
        } else if (ev.event === "done") {
          break;
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setMessages((cur) => cur.slice(0, -1)); // 빈 응답 제거
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full">
      <div className="flex flex-1 flex-col">
        <div ref={scrollerRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-8 space-y-4">
            {messages.length === 0 ? (
              <EmptyState onPick={(q) => send(q)} />
            ) : (
              messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  role={m.role}
                  content={m.content}
                  streaming={
                    streaming && i === messages.length - 1 && m.role === "assistant"
                  }
                />
              ))
            )}
            {error && (
              <div className="text-body-sm text-danger border border-danger/40 bg-danger/10 rounded-lg px-3 py-2">
                통신 오류: {error}
              </div>
            )}
          </div>
        </div>
        <Composer
          input={input}
          setInput={setInput}
          onSend={() => send(input)}
          disabled={streaming}
        />
      </div>
      <CitationsPanel citations={citations} />
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex flex-col items-start gap-6 pt-12">
      <div>
        <h2 className="text-h1 mb-2">인터로이드 회사 챗봇</h2>
        <p className="text-text-muted text-body">
          공식 자료를 인덱싱한 RAG 챗봇입니다. 회사·솔루션·채용 관련 질문을
          해보세요.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED.map((q) => (
          <button
            key={q}
            onClick={() => onPick(q)}
            className="btn-secondary"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function Composer({
  input,
  setInput,
  onSend,
  disabled,
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  return (
    <div className="border-t border-border/40 bg-bg/80 backdrop-blur">
      <div className="mx-auto max-w-3xl px-6 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder="질문을 입력하세요. Enter로 전송, Shift+Enter로 줄바꿈."
            className="flex-1 resize-none rounded-lg bg-surface border border-border/60 px-3 py-2.5 text-body focus:outline-none focus:border-accent placeholder:text-text-subtle"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className={cn(
              "btn-primary h-10 w-10 px-0",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            aria-label="전송"
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
