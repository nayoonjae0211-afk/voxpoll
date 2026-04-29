"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Phone, Loader2, AlertCircle } from "lucide-react";
import { CallRoom, type CallToken } from "@/components/call/CallRoom";

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export default function CallPage() {
  const [name, setName] = useState("");
  const [conn, setConn] = useState<CallToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND}/api/livekit/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: name.trim() || "응답자" }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status} — ${t}`);
      }
      setConn((await res.json()) as CallToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b border-border/40 backdrop-blur sticky top-0 z-10 bg-bg/80">
        <div className="mx-auto h-full max-w-7xl px-6 flex items-center justify-between">
          <Link href="/" className="btn-ghost h-9 px-2 -ml-2" aria-label="홈으로">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-body-sm">홈</span>
          </Link>
          <div className="flex items-center gap-2 text-text">
            <Phone className="h-4 w-4 text-accent" />
            <span className="text-body-sm font-medium">VoxPoll · 시장조사 OB</span>
          </div>
          <div className="text-caption text-text-subtle font-mono">
            LiveKit · Gemini · Google STT/TTS
          </div>
        </div>
      </header>

      {conn ? (
        <CallRoom conn={conn} onLeft={() => setConn(null)} />
      ) : (
        <main className="flex-1 flex flex-col">
          <section className="mx-auto max-w-2xl px-6 pt-20 pb-12 w-full">
            <h1 className="text-h1 mb-2">콜봇으로 전화 받기</h1>
            <p className="text-text-muted text-body mb-8">
              VoxPoll 시장조사 콜봇이 한국어 음성으로 10문항 설문을 진행합니다.
              브라우저 마이크 권한이 필요해요. 끝나거나 종료 버튼을 누르면
              응답이 대시보드에 자동 저장됩니다.
            </p>

            <div className="card space-y-4">
              <label className="block">
                <span className="text-body-sm text-text-muted">표시 이름 (선택)</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 마케팅팀 김지원"
                  className="mt-1 w-full h-10 px-3 rounded-md bg-bg border border-border/60 focus:outline-none focus:border-accent text-body"
                />
              </label>
              <button
                onClick={start}
                disabled={loading}
                className="btn-primary w-full h-11"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                {loading ? "연결 중…" : "전화 받기"}
              </button>
              {error && (
                <div className="flex items-start gap-2 text-body-sm text-danger border border-danger/40 bg-danger/10 rounded-md px-3 py-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="break-all">{error}</span>
                </div>
              )}
            </div>

            <div className="mt-8 text-body-sm text-text-muted space-y-1.5">
              <p>· 마이크 사용 권한을 묻는 팝업이 뜨면 허용해주세요.</p>
              <p>· 가상 신제품 &lsquo;VoxPoll&rsquo;에 대한 시장조사를 가정합니다.</p>
              <p>· 답변은 자유롭게 한국어로 말씀하시면 됩니다.</p>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
