"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WS_URL } from "@/lib/config";
import { getSessionToken } from "@/lib/session";
import { FATAL_WS_ERROR_CODES, type Chat, type WsErrorPayload } from "@/types/chat";

interface UseChatSocketOptions {
  roomId: string;
  userId: string;
  userName: string;
  enabled?: boolean;
  onHotMessage?: (message: string) => void;
  onError?: (error: WsErrorPayload) => void;
  onInvalidSession?: () => void;
  onFatalError?: (error: WsErrorPayload) => void;
  onMessageSent?: () => void;
  onUpvoteSuccess?: (chatId: string) => void;
  hotThreshold?: number;
  isAdmin?: boolean;
}

const RECONNECT_DELAY_MS = 3000;
const ERROR_TOAST_DEBOUNCE_MS = 10000;

function mapHistoryPayload(
  chats: Array<{
    chatId: string;
    message: string;
    name: string;
    upVotes: number;
    upvotedByMe?: boolean;
  }>
): Chat[] {
  return chats.map((chat) => ({
    chatId: chat.chatId,
    message: chat.message,
    name: chat.name,
    votes: chat.upVotes,
    upvotedByMe: chat.upvotedByMe ?? false,
  }));
}

export function useChatSocket({
  roomId,
  userId,
  userName,
  enabled = true,
  onHotMessage,
  onError,
  onInvalidSession,
  onFatalError,
  onMessageSent,
  onUpvoteSuccess,
  hotThreshold = 10,
  isAdmin = false,
}: UseChatSocketOptions) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifiedHotRef = useRef<Set<string>>(new Set());
  const pendingUpvotesRef = useRef<Set<string>>(new Set());
  const shouldReconnectRef = useRef(true);
  const isReconnectRef = useRef(false);
  const hotThresholdRef = useRef(hotThreshold);
  const isAdminRef = useRef(isAdmin);
  const userIdRef = useRef(userId);
  const userNameRef = useRef(userName);
  const joinedRef = useRef(false);
  const loadingHistoryRef = useRef(false);
  const lastErrorToastRef = useRef<{ code: string; at: number } | null>(null);

  const onHotMessageRef = useRef(onHotMessage);
  const onErrorRef = useRef(onError);
  const onInvalidSessionRef = useRef(onInvalidSession);
  const onFatalErrorRef = useRef(onFatalError);
  const onMessageSentRef = useRef(onMessageSent);
  const onUpvoteSuccessRef = useRef(onUpvoteSuccess);

  useEffect(() => {
    hotThresholdRef.current = hotThreshold;
  }, [hotThreshold]);

  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    onHotMessageRef.current = onHotMessage;
    onErrorRef.current = onError;
    onInvalidSessionRef.current = onInvalidSession;
    onFatalErrorRef.current = onFatalError;
    onMessageSentRef.current = onMessageSent;
    onUpvoteSuccessRef.current = onUpvoteSuccess;
  }, [onHotMessage, onError, onInvalidSession, onFatalError, onMessageSent, onUpvoteSuccess]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const closeSocket = useCallback(() => {
    clearReconnectTimer();
    const ws = socketRef.current;
    socketRef.current = null;
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      ws.onclose = null;
      ws.close();
    }
    setConnected(false);
    setJoined(false);
    joinedRef.current = false;
  }, [clearReconnectTimer]);

  const handleFatalError = useCallback(
    (error: WsErrorPayload) => {
      shouldReconnectRef.current = false;
      clearReconnectTimer();
      closeSocket();
      setChats([]);
      setHasMoreHistory(false);
      notifiedHotRef.current.clear();
      pendingUpvotesRef.current.clear();
      if (error.code === "INVALID_SESSION") {
        onInvalidSessionRef.current?.();
      } else {
        onFatalErrorRef.current?.(error);
      }
    },
    [clearReconnectTimer, closeSocket]
  );

  const maybeEmitError = useCallback(
    (error: WsErrorPayload) => {
      if (FATAL_WS_ERROR_CODES.has(error.code)) {
        handleFatalError(error);
        return;
      }

      const now = Date.now();
      const last = lastErrorToastRef.current;
      if (
        !last ||
        last.code !== error.code ||
        now - last.at > ERROR_TOAST_DEBOUNCE_MS
      ) {
        lastErrorToastRef.current = { code: error.code, at: now };
        onErrorRef.current?.(error);
      }
    },
    [handleFatalError]
  );

  const joinRoom = useCallback(
    (ws: WebSocket) => {
      const sessionToken = getSessionToken();
      if (!sessionToken) return;

      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          payload: {
            name: userNameRef.current,
            userId: userIdRef.current,
            roomId,
            sessionToken,
          },
        })
      );
    },
    [roomId]
  );

  const connect = useCallback(() => {
    if (!roomId || !userId || !enabled) return;

    const keepChatsOnReconnect = isReconnectRef.current;
    isReconnectRef.current = false;

    closeSocket();

    if (!keepChatsOnReconnect) {
      setChats([]);
      setHasMoreHistory(false);
      notifiedHotRef.current.clear();
      pendingUpvotesRef.current.clear();
    }

    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setJoined(false);
      joinedRef.current = false;
      joinRoom(ws);
    };

    ws.onclose = () => {
      setConnected(false);
      setJoined(false);
      joinedRef.current = false;
      if (shouldReconnectRef.current && enabled) {
        isReconnectRef.current = true;
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };

    ws.onerror = () => {
      setConnected(false);
      setJoined(false);
      joinedRef.current = false;
    };

    ws.onmessage = (event) => {
      try {
        const { payload, type } = JSON.parse(event.data);

        if (type === "CHAT_HISTORY") {
          const history = mapHistoryPayload(payload.chats ?? []);
          const append = Boolean(payload.append);

          history.forEach((chat) => {
            if (chat.votes >= hotThresholdRef.current) {
              notifiedHotRef.current.add(chat.chatId);
            }
          });

          if (append) {
            setChats((prev) => {
              const existingIds = new Set(prev.map((c) => c.chatId));
              const older = history.filter((c) => !existingIds.has(c.chatId));
              return [...older, ...prev];
            });
            setLoadingHistory(false);
            loadingHistoryRef.current = false;
          } else {
            setChats(history);
            setJoined(true);
            joinedRef.current = true;
          }

          setHasMoreHistory(Boolean(payload.hasMore));
          return;
        }

        if (type === "ADD_CHAT") {
          setChats((prev) => {
            if (prev.some((c) => c.chatId === payload.chatId)) return prev;
            const senderId = payload.userId as string | undefined;
            const isOwn =
              senderId !== undefined
                ? senderId === userIdRef.current
                : payload.name === userNameRef.current;
            if (isOwn) onMessageSentRef.current?.();
            return [
              ...prev,
              {
                chatId: payload.chatId,
                message: payload.message,
                votes: payload.upVotes,
                name: payload.name,
                upvotedByMe: false,
              },
            ];
          });
          return;
        }

        if (type === "UPDATE_CHAT") {
          setChats((prev) => {
            const prevChat = prev.find((c) => c.chatId === payload.chatId);
            const crossedHot =
              prevChat &&
              prevChat.votes < hotThresholdRef.current &&
              payload.upVotes >= hotThresholdRef.current;

            if (
              crossedHot &&
              isAdminRef.current &&
              !notifiedHotRef.current.has(payload.chatId)
            ) {
              notifiedHotRef.current.add(payload.chatId);
              onHotMessageRef.current?.(prevChat.message);
            }

            const wasPending = pendingUpvotesRef.current.has(payload.chatId);

            if (prevChat && payload.upVotes > prevChat.votes && wasPending) {
              pendingUpvotesRef.current.delete(payload.chatId);
              onUpvoteSuccessRef.current?.(payload.chatId);
            }

            return prev.map((c) =>
              c.chatId === payload.chatId
                ? {
                    ...c,
                    votes: payload.upVotes,
                    upvotedByMe: c.upvotedByMe || wasPending,
                  }
                : c
            );
          });
          return;
        }

        if (type === "DISMISS_CHAT") {
          setChats((prev) => prev.filter((c) => c.chatId !== payload.chatId));
          notifiedHotRef.current.delete(payload.chatId);
          return;
        }

        if (type === "ERROR") {
          const error: WsErrorPayload = {
            code: payload.code,
            message: payload.message ?? "Something went wrong",
            remainingSeconds: payload.remainingSeconds,
            chatId: payload.chatId,
          };

          if (error.code === "ALREADY_UPVOTED" && error.chatId) {
            pendingUpvotesRef.current.delete(error.chatId);
            setChats((prev) =>
              prev.map((c) =>
                c.chatId === error.chatId ? { ...c, upvotedByMe: true } : c
              )
            );
          }

          if (error.code === "CHAT_NOT_FOUND" && error.chatId) {
            pendingUpvotesRef.current.delete(error.chatId);
            setChats((prev) => prev.filter((c) => c.chatId !== error.chatId));
          }

          if (error.code === "UPVOTE_FAILED" && error.chatId) {
            pendingUpvotesRef.current.delete(error.chatId);
          }

          if (loadingHistoryRef.current) {
            setLoadingHistory(false);
            loadingHistoryRef.current = false;
          }

          maybeEmitError(error);
        }
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.warn("Malformed WebSocket message");
        }
      }
    };
  }, [closeSocket, enabled, joinRoom, maybeEmitError, roomId, userId]);

  useEffect(() => {
    setChats([]);
    setHasMoreHistory(false);
    notifiedHotRef.current.clear();
    pendingUpvotesRef.current.clear();
    isReconnectRef.current = false;
  }, [roomId]);

  useEffect(() => {
    if (!enabled) {
      shouldReconnectRef.current = false;
      closeSocket();
      return;
    }

    shouldReconnectRef.current = true;
    connect();

    return () => {
      shouldReconnectRef.current = false;
      closeSocket();
    };
  }, [connect, enabled, closeSocket]);

  const reconnect = useCallback(() => {
    if (!enabled) return;
    shouldReconnectRef.current = true;
    isReconnectRef.current = true;
    connect();
  }, [connect, enabled]);

  const canSend = (): boolean => {
    const ws = socketRef.current;
    return Boolean(ws && ws.readyState === WebSocket.OPEN && joinedRef.current);
  };

  const sendMessage = (message: string): boolean => {
    if (!canSend()) return false;
    socketRef.current?.send(
      JSON.stringify({
        type: "SEND_MESSAGE",
        payload: { message },
      })
    );
    return true;
  };

  const sendUpvote = (chatId: string): boolean => {
    if (!canSend()) return false;
    pendingUpvotesRef.current.add(chatId);
    socketRef.current?.send(
      JSON.stringify({
        type: "UPVOTE_MESSAGE",
        payload: { chatId },
      })
    );
    return true;
  };

  const sendDismiss = (chatId: string): boolean => {
    if (!canSend()) return false;
    socketRef.current?.send(
      JSON.stringify({
        type: "DISMISS_CHAT",
        payload: { chatId },
      })
    );
    return true;
  };

  const loadMoreHistory = (): boolean => {
    if (!canSend() || loadingHistory || !hasMoreHistory) return false;
    const oldest = chats[0];
    if (!oldest) return false;

    setLoadingHistory(true);
    loadingHistoryRef.current = true;
    socketRef.current?.send(
      JSON.stringify({
        type: "LOAD_MORE_HISTORY",
        payload: { beforeChatId: oldest.chatId },
      })
    );
    return true;
  };

  return {
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
  };
}
