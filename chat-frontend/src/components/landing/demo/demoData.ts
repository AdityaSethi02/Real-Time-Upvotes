import type { Chat } from "@/types/chat";

export const DEMO_ROOM = {
  roomName: "Team Standup",
  roomId: "DEMO-7K2M",
  mediumThreshold: 3,
  hotThreshold: 10,
  chatCoolDown: 5,
  upvoteCoolDown: 5,
};

export const DEMO_ADMIN_NAME = "Alex Chen";
export const DEMO_USER_NAME = "Jordan Lee";
export const DEMO_HERO_MESSAGE_ID = "demo-msg-1";

export const DEMO_HERO_MESSAGE = "Who's leading standup today?";

export const initialPeerChats: Chat[] = [
  {
    chatId: "demo-msg-2",
    name: "Sarah",
    message: "Great idea!",
    votes: 1,
  },
  {
    chatId: "demo-msg-3",
    name: "Mike",
    message: "Let's ship it 🚀",
    votes: 0,
  },
];

export function createHeroMessage(votes = 0, upvotedByMe = false): Chat {
  return {
    chatId: DEMO_HERO_MESSAGE_ID,
    name: DEMO_USER_NAME,
    message: DEMO_HERO_MESSAGE,
    votes,
    upvotedByMe,
  };
}

export type DemoScene = "landing" | "create" | "join" | "chat";

export type DemoDevice = "laptop" | "phone";

export type DemoMobileTab = "chat" | "trending" | "hot";

export type DemoHighlight =
  | "create-btn"
  | "join-btn"
  | "create-submit"
  | "join-submit"
  | "chat-input"
  | "upvote"
  | "sidebar-trending"
  | "sidebar-hot";

export type DemoCursorTarget =
  | "create-btn"
  | "join-btn"
  | "create-submit"
  | "join-submit"
  | "chat-input"
  | "send-btn"
  | "upvote-btn";

export interface DemoSceneState {
  scene: DemoScene;
  device: DemoDevice;
  mobileTab: DemoMobileTab;
  highlightCreate: boolean;
  highlightJoin: boolean;
  adminName: string;
  roomName: string;
  mediumThreshold: string;
  hotThreshold: string;
  createLoading: boolean;
  showCreateToast: boolean;
  userName: string;
  roomId: string;
  joinLoading: boolean;
  showJoinToast: boolean;
  chats: Chat[];
  typedText: string;
  chatCooldown: number;
  upvoteCooldowns: Record<string, number>;
  highlight: DemoHighlight | null;
  showHotToast: boolean;
  showCursor: boolean;
  cursorTarget: DemoCursorTarget | null;
  upvoteBounceId: string | null;
}

export const initialDemoSceneState: DemoSceneState = {
  scene: "landing",
  device: "laptop",
  mobileTab: "chat",
  highlightCreate: false,
  highlightJoin: false,
  adminName: "",
  roomName: "",
  mediumThreshold: "3",
  hotThreshold: "10",
  createLoading: false,
  showCreateToast: false,
  userName: "",
  roomId: "",
  joinLoading: false,
  showJoinToast: false,
  chats: [...initialPeerChats],
  typedText: "",
  chatCooldown: 0,
  upvoteCooldowns: {},
  highlight: null,
  showHotToast: false,
  showCursor: false,
  cursorTarget: null,
  upvoteBounceId: null,
};
