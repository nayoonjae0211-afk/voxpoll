import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Phone,
  Database,
  Mic,
  GitBranch,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";

const REQUIREMENTS = [
  {
    label: "LLM 기반 챗봇/콜봇 개발",
    where: "전체",
    icon: Sparkles,
  },
  {
    label: "Dialogue Management",
    where: "backend/app/{chatbot,callbot}/",
    icon: GitBranch,
  },
  {
    label: "프롬프트 엔지니어링",
    where: "backend/app/*/prompts.py",
    icon: Bot,
  },
  {
    label: "RAG 연동 Vector DB",
    where: "backend/app/rag/ (Chroma)",
    icon: Database,
  },
  {
    label: "STT + LLM + TTS 통합",
    where: "backend/app/callbot/agent.py",
    icon: Mic,
  },
  {
    label: "여론조사·OB 콜봇 시나리오",
    where: "VoxPoll 시장조사 OB",
    icon: Phone,
  },
  {
    label: "LiveKit 경험 (우대)",
    where: "콜봇 백엔드/프론트 전체",
    icon: LayoutDashboard,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur sticky top-0 z-10 bg-bg/80">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-accent to-accent-hover" />
            <span className="font-semibold tracking-tight">VoxPoll</span>
            <span className="text-text-subtle text-caption ml-2">
              · 인터로이드 챗봇/콜봇 포트폴리오
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/chat" className="btn-ghost">
              챗봇
            </Link>
            <Link href="/call" className="btn-ghost">
              콜봇
            </Link>
            <Link href="/dashboard" className="btn-ghost">
              대시보드
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-20">
        <div className="pill bg-accent-soft text-accent mb-6">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          (주)인터로이드 LLM 챗봇/콜봇 개발자 공고 지원
        </div>
        <h1 className="text-display tracking-tight mb-6 max-w-3xl">
          한 화면에서 시연하는<br />
          <span className="bg-gradient-to-r from-accent to-cyan-300 bg-clip-text text-transparent">
            RAG 챗봇과 OB 설문 콜봇
          </span>
        </h1>
        <p className="text-body text-text-muted max-w-2xl mb-10">
          공고의 모든 자격요건과 우대사항을 실제 동작하는 데모로 옮겼습니다.
          인터로이드 회사 자료를 답하는 RAG 챗봇과, 가상 신제품 VoxPoll의
          시장조사를 진행하는 LiveKit 기반 음성 콜봇을 동시에 체험하실 수 있습니다.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/chat" className="btn-primary">
            챗봇 체험하기 <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/call" className="btn-secondary">
            <Phone className="h-4 w-4" /> 콜봇으로 전화 받기
          </Link>
          <Link href="/dashboard" className="btn-ghost">
            응답 대시보드 보기
          </Link>
        </div>
      </section>

      {/* Demo cards */}
      <section className="mx-auto max-w-5xl px-6 grid gap-4 md:grid-cols-2">
        <Link
          href="/chat"
          className="card group hover:border-accent/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-accent">
              <Bot className="h-5 w-5" />
              <span className="text-h3">챗봇 · 회사소개 RAG</span>
            </div>
            <ArrowRight className="h-5 w-5 text-text-subtle group-hover:text-accent transition-colors" />
          </div>
          <p className="text-text-muted text-body-sm mb-4">
            인터로이드 홈페이지·공고를 인덱싱한 Chroma 컬렉션에서
            관련 청크를 가져와 Gemini가 출처 인용과 함께 답변합니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="pill bg-surface-2 text-text-muted">Gemini Flash</span>
            <span className="pill bg-surface-2 text-text-muted">Chroma</span>
            <span className="pill bg-surface-2 text-text-muted">SSE 스트리밍</span>
          </div>
        </Link>

        <Link
          href="/call"
          className="card group hover:border-accent/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-accent">
              <Phone className="h-5 w-5" />
              <span className="text-h3">콜봇 · VoxPoll 시장조사</span>
            </div>
            <ArrowRight className="h-5 w-5 text-text-subtle group-hover:text-accent transition-colors" />
          </div>
          <p className="text-text-muted text-body-sm mb-4">
            LiveKit Agent가 실시간 음성으로 10문항 설문조사를 진행합니다.
            Google STT로 듣고, Gemini가 분기 결정·자유응답 분류, Google
            Neural2가 답합니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="pill bg-surface-2 text-text-muted">LiveKit</span>
            <span className="pill bg-surface-2 text-text-muted">Google STT/TTS</span>
            <span className="pill bg-surface-2 text-text-muted">Dialogue Manager</span>
          </div>
        </Link>
      </section>

      {/* Requirements mapping */}
      <section className="mx-auto max-w-5xl px-6 mt-20">
        <h2 className="text-h2 mb-2">공고 요건 ↔ 구현 매핑</h2>
        <p className="text-text-muted text-body-sm mb-6">
          공고에 적힌 모든 자격요건/우대사항을 어디서 시연했는지 정리했습니다.
        </p>
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-body-sm">
            <thead className="border-b border-border/60">
              <tr className="text-text-muted">
                <th className="py-3 px-5 text-left font-medium">요건</th>
                <th className="py-3 px-5 text-left font-medium">위치</th>
              </tr>
            </thead>
            <tbody>
              {REQUIREMENTS.map((req) => {
                const Icon = req.icon;
                return (
                  <tr
                    key={req.label}
                    className="border-b border-border/30 last:border-0"
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-accent" />
                        <span>{req.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-text-muted font-mono text-caption">
                      {req.where}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Architecture */}
      <section className="mx-auto max-w-5xl px-6 mt-20 mb-32">
        <h2 className="text-h2 mb-2">아키텍처</h2>
        <p className="text-text-muted text-body-sm mb-6">
          챗봇·콜봇이 같은 RAG/LLM 스택을 공유하되, 콜봇은 LiveKit Agent
          별도 프로세스로 분리해 STT·TTS 스트리밍을 담당합니다.
        </p>
        <div className="card overflow-x-auto">
          <pre className="text-caption text-text-muted leading-relaxed font-mono">
            {`┌──────────────────┐       ┌──────────────────────────┐
│  Next.js (3000)  │       │  FastAPI (8000)          │
│  /chat /call /…  │ HTTP  │  /api/chat (SSE)         │
│                  │──────▶│  /api/livekit/token      │
└────────┬─────────┘       │  /api/results            │
         │                 └──────────┬───────────────┘
         │ WebRTC                     │
         ▼                            ▼
┌──────────────────┐       ┌──────────────────────────┐
│  LiveKit Server  │       │  Chroma · SQLite         │
└────────┬─────────┘       └──────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  LiveKit Agent (Python)                              │
│  Google STT  →  Gemini (Dialogue)  →  Google TTS     │
└──────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </section>

      <footer className="border-t border-border/40">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between text-caption text-text-subtle">
          <span>© 2026 VoxPoll Demo · 포트폴리오용 비상업 사용</span>
          <span className="font-mono">v0.1.0</span>
        </div>
      </footer>
    </main>
  );
}
