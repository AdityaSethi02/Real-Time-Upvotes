"use client";

import { cn } from "@/lib/utils";
import type { DemoCursorTarget } from "./demoData";

const CURSOR_POSITIONS: Record<DemoCursorTarget, { top: string; left: string }> = {
  "create-btn": { top: "62%", left: "38%" },
  "join-btn": { top: "62%", left: "62%" },
  "create-submit": { top: "88%", left: "50%" },
  "join-submit": { top: "78%", left: "50%" },
  "chat-input": { top: "82%", left: "35%" },
  "send-btn": { top: "82%", left: "88%" },
  "upvote-btn": { top: "55%", left: "78%" },
};

interface DemoCursorProps {
  target: DemoCursorTarget | null;
  visible: boolean;
}

export default function DemoCursor({ target, visible }: DemoCursorProps) {
  if (!visible || !target) return null;

  const pos = CURSOR_POSITIONS[target];

  return (
    <div
      className="pointer-events-none absolute z-50 animate-demo-cursor"
      style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -50%)" }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="drop-shadow-lg"
      >
        <path
          d="M5 3L19 12L12 13L9 19L5 3Z"
          fill="white"
          stroke="black"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={cn(
          "absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-primary",
          "animate-demo-click-ring"
        )}
      />
    </div>
  );
}

interface DemoHighlightRingProps {
  active: boolean;
  className?: string;
}

export function DemoHighlightRing({ active, className }: DemoHighlightRingProps) {
  if (!active) return null;
  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-primary ring-offset-2 ring-offset-background animate-demo-highlight",
        className
      )}
    />
  );
}
