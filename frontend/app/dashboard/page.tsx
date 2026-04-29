"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  LayoutDashboard,
  RefreshCw,
  Loader2,
  TrendingUp,
  CheckCircle2,
  PhoneCall,
  ThumbsUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

type FunnelEntry = { step: string; count: number };
type Distribution = { label: string; count: number };
type Summary = {
  total: number;
  completed: number;
  completion_rate: number;
  consent_count: number;
  qualified_count: number;
  funnel: FunnelEntry[];
  distributions: Record<string, Distribution[]>;
  nps: { scores: number[]; mean: number | null; count: number };
};

type SessionRow = {
  id: string;
  started_at: string | null;
  ended_at: string | null;
  last_step: string | null;
  completed: boolean;
  consent: number | null;
  qualified: number | null;
  nps: number | null;
  answer_count: number;
};

const STEP_LABEL: Record<string, string> = {
  intro: "인사·동의",
  q1_role: "Q1 직무",
  q2_outsource: "Q2 외주빈도",
  q3_budget: "Q3 예산",
  q4_pain: "Q4 Pain",
  q5_aware: "Q5 인지",
  q6_concept: "Q6 컨셉",
  q7_concern: "Q7 우려",
  q8_price: "Q8 가격",
  q9_trial: "Q9 시범",
  q10_nps: "Q10 NPS",
  outro: "마무리",
};

const DIST_TITLE: Record<string, string> = {
  q4_pain: "Q4 · 가장 아쉬운 점",
  q6_concept: "Q6 · 컨셉 반응",
  q8_price: "Q8 · 가격 수용성",
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, l] = await Promise.all([
        fetch(`${BACKEND}/api/results/summary`).then((r) => r.json()),
        fetch(`${BACKEND}/api/results/sessions?limit=50`).then((r) => r.json()),
      ]);
      setSummary(s);
      setSessions(l.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b border-border/40 backdrop-blur sticky top-0 z-10 bg-bg/80">
        <div className="mx-auto h-full max-w-7xl px-6 flex items-center justify-between">
          <Link href="/" className="btn-ghost h-9 px-2 -ml-2" aria-label="홈으로">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-body-sm">홈</span>
          </Link>
          <div className="flex items-center gap-2 text-text">
            <LayoutDashboard className="h-4 w-4 text-accent" />
            <span className="text-body-sm font-medium">VoxPoll 응답 대시보드</span>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="btn-ghost h-9 px-2"
            aria-label="새로고침"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="text-body-sm">새로고침</span>
          </button>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
          {error && (
            <div className="text-body-sm text-danger border border-danger/40 bg-danger/10 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {/* KPI */}
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KPI
              icon={PhoneCall}
              label="총 세션"
              value={summary?.total ?? 0}
              hint="콜봇 통화 시도 횟수"
            />
            <KPI
              icon={CheckCircle2}
              label="완료율"
              value={
                summary
                  ? `${Math.round(summary.completion_rate * 100)}%`
                  : "0%"
              }
              hint={`완료 ${summary?.completed ?? 0}건`}
            />
            <KPI
              icon={ThumbsUp}
              label="동의율"
              value={
                summary && summary.total
                  ? `${Math.round(
                      (summary.consent_count / summary.total) * 100
                    )}%`
                  : "0%"
              }
              hint={`동의 ${summary?.consent_count ?? 0}건`}
            />
            <KPI
              icon={TrendingUp}
              label="평균 NPS"
              value={
                summary?.nps.mean !== null && summary?.nps.mean !== undefined
                  ? summary.nps.mean.toFixed(1)
                  : "-"
              }
              hint={`응답 ${summary?.nps.count ?? 0}건`}
            />
          </section>

          {/* 퍼널 */}
          <section className="card">
            <h2 className="text-h2 mb-1">단계별 도달 수</h2>
            <p className="text-body-sm text-text-muted mb-4">
              사용자가 어느 단계까지 진행했는지 — 단계 이탈률 파악
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={(summary?.funnel ?? []).map((f) => ({
                    ...f,
                    label: STEP_LABEL[f.step] ?? f.step,
                  }))}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid stroke="#27272A" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#71717A"
                    tick={{ fill: "#A1A1AA", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    stroke="#71717A"
                    tick={{ fill: "#A1A1AA", fontSize: 11 }}
                    width={88}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#18181B",
                      border: "1px solid #3F3F46",
                      borderRadius: 8,
                      color: "#FAFAFA",
                      fontSize: 12,
                    }}
                    cursor={{ fill: "rgba(6, 182, 212, 0.08)" }}
                  />
                  <Bar dataKey="count" fill="#06B6D4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 분포 차트 3개 */}
          <section className="grid gap-3 lg:grid-cols-3">
            {summary &&
              Object.entries(summary.distributions).map(([key, dist]) => (
                <DistributionCard
                  key={key}
                  title={DIST_TITLE[key] ?? key}
                  data={dist}
                />
              ))}
          </section>

          {/* 세션 테이블 */}
          <section className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
              <div>
                <h2 className="text-h2">최근 세션</h2>
                <p className="text-body-sm text-text-muted mt-0.5">
                  통화별 진행 상태와 응답 수
                </p>
              </div>
              <span className="text-caption text-text-subtle">
                총 {sessions.length}건
              </span>
            </div>
            {sessions.length === 0 ? (
              <div className="px-5 py-12 text-center text-body-sm text-text-subtle">
                아직 통화 데이터가 없습니다. /call 에서 봇과 대화해보세요.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-body-sm">
                  <thead className="border-b border-border/60 text-text-muted">
                    <tr>
                      <Th>세션 ID</Th>
                      <Th>시작</Th>
                      <Th>마지막 단계</Th>
                      <Th>응답</Th>
                      <Th>완료</Th>
                      <Th>NPS</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-border/30 last:border-0 hover:bg-surface/40"
                      >
                        <Td mono>{s.id}</Td>
                        <Td>{fmtTime(s.started_at)}</Td>
                        <Td>
                          <span className="pill bg-surface-2 text-text-muted">
                            {STEP_LABEL[s.last_step ?? ""] ??
                              s.last_step ??
                              "-"}
                          </span>
                        </Td>
                        <Td>{s.answer_count}</Td>
                        <Td>
                          <span
                            className={cn(
                              "pill",
                              s.completed
                                ? "bg-success/15 text-success"
                                : "bg-surface-2 text-text-muted"
                            )}
                          >
                            {s.completed ? "완료" : "진행중/이탈"}
                          </span>
                        </Td>
                        <Td>{s.nps ?? "-"}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 text-text-muted">
        <Icon className="h-4 w-4 text-accent" />
        <span className="text-body-sm">{label}</span>
      </div>
      <div className="text-h1 mt-2 font-semibold tracking-tight">{value}</div>
      {hint && <div className="text-caption text-text-subtle mt-1">{hint}</div>}
    </div>
  );
}

function DistributionCard({
  title,
  data,
}: {
  title: string;
  data: Distribution[];
}) {
  const palette = [
    "#06B6D4",
    "#22C55E",
    "#F59E0B",
    "#A78BFA",
    "#F472B6",
    "#94A3B8",
  ];
  return (
    <div className="card">
      <h3 className="text-h3 mb-3">{title}</h3>
      {data.length === 0 ? (
        <p className="text-body-sm text-text-subtle h-44 flex items-center">
          데이터 없음
        </p>
      ) : (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -10, right: 8 }}>
              <CartesianGrid stroke="#27272A" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#71717A"
                tick={{ fill: "#A1A1AA", fontSize: 10 }}
                interval={0}
              />
              <YAxis
                stroke="#71717A"
                tick={{ fill: "#A1A1AA", fontSize: 10 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#18181B",
                  border: "1px solid #3F3F46",
                  borderRadius: 8,
                  color: "#FAFAFA",
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(6, 182, 212, 0.08)" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={palette[i % palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-medium px-5 py-3">{children}</th>;
}

function Td({
  children,
  mono,
}: {
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <td className={cn("px-5 py-3", mono && "font-mono text-caption")}>
      {children}
    </td>
  );
}

function fmtTime(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
