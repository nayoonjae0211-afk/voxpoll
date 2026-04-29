import { FileText } from "lucide-react";

export type Citation = {
  source: string;
  section: string;
  score: number;
};

export function CitationsPanel({ citations }: { citations: Citation[] }) {
  return (
    <aside className="w-72 shrink-0 hidden lg:flex flex-col border-l border-border/40 bg-bg/50">
      <div className="px-4 py-3 border-b border-border/40">
        <h3 className="text-h3 text-text">검색된 출처</h3>
        <p className="text-caption text-text-subtle mt-1">
          마지막 답변에 사용된 RAG 인용
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {citations.length === 0 ? (
          <p className="text-body-sm text-text-subtle">
            질문을 보내면 인터로이드 코퍼스에서 가져온 출처가 여기에 표시됩니다.
          </p>
        ) : (
          citations.map((c, i) => (
            <div
              key={`${c.source}-${c.section}-${i}`}
              className="rounded-lg border border-border/40 bg-surface/60 p-3"
            >
              <div className="flex items-center gap-1.5 text-accent mb-1">
                <FileText className="h-3.5 w-3.5" />
                <span className="text-caption font-medium font-mono">
                  {c.source}
                </span>
              </div>
              <p className="text-body-sm text-text leading-snug">{c.section}</p>
              <p className="text-caption text-text-subtle mt-1.5 font-mono">
                score {c.score.toFixed(2)}
              </p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
