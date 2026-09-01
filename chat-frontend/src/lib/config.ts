export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080";
export const MAX_MESSAGE_LENGTH = Number(
  process.env.NEXT_PUBLIC_MAX_MESSAGE_LENGTH ?? "500"
);
