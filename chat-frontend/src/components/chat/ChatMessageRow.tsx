"use client";

import { IconClose } from "@/lib/icons";
import { cn } from "@/lib/utils";
import ChatMessage from "./ChatMessage";
import UpvoteButton from "./UpvoteButton";
import type { Chat } from "@/types/chat";

export type ChatMessageRowVariant = "feed" | "trending" | "hot";

interface ChatMessageRowProps {
  chat: Chat;
  variant: ChatMessageRowVariant;
  currentUserName?: string;
  upvoteCooldowns?: Record<string, number>;
  hotThreshold?: number;
  onUpvote: (chatId: string) => void;
  onDismiss?: (chatId: string) => void;
}

export default function ChatMessageRow({
  chat,
  variant,
  currentUserName,
  upvoteCooldowns = {},
  hotThreshold,
  onUpvote,
  onDismiss,
}: ChatMessageRowProps) {
  const messageCooldown = upvoteCooldowns[chat.chatId];
  const upvoteDisabled = chat.upvotedByMe || !!messageCooldown;
  const showDismissInFeed =
    variant === "feed" &&
    onDismiss &&
    hotThreshold !== undefined &&
    chat.votes >= hotThreshold;

  if (variant === "feed") {
    return (
      <ChatMessage
        name={chat.name}
        message={chat.message}
        votes={chat.votes}
        isOwn={chat.name === currentUserName}
      >
        <div className="flex items-center gap-2">
          {showDismissInFeed && (
            <button
              onClick={() => onDismiss(chat.chatId)}
              className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs text-hot hover:bg-hot/20 transition-colors"
            >
              <IconClose className="h-3 w-3" />
              Dismiss
            </button>
          )}
          <UpvoteButton
            votes={chat.votes}
            onUpvote={() => onUpvote(chat.chatId)}
            disabled={upvoteDisabled}
            alreadyUpvoted={chat.upvotedByMe}
            cooldown={messageCooldown}
          />
        </div>
      </ChatMessage>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-3 animate-slide-up",
        variant === "trending"
          ? "border-amber-vote/30 bg-amber-vote/5"
          : "border-hot/40 bg-hot/10 animate-pulse-glow"
      )}
    >
      <p className="mb-2 text-sm text-foreground line-clamp-3">{chat.message}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{chat.name}</span>
        <div className="flex items-center gap-2">
          {variant === "hot" && onDismiss && (
            <button
              onClick={() => onDismiss(chat.chatId)}
              className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs text-hot hover:bg-hot/20 transition-colors"
            >
              <IconClose className="h-3 w-3" />
              Dismiss
            </button>
          )}
          <UpvoteButton
            votes={chat.votes}
            onUpvote={() => onUpvote(chat.chatId)}
            disabled={upvoteDisabled}
            alreadyUpvoted={chat.upvotedByMe}
            cooldown={messageCooldown}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
