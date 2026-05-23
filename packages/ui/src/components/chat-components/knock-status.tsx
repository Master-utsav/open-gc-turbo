"use client";

import { useEffect } from "react";
import { cn } from "../../lib/utils";

interface KnockStatusProps {
  status:    "sent" | "declined";
  username?: string; // who declined
  onDismiss: () => void;
}

function KnockStatus({ status, username, onDismiss }: KnockStatusProps) {
    // Auto-dismiss after 4s
    console.log("status" , status)
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [status, onDismiss]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm font-medium text-center shadow-lg border",
          status === "sent"
            ? "bg-primary/10 border-primary/20 text-primary"
            : "bg-destructive/10 border-destructive/20 text-destructive"
        )}
      >
        {status === "sent"
          ? "Knock sent — waiting for them to accept…"
          : `${username ?? "They"} declined your knock`
        }
      </div>
    </div>
  );
}

export {KnockStatus}