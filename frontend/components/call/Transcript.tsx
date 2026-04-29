"use client";

import {
  useVoiceAssistant,
  useTrackTranscription,
  useLocalParticipant,
} from "@livekit/components-react";
import { useEffect, useMemo, useRef } from "react";

type Line = {
  id: string;
  speaker: "user" | "agent";
  text: string;
  final: boolean;
  time: number;
};

export function Transcript() {
  const { agentTranscriptions } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const localTracks = localParticipant?.audioTrackPublications;
  const localTrackRef = localTracks?.values().next().value
    ? {
        participant: localParticipant!,
        publication: localTracks.values().next().value!,
        source: localTracks.values().next().value!.source,
      }
    : undefined;

  const { segments: userSegments } = useTrackTranscription(localTrackRef);

  const lines: Line[] = useMemo(() => {
    const collect = (
      segs: ReadonlyArray<{
        id: string;
        text: string;
        final?: boolean;
        firstReceivedTime?: number;
        lastReceivedTime?: number;
      }>,
      speaker: "agent" | "user"
    ): Line[] =>
      segs.map((s) => ({
        id: `${speaker}-${s.id}`,
        speaker,
        text: s.text,
        final: s.final ?? true,
        time: s.firstReceivedTime ?? s.lastReceivedTime ?? 0,
      }));

    const all = [
      ...collect(agentTranscriptions ?? [], "agent"),
      ...collect(userSegments ?? [], "user"),
    ];
    // 같은 id의 partial → final 갱신 시 마지막 본 항목으로 대체
    const byId = new Map<string, Line>();
    for (const l of all) byId.set(l.id, l);
    return Array.from(byId.values()).sort((a, b) => a.time - b.time);
  }, [agentTranscriptions, userSegments]);

  // 새 라인이 들어오면 맨 아래로 자동 스크롤
  const scrollerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lines]);

  return (
    <div className="card">
      <h3 className="text-h3 mb-3">실시간 자막</h3>
      <div ref={scrollerRef} className="max-h-96 overflow-y-auto pr-1">
        {lines.length === 0 ? (
          <p className="text-body-sm text-text-subtle">
            통화가 시작되면 양쪽 발화 자막이 시간 순으로 표시됩니다.
          </p>
        ) : (
          <div className="space-y-2.5">
            {lines.map((l) => (
              <div
                key={l.id}
                className={
                  l.speaker === "agent"
                    ? "flex justify-start"
                    : "flex justify-end"
                }
              >
                <div className="max-w-[85%] text-body-sm">
                  <div
                    className={
                      l.speaker === "agent"
                        ? "text-accent text-caption font-medium mb-0.5"
                        : "text-text-muted text-caption font-medium mb-0.5 text-right"
                    }
                  >
                    {l.speaker === "agent" ? "VoxPoll" : "나"}
                  </div>
                  <div
                    className={
                      l.speaker === "agent"
                        ? "rounded-2xl rounded-tl-sm bg-surface border border-border/60 px-3 py-2"
                        : "rounded-2xl rounded-tr-sm bg-accent-soft border border-accent/20 px-3 py-2"
                    }
                  >
                    <span className={l.final ? "text-text" : "text-text-muted italic"}>
                      {l.text}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
