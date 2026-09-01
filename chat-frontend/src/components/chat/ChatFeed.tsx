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
  onUpvoteAction: (chatId: string) => void;
  onDismissAction?: (chatId: string) => void;
  hasMoreHistory?: boolean;
  loadingHistory?: boolean;
  onLoadMore?: () => void;
}

export default function ChatFeed({
  chats,
  currentUserName,
  hotThreshold,
  upvoteCooldowns,
  onUpvoteAction,
  onDismissAction,
  hasMoreHistory,
  loadingHistory,
  onLoadMore,
}: ChatFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(chats.length);
  const prevFirstIdRef = useRef(chats[0]?.chatId);

  useEffect(() => {
    const grewAtBottom =
      chats.length > prevLengthRef.current &&
      (prevFirstIdRef.current === chats[0]?.chatId || prevLengthRef.current === 0);

    if (grewAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevLengthRef.current = chats.length;
    prevFirstIdRef.current = chats[0]?.chatId;
  }, [chats]);

  if (chats.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin p-4 flex-1">
      {hasMoreHistory && onLoadMore && (
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingHistory}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
          >
            {loadingHistory ? "Loading…" : "Load older messages"}
          </button>
        </div>
      )}
      {chats.map((chat) => (
        <ChatMessageRow
          key={chat.chatId}
          chat={chat}
          variant="feed"
          currentUserName={currentUserName}
          hotThreshold={hotThreshold}
          upvoteCooldowns={upvoteCooldowns}
          onUpvoteAction={onUpvoteAction}
          onDismissAction={onDismissAction}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
