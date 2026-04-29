"use client";

import {
  BarVisualizer,
  useVoiceAssistant,
} from "@livekit/components-react";
import { cn } from "@/lib/utils";

const STATE_LABELS: Record<string, string> = {
  initializing: "연결 중",
  listening: "듣고 있어요",
  thinking: "생각 중",
  speaking: "말하는 중",
  disconnected: "연결 끊김",
};

export function VoiceVisualizer() {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          "relative h-44 w-44 rounded-full",
          "bg-gradient-to-br from-accent/20 to-accent/5",
          "border border-accent/30",
          "flex items-center justify-center overflow-hidden"
        )}
      >
        <BarVisualizer
          state={state}
          barCount={5}
          trackRef={audioTrack}
          options={{ minHeight: 12, maxHeight: 96 }}
          className="h-24 w-32 [&>span]:!bg-accent [&>span]:!rounded-full [&>span]:!w-2.5"
        />
      </div>
      <div className="pill bg-surface text-text-muted">
        <span
          className={cn(
            "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
            state === "speaking" && "bg-accent animate-pulse",
            state === "listening" && "bg-success animate-pulse",
            state === "thinking" && "bg-warning animate-pulse",
            (state === "disconnected" || state === "initializing") &&
              "bg-text-subtle"
          )}
        />
        {STATE_LABELS[state] ?? state}
      </div>
    </div>
  );
}
