/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { cn } from "@repo/ui";
import { PrivateMessage } from "../hooks/use-chat";
import { EphemeralMedia } from "./EphemeralMedia";
import { motion } from "motion/react";

interface PrivateBubbleProps {
  message:         PrivateMessage;
  isMine:          boolean;
  compact?:        boolean;
  currentUsername: string; // passed down to EphemeralMedia to split sender/receiver logic
  token: string
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function avatarHue(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++)
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`;
}

export function PrivateBubble({ message, isMine, compact = false, currentUsername , token}: PrivateBubbleProps) {
  const { fromUsername, content, msgType, createdAt } = message;
  const isMedia = message.type === "private:media";

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
      {!isMine && (
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white mb-0.5 select-none shadow-sm",
            compact && "invisible"
          )}
          style={{ backgroundColor: avatarHue(fromUsername) }}
        >
          {fromUsername.charAt(0).toUpperCase()}
        </div>
      )}

      <div className={cn(
        "flex flex-col gap-0.5 max-w-[72%]",
        isMine ? "items-end" : "items-start"
      )}>
        {!isMine && !compact && (
          <span className="text-[10px] font-semibold text-muted-foreground px-1 font-sans">
            {fromUsername}
          </span>
        )}

        {/* Render based on message type */}
        {isMedia ? (
          // EphemeralMedia handles sender vs receiver logic internally
          <EphemeralMedia message={message} currentUsername={currentUsername} token={token} />
        ) : msgType === "GIF" && !isMedia ? (
          <div className={cn(
            "p-1 rounded-2xl overflow-hidden shadow-xs",
            isMine ? "bg-primary/15 rounded-br-xs" : "bg-muted rounded-bl-xs"
          )}>
            <img
              src={content}
              alt="GIF"
              className="rounded-xl max-w-50 max-h-40 object-cover shadow-sm"
              loading="lazy"
            />
          </div>
        ) : msgType === "TEXT" && !isMedia ? (
          <div className={cn(
            "px-3.5 py-2 rounded-2xl text-[13.5px] leading-snug wrap-break-word whitespace-pre-wrap shadow-xs",
            isMine
              ? "bg-primary text-primary-foreground rounded-br-xs font-medium"
              : "bg-muted text-foreground rounded-bl-xs",
            "font-sans"
          )}>
            {content}
          </div>
        ): ""}

        <span className="text-[8.5px] text-muted-foreground/60 px-1 font-mono">
          {formatTime(createdAt)}
        </span>
      </div>
    </motion.div>
  );
}