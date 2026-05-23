"use client";

import { ChatWindow } from "@repo/ui";
import { ChatInput } from "@repo/ui";
import { ChatHeader } from "@repo/ui";
import { useChat } from "../hooks/use-chat";
import { PrivateRoomScreen } from "./PrivateRoom";
import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import { searchGifs } from "../api-calls/gifcalls";

interface ChatRoomProps {
  token: string;
  username: string;
}

export default function ChatRoom({ token, username }: ChatRoomProps) {
  const router = useRouter();
  const {
    messages,
    status,
    onlineCount,
    sendMessage,
    notifications,
    knockStatus,
    knockCooldown,
    sendKnock,
    acceptKnock,
    declineKnock,
    dismissKnock,
    privateRoom,
    privateMessages,
    sendPrivateMessage,
    sendPrivateMedia,
    leavePrivateRoom,
  } = useChat({ token, username });

  function handleLogout() {
    deleteCookie("chat_token");
    deleteCookie("chat_username");
    router.refresh();
  }

  function handleKnock(targetUserId?: number) {
    if (targetUserId) sendKnock(targetUserId);
  }

  const isConnected = status === "open";
  const isConnecting = status === "connecting";

  return (
    <>
      {/* Ambient background */}
      <div className="fixed inset-0 bg-background pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* Main layout */}
      <div className="relative flex flex-col h-dvh max-w-lg mx-auto w-full">

        {/* Subtle side borders */}
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent" />

        {/* Header */}
        <div className="shrink-0 bg-card/70 backdrop-blur-md border-b border-border/50">
          <ChatHeader
            onlineCount={onlineCount}
            notifications={notifications}
            knockStatus={knockStatus}
            knockCooldown={knockCooldown}
            onLogout={handleLogout}
            onAccept={acceptKnock}
            onDecline={declineKnock}
            onDismiss={dismissKnock}
          />
        </div>

        {/* Connection status banner */}
        {status !== "open" && (
          <div
            className={`
              shrink-0 flex items-center justify-center gap-2 py-2 px-4 text-[11px] font-mono tracking-wide
              ${isConnecting
                ? "bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                : "bg-destructive/10 border-b border-destructive/20 text-destructive"
              }
            `}
          >
            {isConnecting && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-yellow-500" />
              </span>
            )}
            {isConnecting && "Connecting to server…"}
            {status === "closed" && "● Disconnected — refresh to reconnect"}
            {status === "error" && "● Connection error — refresh to retry"}
          </div>
        )}

        {/* Chat window — fills remaining space */}
        <div className="flex-1 min-h-0 bg-background/40">
          <ChatWindow
            messages={messages}
            currentUsername={username}
            onKnock={handleKnock}
          />
        </div>

        {/* Input area */}
        <div className="shrink-0 bg-card/70 backdrop-blur-md border-t border-border/50 px-1 py-1">
          {/* Online indicator strip */}
          <div className="flex items-center gap-1.5 px-3 pb-1">
            <span className="relative flex h-1.5 w-1.5">
              {isConnected && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
              )}
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                  isConnected ? "bg-primary" : "bg-muted-foreground"
                }`}
              />
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {isConnected
                ? `${onlineCount} online · open.global.chat`
                : "offline"}
            </span>
          </div>

          <ChatInput
            onSend={sendMessage}
            disabled={!isConnected}
            searchGifs={searchGifs}
            placeholder={isConnected ? "Say something…" : "Connecting…"}
          />
        </div>
      </div>

      {/* Private room overlay */}
      {privateRoom && (
        <PrivateRoomScreen
          token={token}
          room={privateRoom}
          messages={privateMessages}
          currentUsername={username}
          onSendMessage={sendPrivateMessage}
          onSendMedia={sendPrivateMedia}
          onLeave={leavePrivateRoom}
        />
      )}
    </>
  );
}