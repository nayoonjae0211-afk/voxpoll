"use client";

import {
  useLocalParticipant,
  useDisconnectButton,
} from "@livekit/components-react";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function CallControls({ onLeft }: { onLeft?: () => void }) {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const { buttonProps } = useDisconnectButton({
    stopTracks: true,
  });

  const toggleMic = async () => {
    await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={toggleMic}
        aria-label={isMicrophoneEnabled ? "마이크 끄기" : "마이크 켜기"}
        className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
          isMicrophoneEnabled
            ? "bg-surface border border-border/60 hover:bg-surface-2"
            : "bg-warning/15 border border-warning/40 text-warning"
        )}
      >
        {isMicrophoneEnabled ? (
          <Mic className="h-5 w-5" />
        ) : (
          <MicOff className="h-5 w-5" />
        )}
      </button>
      <button
        {...buttonProps}
        onClick={(e) => {
          buttonProps.onClick?.(e);
          onLeft?.();
        }}
        aria-label="통화 종료"
        className="h-12 w-12 rounded-full bg-danger hover:bg-danger/90 text-white flex items-center justify-center"
      >
        <PhoneOff className="h-5 w-5" />
      </button>
    </div>
  );
}
