"use client";

import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface IncomingKnock {
  fromUserId:   number;
  fromUsername: string;
  roomId:       string;
}


interface KnockNotificationProps {
  knock:     IncomingKnock;
  onAccept:  () => void;
  onDecline: () => void;
}

function KnockNotification({ knock, onAccept, onDecline }: KnockNotificationProps) {
  const [visible, setVisible] = useState(false);
    console.log("knock : " ,knock);
  // Slide in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
      return () => {
          clearTimeout(t);
      }
  }, []);

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm",
        "transition-all duration-300 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
      )}
    >
      <div className="bg-background border border-border/60 rounded-2xl shadow-xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {/* Pulsing avatar */}
          <span className="relative flex h-9 w-9 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-30" />
            <span className="relative inline-flex rounded-full h-9 w-9 bg-primary/10 border border-primary/30 items-center justify-center text-sm font-bold text-primary">
              {knock.fromUsername.charAt(0).toUpperCase()}
            </span>
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {knock.fromUsername}
            </p>
            <p className="text-xs text-muted-foreground">
              wants to chat privately
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onDecline}
            className="flex-1 h-8 rounded-xl border border-border/60 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 h-8 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 active:scale-95 transition-all"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export {KnockNotification}