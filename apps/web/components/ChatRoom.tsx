"use client";

import { ChatWindow } from "@repo/ui";
import { ChatInput } from "@repo/ui";
import { ChatHeader } from "@repo/ui";
import { useChat } from "../hooks/use-chat";
import { PrivateRoomScreen } from "./PrivateRoom";
import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import { searchGifs } from "../api-calls/gifcalls";
import { AnimatePresence } from "motion/react";

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

  return (
    <>
      <div className="flex flex-col h-dvh max-w-lg mx-auto w-full border-x border-border/30 shadow-2xl relative overflow-hidden bg-background box-border font-sans">
        {/* Dynamic Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none z-0"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Room Ambient Glows */}
        <div className="absolute top-1/4 -left-36 w-72 h-72 rounded-full bg-primary/12 dark:bg-primary/6 blur-[80px] pointer-events-none z-0 transition-colors duration-500" />
        <div className="absolute bottom-1/4 -right-36 w-72 h-72 rounded-full bg-accent/15 dark:bg-accent/8 blur-[80px] pointer-events-none z-0 transition-colors duration-500" />

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col h-full w-full overflow-hidden">
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
          {status !== "open" && (
            <div className="text-[10px] text-center font-bold py-1.5 bg-primary/10 text-primary border-b border-primary/20 tracking-wider uppercase shrink-0 font-mono">
              {status === "connecting" && "Connecting…"}
              {status === "closed" && "Disconnected — refresh to reconnect"}
              {status === "error" && "Connection error"}
            </div>
          )}
          <ChatWindow
            messages={messages}
            currentUsername={username}
            onKnock={handleKnock}
          />
          <ChatInput
            onSend={sendMessage}
            disabled={status !== "open"}
            searchGifs={searchGifs}
            placeholder={status === "open" ? "Message…" : "Connecting…"}
          />
        </div>
      </div>
      <AnimatePresence>
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
      </AnimatePresence>
    </>
  );
}