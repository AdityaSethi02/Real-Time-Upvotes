import { cn } from "@/lib/utils";

type ConnectionPhase = "live" | "connecting" | "reconnecting";

interface ConnectionStatusProps {
  phase: ConnectionPhase;
}

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
      <span className="text-muted">
        {phase === "live"
          ? "Live"
          : phase === "connecting"
            ? "Connecting..."
            : "Reconnecting..."}
      </span>
    </div>
  );
}
