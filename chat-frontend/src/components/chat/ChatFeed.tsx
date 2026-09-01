"use client";

import { useEffect, useRef } from "react";
import ChatMessageRow from "./ChatMessageRow";
import EmptyState from "./EmptyState";
import type { Chat } from "@/types/chat";

interface ChatFeedProps {
  chats: Chat[];
  currentUserName: string;
  hotThreshold: number;
  upvoteCooldowns?: Record<string, number>;
  onUpvote: (chatId: string) => void;
  onDismiss?: (chatId: string) => void;
}

export default function ChatFeed({
  chats,
  currentUserName,
  hotThreshold,
  upvoteCooldowns,
  onUpvote,
  onDismiss,
}: ChatFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats.length]);

  if (chats.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin p-4 flex-1">
      {chats.map((chat) => (
        <ChatMessageRow
          key={chat.chatId}
          chat={chat}
          variant="feed"
          currentUserName={currentUserName}
          hotThreshold={hotThreshold}
          upvoteCooldowns={upvoteCooldowns}
          onUpvote={onUpvote}
          onDismiss={onDismiss}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
