import axios from "axios";
import { API_URL } from "@/lib/config";

const SESSION_FRESH_KEY = "sessionFresh";
const SESSION_ROOM_KEY = "sessionRoomId";

export function getSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("userId");
}

export function getSessionUserName(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("userName");
}

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("sessionToken");
}

export function getSessionRoomId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_ROOM_KEY);
}

export function isSessionAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("isAdmin") === "true";
}

export function setSession(
  userId: string,
  userName: string,
  sessionToken: string,
  isAdmin: boolean,
  roomId: string
) {
  sessionStorage.setItem("userId", userId);
  sessionStorage.setItem("userName", userName);
  sessionStorage.setItem("sessionToken", sessionToken);
  sessionStorage.setItem("isAdmin", isAdmin ? "true" : "false");
  sessionStorage.setItem(SESSION_ROOM_KEY, roomId);
}

export function markSessionFresh() {
  if (typeof window === "undefined") return;
  const token = getSessionToken();
  if (token) {
    sessionStorage.setItem(SESSION_FRESH_KEY, token);
  }
}

export function shouldSkipSessionRefresh(): boolean {
  if (typeof window === "undefined") return false;
  const token = getSessionToken();
  const freshToken = sessionStorage.getItem(SESSION_FRESH_KEY);
  return Boolean(token && freshToken && token === freshToken);
}

export function clearSessionFresh() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_FRESH_KEY);
}

export function setIsAdmin(isAdmin: boolean) {
  sessionStorage.setItem("isAdmin", isAdmin ? "true" : "false");
}

export function clearSession() {
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("userName");
  sessionStorage.removeItem("sessionToken");
  sessionStorage.removeItem("isAdmin");
  sessionStorage.removeItem(SESSION_FRESH_KEY);
  sessionStorage.removeItem(SESSION_ROOM_KEY);
}

export function hasValidSession(): boolean {
  return Boolean(getSessionUserId() && getSessionToken() && getSessionRoomId());
}

let refreshInFlight: Promise<boolean> | null = null;

export async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const token = getSessionToken();
    if (!token) return false;

    try {
      const response = await axios.post(`${API_URL}/api/session/refresh`, {
        sessionToken: token,
      });
      const data = response.data as {
        sessionToken: string;
        role: string;
        userId: string;
        roomId: string;
      };
      const userName = getSessionUserName() ?? "";
      setSession(
        data.userId,
        userName,
        data.sessionToken,
        data.role === "admin",
        data.roomId
      );
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function logoutSession(): Promise<void> {
  const token = getSessionToken();
  if (token) {
    try {
      await axios.post(`${API_URL}/api/session/logout`, { sessionToken: token });
    } catch {
      // still clear local session
    }
  }
  clearSession();
}
