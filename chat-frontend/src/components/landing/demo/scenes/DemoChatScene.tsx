"use client";

import { IconArrowLeft, IconInfo, IconSend } from "@/lib/icons";
import Button from "@/components/Button";
import ChatFeed from "@/components/chat/ChatFeed";
import PrioritySidebar from "@/components/chat/PrioritySidebar";
import ConnectionStatus from "@/components/chat/ConnectionStatus";
import { cn } from "@/lib/utils";
import { DemoHighlightRing } from "../DemoCursor";
import {
  DEMO_HERO_MESSAGE,
  DEMO_ROOM,
  DEMO_USER_NAME,
  type DemoSceneState,
} from "../demoData";

interface DemoChatSceneProps {
  state: DemoSceneState;
}

export default function DemoChatScene({ state }: DemoChatSceneProps) {
  const { mediumThreshold, hotThreshold } = DEMO_ROOM;
  const isLaptop = state.device === "laptop";
  const showChatPanel = isLaptop || state.mobileTab === "chat";
  const showSidebarPanel =
    isLaptop ||
    state.mobileTab === "trending" ||
    state.mobileTab === "hot";

  const trending = state.chats
    .filter((c) => c.votes >= mediumThreshold && c.votes < hotThreshold)
    .sort((a, b) => b.votes - a.votes);
  const hot = state.chats
    .filter((c) => c.votes >= hotThreshold)
    .sort((a, b) => b.votes - a.votes);

  const tabs: { id: DemoSceneState["mobileTab"]; label: string; count?: number }[] = [
    { id: "chat", label: "Chat" },
    { id: "trending", label: "Trending", count: trending.length },
    { id: "hot", label: "Hot", count: hot.length },
  ];

  const noop = () => {};

  return (
    <div className="relative flex h-full flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg p-1 text-muted pointer-events-none"
            aria-hidden
          >
            <IconArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <h1 className="text-xs font-semibold text-foreground leading-tight">
              {DEMO_ROOM.roomName}
            </h1>
            <ConnectionStatus phase="live" />
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-[10px] text-muted pointer-events-none"
          aria-hidden
        >
          <IconInfo className="h-3 w-3" />
          <span className="hidden sm:inline">Room Info</span>
        </button>
      </header>

      {!isLaptop && (
        <div className="flex border-b border-border bg-surface/50">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "flex-1 py-2 text-center text-[10px] font-medium transition-colors pointer-events-none",
                state.mobileTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted"
              )}
            >
              {tab.label}
              {tab.count ? (
                <span className="ml-1 rounded-full bg-primary/20 px-1 text-[9px] text-primary">
                  {tab.count}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {showChatPanel && (
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <ChatFeed
              chats={state.chats}
              currentUserName={DEMO_USER_NAME}
              hotThreshold={hotThreshold}
              upvoteCooldowns={state.upvoteCooldowns}
              onUpvote={noop}
            />
            <div className="border-t border-border bg-surface/50 p-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <DemoHighlightRing active={state.highlight === "chat-input"} />
                  <div
                    className={cn(
                      "rounded-lg border border-border bg-background px-3 py-2 text-[11px] text-foreground",
                      !state.typedText && "text-muted"
                    )}
                  >
                    {state.typedText || "Type a message..."}
                  </div>
                </div>
                <div className="relative shrink-0">
                  <DemoHighlightRing active={state.cursorTarget === "send-btn"} />
                  <Button size="sm" className="pointer-events-none min-w-[36px]">
                    {state.chatCooldown ? `${state.chatCooldown}s` : <IconSend className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSidebarPanel && isLaptop && (
          <div
            className={cn(
              "relative shrink-0 w-36 border-l border-border overflow-hidden",
              state.highlight === "sidebar-trending" && "ring-2 ring-inset ring-amber-vote/50",
              state.highlight === "sidebar-hot" && "ring-2 ring-inset ring-hot/50"
            )}
          >
            <DemoHighlightRing
              active={state.highlight === "sidebar-trending" || state.highlight === "sidebar-hot"}
            />
            <PrioritySidebar
              trending={trending}
              hot={hot}
              mediumThreshold={mediumThreshold}
              hotThreshold={hotThreshold}
              upvoteCooldowns={state.upvoteCooldowns}
              onUpvote={noop}
            />
          </div>
        )}

        {showSidebarPanel && !isLaptop && state.mobileTab !== "chat" && (
          <div className="flex-1 overflow-y-auto p-2">
            <PrioritySidebar
              trending={state.mobileTab === "trending" ? trending : []}
              hot={state.mobileTab === "hot" ? hot : []}
              mediumThreshold={mediumThreshold}
              hotThreshold={hotThreshold}
              upvoteCooldowns={state.upvoteCooldowns}
              onUpvote={noop}
              singleSection={state.mobileTab}
            />
          </div>
        )}
      </div>

      {state.highlight === "upvote" && (
        <div
          className="pointer-events-none absolute inset-0 z-40"
          aria-hidden
        >
          <div
            className="absolute top-[45%] right-[12%] h-8 w-8 rounded-full ring-2 ring-primary animate-demo-highlight"
          />
        </div>
      )}

      {state.showHotToast && (
        <div
          className="absolute bottom-14 right-2 z-50 max-w-[200px] rounded-lg border border-hot/50 bg-hot/15 px-3 py-2 text-[10px] text-foreground shadow-lg animate-slide-up animate-pulse-glow"
        >
          Hot message: &quot;{DEMO_HERO_MESSAGE.slice(0, 40)}
          {DEMO_HERO_MESSAGE.length > 40 ? "..." : ""}&quot;
        </div>
      )}

    </div>
  );
}
