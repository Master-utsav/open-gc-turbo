/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChatMessage } from "@repo/ui";

const WS_URL    = process.env.NEXT_PUBLIC_WS_URL    ?? "ws://localhost:8080";
const MEDIA_URL = process.env.NEXT_PUBLIC_HTTP_URL ?? "http://localhost:8080/api/v1";
const KNOCK_EXPIRE_MS = 10_000;

type ConnectionStatus = "connecting" | "open" | "closed" | "error";

export interface PrivateMessage {
  type?:        string;
  fromUserId:   number;
  fromUsername: string;
  content:      string;
  msgType:      "TEXT" | "GIF";
  mediaId?:     string;
  roomId?:      string;
  mimeType?:    string;
  mediaKind?:   "picture" | "video";
  expiresIn?:   number;
  localSrc?:    string;
  createdAt:    string;
}

export interface KnockNotification {
  id:           string;
  fromUserId:   number;
  fromUsername: string;
  roomId:       string;
  expiresAt:    number;
}

export interface PrivateRoom {
  roomId:       string;
  participants: { userId: number; username: string }[];
}

interface UseChatOptions { token: string; username: string; }

interface UseChatReturn {
  messages:    ChatMessage[];
  status:      ConnectionStatus;
  onlineCount: number;
  sendMessage: (content: string, msgType?: "TEXT" | "GIF") => void;
  notifications:  KnockNotification[];
  knockStatus:    "idle" | "sent" | "declined";
  knockCooldown:  number;
  sendKnock:      (targetUserId: number) => void;
  acceptKnock:    (notif: KnockNotification) => void;
  declineKnock:   (notif: KnockNotification) => void;
  dismissKnock:   () => void;
  privateRoom:         PrivateRoom | null;
  privateMessages:     PrivateMessage[];
  sendPrivateMessage:  (content: string, msgType?: "TEXT" | "GIF") => void;
  sendPrivateMedia:    (file: File, mediaKind: "picture" | "video") => Promise<void>;
  leavePrivateRoom:    () => void;
}

function randomId() { return Math.random().toString(36).slice(2); }

export function useChat({ token, username }: UseChatOptions): UseChatReturn {
  const [messages, setMessages]               = useState<ChatMessage[]>([]);
  const [status, setStatus]                   = useState<ConnectionStatus>("connecting");
  const [onlineCount, setOnlineCount]         = useState(1);
  const [notifications, setNotifications]     = useState<KnockNotification[]>([]);
  const [knockStatus, setKnockStatus]         = useState<"idle" | "sent" | "declined">("idle");
  const [knockCooldown, setKnockCooldown]     = useState(0);
  const [privateRoom, setPrivateRoom]         = useState<PrivateRoom | null>(null);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);

  const wsRef          = useRef<WebSocket | null>(null);
  const privateRoomRef = useRef<PrivateRoom | null>(null);
  const cooldownTimer  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { privateRoomRef.current = privateRoom; }, [privateRoom]);

  const wsSend = useCallback((payload: unknown) => {
    const s = wsRef.current;
    if (s?.readyState === WebSocket.OPEN) s.send(JSON.stringify(payload));
  }, []);

  const resetPrivateState = useCallback(() => {
    setPrivateRoom(null);
    setPrivateMessages([]);
    privateRoomRef.current = null;
  }, []);

  function startCooldown(ms: number) {
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    let remaining = Math.ceil(ms / 1000);
    setKnockCooldown(remaining);
    cooldownTimer.current = setInterval(() => {
      remaining -= 1;
      setKnockCooldown(remaining);
      if (remaining <= 0) {
        clearInterval(cooldownTimer.current!);
        cooldownTimer.current = null;
        setKnockStatus("idle");
        setKnockCooldown(0);
      }
    }, 1000);
  }

  const sendMessage = useCallback((content: string, msgType: "TEXT" | "GIF" = "TEXT") => {
    if (content.startsWith("https://") && content.endsWith(".gif")) msgType = "GIF";
    wsSend({ type: "global:message", content, msgType });
  }, [wsSend]);

  const sendKnock = useCallback((targetUserId: number) => {
    if (knockStatus !== "idle" || knockCooldown > 0) return;
    wsSend({ type: "private:knock", targetUserId });
    setKnockStatus("sent");
  }, [knockStatus, knockCooldown, wsSend]);

  const acceptKnock = useCallback((notif: KnockNotification) => {
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    wsSend({ type: "private:accept", fromUserId: notif.fromUserId, roomId: notif.roomId });
  }, [wsSend]);

  const declineKnock = useCallback((notif: KnockNotification) => {
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    wsSend({ type: "private:decline", fromUserId: notif.fromUserId });
  }, [wsSend]);

  const dismissKnock = useCallback(() => {
    if (knockStatus === "declined") setKnockStatus("idle");
  }, [knockStatus]);

  const sendPrivateMessage = useCallback((content: string, msgType: "TEXT" | "GIF" = "TEXT") => {
    const room = privateRoomRef.current;
    if (!room) return;
    if (content.startsWith("https://") && content.endsWith(".gif")) msgType = "GIF";
    wsSend({ type: "private:message", roomId: room.roomId, content, msgType });
  }, [wsSend]);

  const sendPrivateMedia = useCallback(async (file: File, mediaKind: "picture" | "video") => {
    const room = privateRoomRef.current;
    if (!room) return;

    // Show sender preview immediately (blob URL, never hits Redis)
    const localSrc = URL.createObjectURL(file);
    setPrivateMessages(prev => [...prev, {
      type: "private:media", fromUserId: 0, fromUsername: username,
      content: "", msgType: "TEXT", mediaKind, mimeType: file.type,
      localSrc, createdAt: new Date().toISOString(),
    }]);

    // Upload binary via HTTP — avoids giant base64 WS frames
    const form = new FormData();
    form.append("file",      file);
    form.append("roomId",    room.roomId);
    form.append("mediaKind", mediaKind);

    try {
      const res = await fetch(`${MEDIA_URL}/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      console.log(res)
      if (!res.ok) { console.error("[media]", await res.text()); return; }
      const { mediaId, mimeType } = await res.json();
      // Notify room via WS (just the mediaId — no bytes in WS)
      wsSend({ type: "private:media_ready", roomId: room.roomId, mediaId, mimeType, mediaKind });
    } catch (err) {
      console.error("[media upload]", err);
    }
  }, [username, token, wsSend]);

  const leavePrivateRoom = useCallback(() => {
    const room = privateRoomRef.current;
    if (!room) return;
    wsSend({ type: "private:leave", roomId: room.roomId });
    resetPrivateState();
  }, [wsSend, resetPrivateState]);

  useEffect(() => {
    const socket = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
    wsRef.current = socket;

    socket.onopen  = () => setStatus("open");
    socket.onerror = () => setStatus("error");
    socket.onclose = () => { setStatus("closed"); resetPrivateState(); };

    socket.onmessage = (event) => {
      let parsed: Record<string, unknown>;
      try { parsed = JSON.parse(event.data); } catch { return; }

      switch (parsed.type) {
        case "global:history":
          setMessages(parsed.messages as ChatMessage[]);
          break;
        case "global:message": {
          const msg = parsed as unknown as ChatMessage;
          setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
          break;
        }
        case "global:user_joined": setOnlineCount(parsed.onlineCount as number); break;
        case "global:user_left":   setOnlineCount(parsed.onlineCount as number); break;

        case "private:incoming_knock": {
          const notif: KnockNotification = {
            id:           randomId(),
            fromUserId:   parsed.fromUserId   as number,
            fromUsername: parsed.fromUsername as string,
            roomId:       parsed.roomId       as string,
            expiresAt:    (parsed.expiresAt   as number) ?? Date.now() + KNOCK_EXPIRE_MS,
          };
          setNotifications(prev => {
            // One knock per sender at a time — replace if re-knocked
            const deduped = prev.filter(n => n.fromUserId !== notif.fromUserId);
            return [...deduped, notif];
          });
          // Auto-remove after 10s
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notif.id));
          }, KNOCK_EXPIRE_MS);
          break;
        }

        case "private:knock_sent":
          setKnockStatus("sent");
          startCooldown((parsed.cooldownMs as number) ?? KNOCK_EXPIRE_MS);
          break;

        case "private:knock_failed":
          if (parsed.cooldown) {
            // Rate limited — show remaining wait time
            startCooldown((parsed.cooldown as number) * 1000);
            setKnockStatus("sent");
          } else {
            setKnockStatus("idle");
          }
          break;

        case "private:knock_declined":
          setKnockStatus("declined");
          setTimeout(() => setKnockStatus("idle"), 4000);
          break;

        case "private:room_ready":
          setPrivateRoom({
            roomId:       parsed.roomId       as string,
            participants: parsed.participants as PrivateRoom["participants"],
          });
          setPrivateMessages([]);
          setKnockStatus("idle");
          setKnockCooldown(0);
          setNotifications([]);
          if (cooldownTimer.current) { clearInterval(cooldownTimer.current); cooldownTimer.current = null; }
          break;

        case "private:message":
        case "private:media":
          setPrivateMessages(prev => [...prev, parsed as unknown as PrivateMessage]);
          break;

        case "private:room_closed":
          resetPrivateState();
          break;
      }
    };

    return () => {
      const room = privateRoomRef.current;
      if (room && socket.readyState === WebSocket.OPEN)
        socket.send(JSON.stringify({ type: "private:leave", roomId: room.roomId }));
      socket.close();
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, [token, resetPrivateState]);

  return {
    messages, status, onlineCount, sendMessage,
    notifications, knockStatus, knockCooldown,
    sendKnock, acceptKnock, declineKnock, dismissKnock,
    privateRoom, privateMessages, sendPrivateMessage, sendPrivateMedia, leavePrivateRoom,
  };
}