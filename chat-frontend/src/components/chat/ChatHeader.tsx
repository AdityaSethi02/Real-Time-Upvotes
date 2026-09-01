"use client";

import { IconArrowLeft, IconInfo } from "@/lib/icons";
import { useRouter } from "next/navigation";
import { logoutSession } from "@/lib/session";
import ConnectionStatus from "./ConnectionStatus";

type ConnectionPhase = "loading" | "connecting" | "live" | "reconnecting";

interface ChatHeaderProps {
  roomName?: string;
  connectionPhase: ConnectionPhase;
  onInfoClick: () => void;
}

export default function ChatHeader({
  roomName,
  connectionPhase,
  onInfoClick,
}: ChatHeaderProps) {
  const router = useRouter();

  const handleBack = async () => {
    await logoutSession();
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface/50 px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground transition-colors"
        >
          <IconArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-semibold text-foreground leading-tight">
            {roomName ?? "Chat Room"}
          </h1>
          <ConnectionStatus phase={connectionPhase} />
        </div>
      </div>

      <button
        onClick={onInfoClick}
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-sm text-muted hover:text-foreground hover:border-primary/30 transition-all"
      >
        <IconInfo className="h-4 w-4" />
        <span className="hidden sm:inline">Room Info</span>
      </button>
    </header>
  );
}
