"use client";

import { IconLogIn, IconPlus } from "@/lib/icons";
import Button from "@/components/Button";
import { DemoHighlightRing } from "../DemoCursor";
import type { DemoSceneState } from "../demoData";

interface DemoLandingSceneProps {
  state: DemoSceneState;
}

export default function DemoLandingScene({ state }: DemoLandingSceneProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-6 text-center">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] text-primary">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        Real-time · WebSocket powered
      </div>

      <h2 className="mb-2 text-lg font-bold tracking-tight text-foreground sm:text-xl">
        Chat that{" "}
        <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
          ranks itself
        </span>
      </h2>

      <p className="mb-5 max-w-xs text-[11px] text-muted leading-relaxed">
        A real-time chatroom where the community decides what matters.
      </p>

      <div className="flex flex-col gap-2 w-full max-w-[220px]">
        <div className="relative">
          <DemoHighlightRing active={state.highlightCreate} />
          <Button size="sm" className="w-full pointer-events-none">
            <IconPlus className="h-4 w-4" />
            Create Room
          </Button>
        </div>
        <div className="relative">
          <DemoHighlightRing active={state.highlightJoin} />
          <Button variant="secondary" size="sm" className="w-full pointer-events-none">
            <IconLogIn className="h-4 w-4" />
            Join Room
          </Button>
        </div>
      </div>
    </div>
  );
}
