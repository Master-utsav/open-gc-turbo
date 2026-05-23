"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";

export interface KnockNotificationInterface {
  id:           string;
  fromUserId:   number;
  fromUsername: string;
  roomId:       string;
  expiresAt:    number;
}

interface ChatHeaderProps {
  onlineCount:   number;
  notifications: KnockNotificationInterface[];
  knockStatus:   "idle" | "sent" | "declined";
  knockCooldown: number;
  onLogout:      () => void;
  onAccept:      (notif: KnockNotificationInterface) => void;
  onDecline:     (notif: KnockNotificationInterface) => void;
  onDismiss:     () => void;
}

export function ChatHeader({
  onlineCount,
  notifications,
  knockStatus,
  knockCooldown,
  onLogout,
  onAccept,
  onDecline,
  onDismiss,
}: ChatHeaderProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  const unreadCount = notifications.length;

  return (
    <div className="relative shrink-0">
      {/* ── Main header bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">Global Chat</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{onlineCount} online</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* ── Notification bell ──────────────────────────────────────── */}
          <button
            onClick={() => setPanelOpen(v => !v)}
            className={cn(
              "relative w-8 h-8 rounded-full flex items-center justify-center transition-all",
              panelOpen
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground hover:text-foreground",
              unreadCount > 0 && "text-primary"
            )}
            aria-label={`Notifications (${unreadCount})`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>

            {/* Count badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* ── Leave / Logout ─────────────────────────────────────────── */}
          <button
            onClick={onLogout}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
          >
            Leave
          </button>
        </div>
      </div>

      {/* ── Knock status bar (you sent a knock) ─────────────────────────── */}
      {knockStatus === "sent" && knockCooldown > 0 && (
        <div className="px-4 py-1.5 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
          <p className="text-[10px] text-primary">Knock sent — waiting for reply…</p>
          <span className="text-[10px] font-mono text-primary/70">{knockCooldown}s</span>
        </div>
      )}
      {knockStatus === "declined" && (
        <div
          onClick={onDismiss}
          className="px-4 py-1.5 bg-destructive/5 border-b border-destructive/10 flex items-center justify-between cursor-pointer"
        >
          <p className="text-[10px] text-destructive">Your knock was declined</p>
          <span className="text-[10px] text-destructive/60">tap to dismiss</span>
        </div>
      )}

      {/* ── Notification panel ───────────────────────────────────────────── */}
      {panelOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-20"
            onClick={() => setPanelOpen(false)}
          />

          {/* Panel */}
          <div className="absolute top-full right-3 mt-2 w-80 bg-background border border-border/60 rounded-2xl shadow-xl z-30 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Private room requests</p>
              {unreadCount > 0 && (
                <span className="text-[10px] text-muted-foreground">{unreadCount} pending</span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground/50">
                  No pending requests
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {notifications.map(notif => (
                    <NotificationRow
                      key={notif.id}
                      notif={notif}
                      onAccept={() => { onAccept(notif); setPanelOpen(false); }}
                      onDecline={() => onDecline(notif)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Single notification row ───────────────────────────────────────────────────

function NotificationRow({
  notif,
  onAccept,
  onDecline,
}: {
  notif:     KnockNotificationInterface;
  onAccept:  () => void;
  onDecline: () => void;
}) {
  const secondsLeft = Math.max(0, Math.ceil((notif.expiresAt - Date.now()) / 1000));

  return (
    <div className="px-4 py-3 flex items-center gap-3">
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
        style={{ backgroundColor: avatarHue(notif.fromUsername) }}
      >
        {notif.fromUsername.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{notif.fromUsername}</p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          wants to chat privately
          <span className="font-mono text-primary/60">· {secondsLeft}s</span>
        </p>
      </div>

      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={onDecline}
          className="w-7 h-7 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all"
          aria-label="Decline"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <button
          onClick={onAccept}
          className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 active:scale-95 transition-all"
          aria-label="Accept"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
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