export interface Chat {
  chatId: string;
  message: string;
  votes: number;
  name: string;
  upvotedByMe?: boolean;
}

export type WsErrorCode =
  | "INVALID_PAYLOAD"
  | "INVALID_SESSION"
  | "ROOM_NOT_FOUND"
  | "NOT_JOINED"
  | "CHAT_COOLDOWN"
  | "UPVOTE_COOLDOWN"
  | "SEND_FAILED"
  | "UPVOTE_FAILED"
  | "ALREADY_UPVOTED"
  | "CHAT_NOT_FOUND"
  | "FORBIDDEN"
  | "DISMISS_FAILED"
  | "RATE_LIMITED"
  | "INVALID_JSON"
  | "INTERNAL_ERROR";

export interface WsErrorPayload {
  code: WsErrorCode;
  message: string;
  remainingSeconds?: number;
  chatId?: string;
}

export const FATAL_WS_ERROR_CODES: ReadonlySet<WsErrorCode> = new Set([
  "INVALID_SESSION",
  "ROOM_NOT_FOUND",
  "FORBIDDEN",
]);
