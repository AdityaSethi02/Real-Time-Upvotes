import {
  DEMO_ADMIN_NAME,
  DEMO_HERO_MESSAGE_ID,
  DEMO_ROOM,
  DEMO_USER_NAME,
  createHeroMessage,
  initialPeerChats,
  type DemoScene,
  type DemoSceneState,
} from "./demoData";

export interface DemoApi {
  setState: (patch: Partial<DemoSceneState>) => void;
  getState: () => DemoSceneState;
  delay: (ms: number) => Promise<void>;
  typeText: (text: string, charMs?: number) => Promise<void>;
  bumpVotes: (chatId: string, votes: number, upvotedByMe?: boolean) => void;
  startCooldown: (chatId: string, seconds: number) => void;
  startChatCooldown: (seconds: number) => void;
}

export interface DemoStep {
  id: string;
  title: string;
  description: string;
  durationMs: number;
  scene: DemoScene;
  onEnter?: (api: DemoApi) => void | Promise<void>;
}

function makeApi(
  setState: (patch: Partial<DemoSceneState> | ((s: DemoSceneState) => Partial<DemoSceneState>)) => void,
  getState: () => DemoSceneState,
  timerIds: ReturnType<typeof setTimeout>[]
): DemoApi {
  return {
    setState: (patch) => setState(patch),
    getState,
    delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    async typeText(text, charMs = 45) {
      for (let i = 1; i <= text.length; i++) {
        setState({ typedText: text.slice(0, i) });
        await new Promise((r) => setTimeout(r, charMs));
      }
    },
    bumpVotes(chatId, votes, upvotedByMe = false) {
      const chats = getState().chats.map((c) =>
        c.chatId === chatId ? { ...c, votes, upvotedByMe } : c
      );
      setState({ chats, upvoteBounceId: chatId });
      const bounceId = setTimeout(() => setState({ upvoteBounceId: null }), 350);
      timerIds.push(bounceId);
    },
    startCooldown(chatId, seconds) {
      const tick = () => {
        const remaining = getState().upvoteCooldowns[chatId] ?? 0;
        if (remaining <= 1) {
          setState({
            upvoteCooldowns: { ...getState().upvoteCooldowns, [chatId]: 0 },
          });
          return;
        }
        setState({
          upvoteCooldowns: {
            ...getState().upvoteCooldowns,
            [chatId]: remaining - 1,
          },
        });
        const id = setTimeout(tick, 1000);
        timerIds.push(id);
      };
      setState({
        upvoteCooldowns: { ...getState().upvoteCooldowns, [chatId]: seconds },
      });
      const id = setTimeout(tick, 1000);
      timerIds.push(id);
    },
    startChatCooldown(seconds) {
      const tick = () => {
        const remaining = getState().chatCooldown;
        if (remaining <= 1) {
          setState({ chatCooldown: 0 });
          return;
        }
        setState({ chatCooldown: remaining - 1 });
        const id = setTimeout(tick, 1000);
        timerIds.push(id);
      };
      setState({ chatCooldown: seconds });
      const id = setTimeout(tick, 1000);
      timerIds.push(id);
    },
  };
}

export function createDemoApi(
  setState: (patch: Partial<DemoSceneState> | ((s: DemoSceneState) => Partial<DemoSceneState>)) => void,
  getState: () => DemoSceneState,
  timerIds: ReturnType<typeof setTimeout>[] = []
): DemoApi {
  return makeApi(setState, getState, timerIds);
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: "welcome",
    title: "Welcome to ChatBoard",
    description:
      "A real-time chatroom where the community decides what matters. Create a room or join with a code.",
    durationMs: 3500,
    scene: "landing",
    onEnter: async (api) => {
      api.setState({
        scene: "landing",
        highlightCreate: true,
        highlightJoin: false,
        showCursor: true,
        cursorTarget: "create-btn",
      });
      await api.delay(1200);
      api.setState({
        highlightCreate: false,
        highlightJoin: true,
        cursorTarget: "join-btn",
      });
    },
  },
  {
    id: "create-room",
    title: "Create a room",
    description:
      "Set your name, room name, vote thresholds, and cooldowns — then launch your chatroom.",
    durationMs: 4500,
    scene: "create",
    onEnter: async (api) => {
      api.setState({
        scene: "create",
        adminName: "",
        roomName: "",
        mediumThreshold: "3",
        hotThreshold: "10",
        createLoading: false,
        showCreateToast: false,
        showCursor: true,
        cursorTarget: null,
        highlight: null,
      });
      await api.delay(400);
      const admin = DEMO_ADMIN_NAME;
      for (let i = 1; i <= admin.length; i++) {
        api.setState({ adminName: admin.slice(0, i) });
        await api.delay(50);
      }
      await api.delay(300);
      const room = DEMO_ROOM.roomName;
      for (let i = 1; i <= room.length; i++) {
        api.setState({ roomName: room.slice(0, i) });
        await api.delay(55);
      }
      api.setState({ cursorTarget: "create-submit", highlight: "create-submit" });
    },
  },
  {
    id: "room-created",
    title: "Room created",
    description: "Your room is live. Share the room code so others can join.",
    durationMs: 2800,
    scene: "create",
    onEnter: async (api) => {
      api.setState({
        createLoading: true,
        showCursor: true,
        cursorTarget: "create-submit",
        highlight: "create-submit",
      });
      await api.delay(900);
      api.setState({
        createLoading: false,
        showCreateToast: true,
        showCursor: false,
        cursorTarget: null,
        highlight: null,
      });
    },
  },
  {
    id: "join-room",
    title: "Join with a code",
    description: "Anyone with the room code can join — just enter a name and paste the code.",
    durationMs: 4000,
    scene: "join",
    onEnter: async (api) => {
      api.setState({
        scene: "join",
        userName: "",
        roomId: "",
        joinLoading: false,
        showJoinToast: false,
        showCursor: true,
        cursorTarget: null,
        highlight: null,
      });
      await api.delay(400);
      const name = DEMO_USER_NAME;
      for (let i = 1; i <= name.length; i++) {
        api.setState({ userName: name.slice(0, i) });
        await api.delay(50);
      }
      await api.delay(300);
      const code = DEMO_ROOM.roomId;
      for (let i = 1; i <= code.length; i++) {
        api.setState({ roomId: code.slice(0, i) });
        await api.delay(70);
      }
      api.setState({ cursorTarget: "join-submit", highlight: "join-submit" });
    },
  },
  {
    id: "live-chat",
    title: "You're live",
    description: "WebSocket connection is active. Messages sync instantly across everyone in the room.",
    durationMs: 2800,
    scene: "chat",
    onEnter: async (api) => {
      api.setState({
        scene: "chat",
        chats: [...initialPeerChats],
        typedText: "",
        chatCooldown: 0,
        upvoteCooldowns: {},
        mobileTab: "chat",
        showJoinToast: false,
        joinLoading: true,
        showCursor: false,
        cursorTarget: null,
        highlight: null,
        showHotToast: false,
      });
      await api.delay(600);
      api.setState({ joinLoading: false, showJoinToast: true });
      await api.delay(800);
      api.setState({ showJoinToast: false });
    },
  },
  {
    id: "send-message",
    title: "Send a message",
    description: "Type and send — your message appears in the live feed for everyone to see.",
    durationMs: 4500,
    scene: "chat",
    onEnter: async (api) => {
      api.setState({
        chats: [...initialPeerChats],
        typedText: "",
        showCursor: true,
        cursorTarget: "chat-input",
        highlight: "chat-input",
        mobileTab: "chat",
      });
      await api.delay(500);
      await api.typeText(createHeroMessage().message, 40);
      await api.delay(400);
      api.setState({ cursorTarget: "send-btn" });
      await api.delay(500);
      api.setState({
        chats: [...initialPeerChats, createHeroMessage()],
        typedText: "",
        showCursor: false,
        cursorTarget: null,
        highlight: null,
        chatCooldown: DEMO_ROOM.chatCoolDown,
      });
      api.startChatCooldown(DEMO_ROOM.chatCoolDown);
    },
  },
  {
    id: "upvote",
    title: "Upvote messages",
    description: "Vote on messages you love. The best ideas rise to the top of the feed.",
    durationMs: 3200,
    scene: "chat",
    onEnter: async (api) => {
      api.setState({
        chats: [...initialPeerChats, createHeroMessage()],
        showCursor: true,
        cursorTarget: "upvote-btn",
        highlight: "upvote",
        mobileTab: "chat",
      });
      await api.delay(800);
      api.bumpVotes(DEMO_HERO_MESSAGE_ID, 1, true);
      await api.delay(600);
      api.bumpVotes(DEMO_HERO_MESSAGE_ID, 2, true);
      await api.delay(600);
      api.bumpVotes(DEMO_HERO_MESSAGE_ID, 3, true);
      api.setState({ showCursor: false, cursorTarget: null, highlight: null });
    },
  },
  {
    id: "upvote-cooldown",
    title: "Upvote cooldown",
    description:
      "Room creators can set per-message upvote cooldowns — the timer shows on the button until you can vote again.",
    durationMs: 4000,
    scene: "chat",
    onEnter: async (api) => {
      api.setState({
        chats: [...initialPeerChats, createHeroMessage(3, true)],
        showCursor: true,
        cursorTarget: "upvote-btn",
        highlight: "upvote",
        mobileTab: "chat",
      });
      await api.delay(500);
      api.startCooldown(DEMO_HERO_MESSAGE_ID, DEMO_ROOM.upvoteCoolDown);
      api.setState({ showCursor: false, cursorTarget: null });
    },
  },
  {
    id: "trending",
    title: "Trending (3+ votes)",
    description:
      "Messages crossing the trending threshold appear in the sidebar — ranked by community support.",
    durationMs: 3800,
    scene: "chat",
    onEnter: async (api) => {
      const device = api.getState().device;
      api.setState({
        chats: [...initialPeerChats, createHeroMessage(3, true)],
        upvoteCooldowns: {},
        highlight: "sidebar-trending",
        mobileTab: device === "phone" ? "trending" : "chat",
        showCursor: false,
      });
      await api.delay(500);
      api.bumpVotes(DEMO_HERO_MESSAGE_ID, 4, true);
      await api.delay(400);
      api.bumpVotes(DEMO_HERO_MESSAGE_ID, 5, true);
    },
  },
  {
    id: "hot",
    title: "Hot (10+ votes)",
    description:
      "Messages hitting the hot threshold glow in the sidebar and can trigger admin alerts.",
    durationMs: 4500,
    scene: "chat",
    onEnter: async (api) => {
      const device = api.getState().device;
      api.setState({
        chats: [...initialPeerChats, createHeroMessage(5, true)],
        highlight: "sidebar-hot",
        mobileTab: device === "phone" ? "hot" : "chat",
        showHotToast: false,
      });
      await api.delay(600);
      api.bumpVotes(DEMO_HERO_MESSAGE_ID, 8, true);
      await api.delay(400);
      api.bumpVotes(DEMO_HERO_MESSAGE_ID, 10, true);
      await api.delay(500);
      api.setState({ showHotToast: true });
    },
  },
];

export const DEMO_STEP_COUNT = DEMO_STEPS.length;
