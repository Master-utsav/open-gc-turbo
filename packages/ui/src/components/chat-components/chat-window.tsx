"use client";

import { useEffect, useRef } from "react";
import { ChatBubble, ChatMessage } from "./chat-bubble";

interface ChatWindowProps {
  messages: ChatMessage[];
  currentUsername: string;
   onKnock: (targetUserId: number) => void;
}

const ChatWindow = ({ messages, currentUsername, onKnock }: ChatWindowProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground/50 select-none">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="text-xs">No messages yet. Say hi!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1.5 scroll-smooth">
      {messages.map((msg:ChatMessage, i) => {
        const prevMsg = messages[i - 1];
        // Collapse avatar/name for consecutive messages from same user
        const isSameAsPrev =
          prevMsg?.username === msg.username &&
          new Date(msg.createdAt).getTime() -
            new Date(prevMsg.createdAt).getTime() <
            60_000;

        return (
          <ChatBubble
            onKnock={onKnock}
            key={msg.id}
            message={msg}
            userId={msg.userId}
            isMine={msg.username === currentUsername}
            compact={isSameAsPrev}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export { ChatWindow };