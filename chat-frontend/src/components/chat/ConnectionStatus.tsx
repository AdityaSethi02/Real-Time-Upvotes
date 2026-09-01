import { cn } from "@/lib/utils";

type ConnectionPhase = "loading" | "connecting" | "live" | "reconnecting";

interface ConnectionStatusProps {
  phase: ConnectionPhase;
}

const LABELS: Record<ConnectionPhase, string> = {
  loading: "Loading…",
  connecting: "Connecting…",
  live: "Live",
  reconnecting: "Reconnecting…",
};

export default function ConnectionStatus({ phase }: ConnectionStatusProps) {
  const isLive = phase === "live";

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={cn(
          "relative flex h-2 w-2",
          isLive ? "text-emerald-500" : "text-hot"
        )}
      >
        {isLive && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            isLive ? "bg-emerald-500" : "bg-hot"
          )}
        />
      </span>
      <span className="text-muted">{LABELS[phase]}</span>
    </div>
  );
}
