"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { PrivateMessage } from "../hooks/use-chat";
import { ExpiredBadge, MediaDisplay } from "@repo/ui";

const MEDIA_URL = process.env.NEXT_PUBLIC_HTTP_URL || "http://localhost:3001/api/v1";

const DISPLAY_SECONDS = 20;

interface EphemeralMediaProps {
  message:         PrivateMessage;
  currentUsername: string; // so sender shows local preview, not fetching from Redis
  token : string
}

// ── Countdown timer ───────────────────────────────────────────────────────────
function useCountdown(initialSeconds: number, active: boolean) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (!active) return;

    setSeconds(initialSeconds);

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, initialSeconds]);

  return seconds;
}

// ── Sender view — uses local objectURL passed via message ─────────────────────
// The sender already has the file locally (they picked it from disk).
// We pass it as `localSrc` on the PrivateMessage so they never need to fetch.

function SenderMedia({ message }: { message: PrivateMessage }) {

  const timerStarted = useRef(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (timerStarted.current) return;
    timerStarted.current = true;
    setActive(true);
  }, []);

  const seconds = useCountdown(DISPLAY_SECONDS, active);

   return message.localSrc && <MediaDisplay src={message.localSrc} kind={message.mediaKind} seconds={seconds} display_sec={DISPLAY_SECONDS} /> ;
}

// ── Receiver view — fetches from Redis media endpoint ────────────────────────
function ReceiverMedia({
  message,
  token,
}: {
  message: PrivateMessage;
  token: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [active, setActive] = useState(false);

  const objectUrlRef = useRef<string | null>(null);

  const seconds = useCountdown(DISPLAY_SECONDS, active);

  // ───────────────────────────────────────────────────────────
  // Expire after countdown
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!active || seconds > 0) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setSrc(null);
    setExpired(true);
    setActive(false);
  }, [seconds, active]);

  // ───────────────────────────────────────────────────────────
  // Fetch media
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!message.mediaId || !message.roomId) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `${MEDIA_URL}/media/${message.roomId}/${message.mediaId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (cancelled) return;
      
        console.log("response:", res);

        if (!res.ok) {
          setExpired(true);
          return;
        }

        const blob = await res.blob();
        console.log(blob)
        if (cancelled) return;

        const url = URL.createObjectURL(blob);

        objectUrlRef.current = url;

        setSrc(url);

        // START TIMER ONLY AFTER MEDIA READY
        setActive(true);

      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setExpired(true);
        }
      }
    }

    load();

    return () => {
      cancelled = true;

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [message.mediaId, message.roomId, token]);

  // ───────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────
  if(expired) return <ExpiredBadge kind={message.mediaKind} />
  else if (!src) {
    return (
      <div className="px-3 py-2 bg-muted rounded-2xl text-xs text-muted-foreground animate-pulse">
        Loading {message.mediaKind ?? "media"}...
      </div>
    );
  }
  else {
    return (
      <MediaDisplay
        src={src}
        kind={message.mediaKind}
        seconds={seconds}
        display_sec={DISPLAY_SECONDS}
      />
    );
  }
}
// ── Main export ───────────────────────────────────────────────────────────────

export function EphemeralMedia({ message, currentUsername, token }: EphemeralMediaProps) {
  const isMine = message.fromUsername === currentUsername;

  // Sender: use local preview src (never hits Redis)
  // Receiver: fetch from media server
  return isMine
    ? <SenderMedia  message={message} />
    : <ReceiverMedia message={message} token={token} />;
}