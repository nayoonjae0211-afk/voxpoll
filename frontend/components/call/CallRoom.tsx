"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { Transcript } from "./Transcript";
import { CallControls } from "./CallControls";

export type CallToken = {
  token: string;
  url: string;
  room: string;
  identity: string;
};

export function CallRoom({
  conn,
  onLeft,
}: {
  conn: CallToken;
  onLeft: () => void;
}) {
  return (
    <LiveKitRoom
      token={conn.token}
      serverUrl={conn.url}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={onLeft}
      className="h-full"
    >
      <RoomAudioRenderer />
      <div className="mx-auto max-w-3xl px-6 py-12 grid gap-8">
        <div className="flex flex-col items-center gap-6 pt-8">
          <VoiceVisualizer />
          <p className="text-text-muted text-body-sm">
            VoxPoll 콜봇과 실제로 통화 중입니다 · 룸 {conn.room}
          </p>
        </div>
        <Transcript />
        <CallControls onLeft={onLeft} />
      </div>
    </LiveKitRoom>
  );
}
