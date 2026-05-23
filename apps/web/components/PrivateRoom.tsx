"use client";

import { useEffect, useRef } from "react";
import { PrivateChatInput } from "@repo/ui";
import { PrivateMessage, PrivateRoom as PrivateRoomType } from "../hooks/use-chat";
import { searchGifs } from "../api-calls/gifcalls";
import { PrivateBubble } from "./PrivateBubble";

interface PrivateRoomProps {
  room: PrivateRoomType;
  messages: PrivateMessage[];
  currentUsername: string;
  token: string;
  onSendMessage: (content: string, msgType?: "TEXT" | "GIF") => void;
  onSendMedia: (file: File, mediaKind: "picture" | "video") => Promise<void>;
  onLeave: () => void;
}

export function PrivateRoomScreen({
  room,
  messages,
  currentUsername,
  onSendMessage,
  onSendMedia,
  onLeave,
  token,
}: PrivateRoomProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const otherUser = room.participants.find((p) => p.username !== currentUsername);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-background animate-in slide-in-from-right duration-300">

      {/* Ambient background — matches main room */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* Content wrapper — same max-width as ChatRoom */}
      <div className="relative flex flex-col h-full max-w-lg mx-auto w-full">

        {/* Soft side borders */}
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent" />

        {/* Header */}
        <div className="shrink-0 bg-card/70 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center gap-3 px-4 py-3">

            {/* Back button */}
            <button
              onClick={onLeave}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
              aria-label="Leave room"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>

            {/* Avatar + user info */}
            {otherUser && (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ring-2 ring-border/50"
                  style={{ backgroundColor: avatarHue(otherUser.username) }}
                >
                  {otherUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-none">
                    {otherUser.username}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    private · ephemeral
                  </p>
                </div>
              </div>
            )}

            {/* Leave button */}
            <button
              onClick={onLeave}
              className="shrink-0 text-[11px] font-mono text-destructive/60 hover:text-destructive px-2.5 py-1 rounded-md hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all"
            >
              leave
            </button>
          </div>

          {/* Ephemeral notice */}
          <div className="flex items-center justify-center gap-1.5 px-4 py-1.5 border-t border-border/30 bg-amber-500/5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-500 shrink-0">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
              end-to-end private · messages never saved · disappears on exit
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto py-4 px-2 flex flex-col gap-1 scroll-smooth bg-background/40">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground/30 select-none">
              <div className="w-12 h-12 rounded-full border border-border/50 bg-muted/30 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="text-center space-y-0.5">
                <p className="text-xs text-muted-foreground/50">
                  No one else can see this
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/30">
                  say hi to {otherUser?.username}
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const prev = messages[i - 1];
            const isMine = msg.fromUsername === currentUsername;
            const prevIsSame =
              prev?.fromUsername === msg.fromUsername &&
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
        <div className="shrink-0 bg-card/70 backdrop-blur-md border-t border-border/50 px-1 py-1">
          <div className="flex items-center gap-1.5 px-3 pb-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              private room · {otherUser?.username}
            </span>
          </div>
          <PrivateChatInput
            searchGifs={searchGifs}
            onSendText={onSendMessage}
            onSendMedia={onSendMedia}
            placeholder={`Message ${otherUser?.username ?? "privately"}…`}
          />
        </div>
      </div>
    </div>
  );
}

function avatarHue(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++)
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 55%, 58%)`;
}