"use client";

import { cn } from "@/lib/utils";
import { IconFire, IconTrendingUp } from "@/lib/icons";
import ChatMessageRow from "./ChatMessageRow";
import type { Chat } from "@/types/chat";

interface PrioritySidebarProps {
  trending: Chat[];
  hot: Chat[];
  mediumThreshold: number;
  hotThreshold: number;
  upvoteCooldowns?: Record<string, number>;
  onUpvoteAction: (chatId: string) => void;
  onDismissAction?: (chatId: string) => void;
  singleSection?: "trending" | "hot";
}

export default function PrioritySidebar({
  trending,
  hot,
  mediumThreshold,
  hotThreshold,
  upvoteCooldowns,
  onUpvoteAction,
  onDismissAction,
  singleSection,
}: PrioritySidebarProps) {
  const showTrending = !singleSection || singleSection === "trending";
  const showHot = !singleSection || singleSection === "hot";

  return (
    <aside
      className={cn(
        "flex flex-col bg-surface/30 w-full lg:w-80 shrink-0",
        !singleSection && "border-l border-border"
      )}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
        {showTrending && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <IconTrendingUp className="h-4 w-4 text-amber-vote" />
              <h2 className="text-sm font-semibold text-foreground">Trending</h2>
              <span className="rounded-full bg-amber-vote/20 px-2 py-0.5 text-xs text-amber-vote">
                {mediumThreshold}+ votes
              </span>
            </div>
            {trending.length === 0 ? (
              <p className="text-xs text-muted">No trending messages yet</p>
            ) : (
              <div className="space-y-2">
                {trending.map((chat) => (
                  <ChatMessageRow
                    key={chat.chatId}
                    chat={chat}
                    variant="trending"
                    upvoteCooldowns={upvoteCooldowns}
                    onUpvoteAction={onUpvoteAction}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {showHot && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <IconFire className="h-4 w-4 text-hot" />
              <h2 className="text-sm font-semibold text-foreground">Hot</h2>
              <span className="rounded-full bg-hot/20 px-2 py-0.5 text-xs text-hot">
                {hotThreshold}+ votes
              </span>
            </div>
            {hot.length === 0 ? (
              <p className="text-xs text-muted">No hot messages yet</p>
            ) : (
              <div className="space-y-2">
                {hot.map((chat) => (
                  <ChatMessageRow
                    key={chat.chatId}
                    chat={chat}
                    variant="hot"
                    upvoteCooldowns={upvoteCooldowns}
                    onUpvoteAction={onUpvoteAction}
                    onDismissAction={onDismissAction}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </aside>
  );
}
