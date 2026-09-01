"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { API_URL } from "@/lib/config";
import {
  clearSessionFresh,
  getSessionRoomId,
  getSessionToken,
  getSessionUserId,
  getSessionUserName,
  hasValidSession,
  isSessionAdmin,
  logoutSession,
  refreshSession,
  setIsAdmin,
  shouldSkipSessionRefresh,
  subscribeSessionUpdates,
} from "@/lib/session";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useCooldown, useCooldownMap } from "@/hooks/useCooldown";
import { useToast } from "@/hooks/useToast";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatFeed from "@/components/chat/ChatFeed";
import ChatInput from "@/components/chat/ChatInput";
import PrioritySidebar from "@/components/chat/PrioritySidebar";
import RoomInfoModal from "@/components/chat/RoomInfoModal";
import ToastContainer from "@/components/Toast";
import { cn } from "@/lib/utils";
import type { WsErrorPayload } from "@/types/chat";

interface RoomData {
  chatCoolDown: number;
  upvoteCoolDown: number;
  roomName: string;
  mediumVoteThreshold: number;
  hotVoteThreshold: number;
  maxMessageLength: number;
}

type MobileTab = "chat" | "trending" | "hot";

export default function ChatRoom() {
  const router = useRouter();
  const { roomId } = useParams();
  const roomIdStr = Array.isArray(roomId) ? roomId[0] : (roomId as string);
  const [userId] = useState(() => getSessionUserId() ?? "");
  const [userName] = useState(() => getSessionUserName() ?? "");
  const [isAdmin, setAdminState] = useState(() => isSessionAdmin());
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [roomLoadFailed, setRoomLoadFailed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { toasts, show, dismiss } = useToast();
  const hasEverJoinedRef = useRef(false);

  const chatCooldown = useCooldown(roomData?.chatCoolDown ?? 0);
  const upvoteCooldowns = useCooldownMap();
  const lastUpvoteAttemptRef = useRef<string | null>(null);
  const invalidSessionHandledRef = useRef(false);
  const skipRefreshRef = useRef<boolean | null>(null);

  const handleWsError = useCallback(
    (error: WsErrorPayload) => {
      if (error.code === "CHAT_COOLDOWN") {
        chatCooldown.start(error.remainingSeconds ?? roomData?.chatCoolDown ?? 0);
      }
      if (error.code === "UPVOTE_COOLDOWN") {
        const duration = error.remainingSeconds ?? roomData?.upvoteCoolDown ?? 0;
        const chatId = error.chatId ?? lastUpvoteAttemptRef.current;
        if (chatId) {
          upvoteCooldowns.start(chatId, duration);
        }
      }
      if (
        error.code !== "UPVOTE_FAILED" &&
        error.code !== "ALREADY_UPVOTED" &&
        error.code !== "CHAT_NOT_FOUND"
      ) {
        show(error.message, "error");
      }
    },
    [chatCooldown, roomData, show, upvoteCooldowns]
  );

  const handleInvalidSession = useCallback(async () => {
    if (invalidSessionHandledRef.current) return;
    invalidSessionHandledRef.current = true;
    setSessionReady(false);
    show("Session expired. Please join again.", "error");
    await logoutSession();
    router.replace(`/user/join?roomId=${encodeURIComponent(roomIdStr)}`);
  }, [roomIdStr, router, show]);

  const handleFatalWsError = useCallback(
    async (error: WsErrorPayload) => {
      setSessionReady(false);
      hasEverJoinedRef.current = false;
      if (error.code === "FORBIDDEN") {
        show("Session does not match this room.", "error");
        await logoutSession();
        router.replace(`/user/join?roomId=${encodeURIComponent(roomIdStr)}`);
      } else if (error.code === "ROOM_NOT_FOUND") {
        show("This room no longer exists.", "error");
        await logoutSession();
        router.replace("/");
      }
    },
    [roomIdStr, router, show]
  );

  const handleHotMessage = useCallback(
    (message: string) => {
      show(
        `Hot message: "${message.slice(0, 60)}${message.length > 60 ? "..." : ""}"`,
        "hot"
      );
    },
    [show]
  );

  const handleMessageSent = useCallback(() => {
    chatCooldown.start();
  }, [chatCooldown]);

  const handleUpvoteSuccess = useCallback(
    (chatId: string) => {
      upvoteCooldowns.start(chatId, roomData?.upvoteCoolDown ?? 0);
    },
    [roomData?.upvoteCoolDown, upvoteCooldowns]
  );

  const mediumThreshold = roomData?.mediumVoteThreshold ?? 3;
  const hotThreshold = roomData?.hotVoteThreshold ?? 10;

  const {
    chats,
    connected,
    joined,
    hasMoreHistory,
    loadingHistory,
    sendMessage,
    sendUpvote,
    sendDismiss,
    loadMoreHistory,
    reconnect,
  } = useChatSocket({
    roomId: roomIdStr,
    userId,
    userName,
    isAdmin,
    hotThreshold,
    enabled: sessionReady,
    onHotMessage: handleHotMessage,
    onError: handleWsError,
    onInvalidSession: handleInvalidSession,
    onFatalError: handleFatalWsError,
    onMessageSent: handleMessageSent,
    onUpvoteSuccess: handleUpvoteSuccess,
  });

  useEffect(() => {
    if (joined) {
      hasEverJoinedRef.current = true;
    }
  }, [joined]);

  const connectionPhase =
    !sessionReady || !roomData
      ? "loading"
      : joined
        ? "live"
        : connected
          ? "connecting"
          : hasEverJoinedRef.current
            ? "reconnecting"
            : "connecting";

  useEffect(() => {
    if (!hasValidSession()) {
      router.replace(`/user/join?roomId=${encodeURIComponent(roomIdStr)}`);
    }
  }, [roomIdStr, router]);

  useEffect(() => {
    invalidSessionHandledRef.current = false;
    skipRefreshRef.current = shouldSkipSessionRefresh();
    setRoomLoadFailed(false);
    hasEverJoinedRef.current = false;
  }, [roomIdStr]);

  useEffect(() => {
    return subscribeSessionUpdates(() => {
      if (sessionReady) {
        reconnect();
      }
    });
  }, [sessionReady, reconnect]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!hasValidSession()) return;

      const sessionRoomId = getSessionRoomId();
      if (sessionRoomId && sessionRoomId !== roomIdStr) {
        show("Your session is for a different room.", "error");
        await logoutSession();
        router.replace(`/user/join?roomId=${encodeURIComponent(roomIdStr)}`);
        return;
      }

      if (!skipRefreshRef.current) {
        const refreshed = await refreshSession();
        if (cancelled) return;
        if (!refreshed) {
          handleInvalidSession();
          return;
        }

        const refreshedRoomId = getSessionRoomId();
        if (refreshedRoomId && refreshedRoomId !== roomIdStr) {
          show("Your session is for a different room.", "error");
          await logoutSession();
          router.replace(`/user/join?roomId=${encodeURIComponent(roomIdStr)}`);
          return;
        }
      }

      let roomLoaded = false;
      try {
        const token = getSessionToken();
        if (!token) {
          handleInvalidSession();
          return;
        }
        const res = await axios.post(`${API_URL}/api/room/details`, {
          sessionToken: token,
          roomId: roomIdStr,
        });
        if (cancelled) return;
        setRoomData(res.data as RoomData);
        roomLoaded = true;
      } catch {
        if (!cancelled) {
          setRoomLoadFailed(true);
          show("Failed to load room details", "error");
        }
      }

      if (isSessionAdmin()) {
        try {
          const adminRes = await axios.get(`${API_URL}/api/admin`, {
            params: { roomId: roomIdStr },
          });
          if (cancelled) return;
          const admin = adminRes.data as { adminId: string };
          const stillAdmin = admin.adminId === getSessionUserId();
          setAdminState(stillAdmin);
          setIsAdmin(stillAdmin);
          if (!stillAdmin) {
            show("Admin access revoked for this room.", "error");
          }
        } catch {
          if (!cancelled) {
            setAdminState(false);
            setIsAdmin(false);
          }
        }
      }

      if (!cancelled && roomLoaded) {
        clearSessionFresh();
        setSessionReady(true);
      }
    };

    if (roomIdStr) {
      setSessionReady(false);
      init();
    }

    return () => {
      cancelled = true;
    };
  }, [roomIdStr, show, handleInvalidSession, router]);

  const handleSend = (message: string) => {
    const sent = sendMessage(message);
    if (!sent) {
      show("Not connected. Message not sent.", "error");
    }
    return sent;
  };

  const handleUpvote = (chatId: string) => {
    lastUpvoteAttemptRef.current = chatId;
    const sent = sendUpvote(chatId);
    if (!sent) {
      show("Not connected. Upvote not sent.", "error");
    }
  };

  const handleDismiss = (chatId: string) => {
    if (!isAdmin) return;
    const sent = sendDismiss(chatId);
    if (!sent) {
      show("Not connected. Could not dismiss.", "error");
    }
  };

  const handleLeaveRoom = async () => {
    setSessionReady(false);
    hasEverJoinedRef.current = false;
    await logoutSession();
    router.push("/");
  };

  const handleLoadMore = () => {
    const loaded = loadMoreHistory();
    if (!loaded) {
      show("Could not load older messages.", "error");
    }
  };

  const trending = chats
    .filter((c) => c.votes >= mediumThreshold && c.votes < hotThreshold)
    .sort((a, b) => b.votes - a.votes);
  const hot = chats
    .filter((c) => c.votes >= hotThreshold)
    .sort((a, b) => b.votes - a.votes);

  const tabs: { id: MobileTab; label: string; count?: number }[] = [
    { id: "chat", label: "Chat" },
    { id: "trending", label: "Trending", count: trending.length },
    { id: "hot", label: "Hot", count: hot.length },
  ];

  if (!hasValidSession()) {
    return null;
  }

  if (roomLoadFailed) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-4">
        <p className="text-muted">Could not load this room.</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-xl border border-border px-4 py-2 text-sm text-foreground hover:bg-surface"
        >
          Go home
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <ChatHeader
        roomName={roomData?.roomName}
        connectionPhase={connectionPhase}
        onInfoClick={() => setModalOpen(true)}
      />

      {!isDesktop && (
        <div className="flex border-b border-border bg-surface/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium transition-colors",
                mobileTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.count ? (
                <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 text-xs text-primary">
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {(isDesktop || mobileTab === "chat") && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {sessionReady && connected && !joined && (
              <div className="border-b border-border bg-surface/40 px-4 py-1.5 text-center text-xs text-muted">
                Syncing messages…
              </div>
            )}
            <ChatFeed
              chats={chats}
              currentUserName={userName}
              hotThreshold={hotThreshold}
              upvoteCooldowns={upvoteCooldowns.cooldowns}
              onUpvoteAction={handleUpvote}
              onDismissAction={isAdmin ? handleDismiss : undefined}
              hasMoreHistory={hasMoreHistory}
              loadingHistory={loadingHistory}
              onLoadMore={handleLoadMore}
            />
            <ChatInput
              onSend={handleSend}
              disabled={!sessionReady || !joined || chatCooldown.active}
              cooldown={chatCooldown.remaining}
              maxLength={roomData?.maxMessageLength}
            />
          </div>
        )}

        {isDesktop ? (
          <PrioritySidebar
            trending={trending}
            hot={hot}
            mediumThreshold={mediumThreshold}
            hotThreshold={hotThreshold}
            upvoteCooldowns={upvoteCooldowns.cooldowns}
            onUpvoteAction={handleUpvote}
            onDismissAction={isAdmin ? handleDismiss : undefined}
          />
        ) : mobileTab !== "chat" ? (
          <div className="flex-1 overflow-y-auto p-4">
            <PrioritySidebar
              trending={mobileTab === "trending" ? trending : []}
              hot={mobileTab === "hot" ? hot : []}
              mediumThreshold={mediumThreshold}
              hotThreshold={hotThreshold}
              upvoteCooldowns={upvoteCooldowns.cooldowns}
              onUpvoteAction={handleUpvote}
              onDismissAction={isAdmin ? handleDismiss : undefined}
              singleSection={mobileTab}
            />
          </div>
        ) : null}
      </div>

      <RoomInfoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        roomName={roomData?.roomName}
        roomId={roomIdStr}
        chatCoolDown={roomData?.chatCoolDown}
        upvoteCoolDown={roomData?.upvoteCoolDown}
        mediumThreshold={mediumThreshold}
        hotThreshold={hotThreshold}
        onLeaveRoom={handleLeaveRoom}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
