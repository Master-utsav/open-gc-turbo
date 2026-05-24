"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";

export interface ChatMessage {
  id: number;
  username: string;
  userId: number;
  content: string;
  msgType: "TEXT" | "GIF";
  createdAt: string;
}

interface ChatBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  compact?: boolean;
  /** Called when someone clicks on another user's avatar/name — triggers private knock */
  onKnock: (targetUserId: number) => void;
  userId: number; // the message author's userId, needed for knock
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}

function avatarHue(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`;
}

const ChatBubble = ({ message, isMine, compact = false, onKnock }: ChatBubbleProps) => {
  const { username, content, msgType, createdAt, userId: otherUserId } = message;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
      className={cn(
        "flex items-end gap-2.5 w-full px-4",
        isMine ? "flex-row-reverse" : "flex-row",
        compact ? "mt-0.5" : "mt-2"
      )}
    >
      {/* Avatar — other users only. Clickable to send private knock. */}
      {!isMine && (
        <button
          type="button"
          onClick={() => onKnock(otherUserId)}
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm",
            "text-[10px] font-bold text-white mb-0.5 select-none",
            "transition-transform hover:scale-110 active:scale-95",
            compact ? "invisible pointer-events-none" : "cursor-pointer"
          )}
          style={{ backgroundColor: avatarHue(username) }}
          title={`Chat privately with ${username}`}
          aria-label={`Send private message request to ${username}`}
        >
          {getInitial(username)}
        </button>
      )}

      <div className={cn("flex flex-col gap-0.5 max-w-[72%]", isMine ? "items-end" : "items-start")}>
        {/* Username — clickable too */}
        {!isMine && !compact && (
          <button
            type="button"
            onClick={() => onKnock(otherUserId)}
            className="text-[10px] font-semibold text-muted-foreground px-1 hover:text-primary transition-colors text-left cursor-pointer font-sans"
            title={`Chat privately with ${username}`}
          >
            {username}
          </button>
        )}

        {/* Bubble content — text or GIF */}
        <div
          className={cn(
            "rounded-2xl text-[13.5px] leading-snug wrap-break-word  whitespace-pre-wrap overflow-hidden shadow-xs",
            isMine
              ? "bg-primary text-primary-foreground rounded-br-xs font-medium"
              : "bg-muted text-foreground rounded-bl-xs",
            msgType === "GIF" ? "p-1" : "px-3.5 py-2 font-sans"
          )}
        >
          {msgType === "GIF" ? (
            <img
              src={content}
              alt="GIF"
              className="rounded-xl max-w-55 max-h-45 object-cover shadow-sm"
              loading="lazy"
            />
          ) : (
            content
          )}
        </div>

        <span className="text-[8.5px] text-muted-foreground/60 px-1 font-mono">{formatTime(createdAt)}</span>
      </div>
    </motion.div>
  );
};

export { ChatBubble };