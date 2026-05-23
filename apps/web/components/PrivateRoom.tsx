"use client";

import { useEffect, useRef } from "react";
import { PrivateChatInput } from "@repo/ui";
import { PrivateMessage, PrivateRoom as PrivateRoomType } from "../hooks/use-chat";
import { searchGifs } from "../api-calls/gifcalls";
import { PrivateBubble } from "./PrivateBubble";

interface PrivateRoomProps {
  room:             PrivateRoomType;
  messages:         PrivateMessage[];
  currentUsername: string;
  token: string;
  onSendMessage:    (content: string, msgType?: "TEXT" | "GIF", ) => void;
   onSendMedia: (file: File, mediaKind: "picture" | "video") => Promise<void>;
  onLeave:          () => void;
}

export function PrivateRoomScreen({
  room,
  messages,
  currentUsername,
  onSendMessage,
  onSendMedia,
  onLeave,
  token
}: PrivateRoomProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const otherUser = room.participants.find((p) => p.username !== currentUsername);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    // Full-screen overlay — slides over the global chat
    <div className="fixed inset-0 z-30 flex flex-col bg-background animate-in slide-in-from-right duration-300">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-background/95 backdrop-blur-sm shrink-0">
        <button
          onClick={onLeave}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Leave room"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        {/* Other user avatar */}
        {otherUser && (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: avatarHue(otherUser.username) }}
            >
              {otherUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{otherUser.username}</p>
              <p className="text-[10px] text-muted-foreground">Private room · disappears on exit</p>
            </div>
          </div>
        )}

        {/* Leave button */}
        <button
          onClick={onLeave}
          className="text-xs text-destructive/70 hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10 shrink-0"
        >
          Leave
        </button>
      </div>

      {/* Ephemeral notice */}
      <div className="px-4 py-2 bg-amber-500/5 border-b border-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400 text-center shrink-0">
        🔒 This conversation is private and temporary — messages are never saved
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1.5 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 text-muted-foreground/40 select-none mt-20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p className="text-xs">Say hi — no one else can see this</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const prev        = messages[i - 1];
          const isMine      = msg.fromUsername === currentUsername;
          const prevIsSame  = prev?.fromUsername === msg.fromUsername &&
          new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < 60_000;

          return (
            <PrivateBubble
              token={token}
              currentUsername={currentUsername}
              key={i}
              message={msg}
              isMine={isMine}
              compact={prevIsSame}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
          <PrivateChatInput
              searchGifs={searchGifs}
        onSendText={onSendMessage}
        onSendMedia={onSendMedia}
        placeholder="Message privately…"
      />
    </div>
  );
}

function avatarHue(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++)
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 55%, 58%)`;
}