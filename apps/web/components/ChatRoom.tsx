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

  return (
    <>
      <div className="flex flex-col h-dvh max-w-lg mx-auto w-full border-x border-border/30">
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
          <div className="text-[10px] text-center py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 shrink-0">
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