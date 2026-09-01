"use client";

import { IconHome, IconPlus, IconUser } from "@/lib/icons";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { cn } from "@/lib/utils";
import { DemoHighlightRing } from "../DemoCursor";
import type { DemoSceneState } from "../demoData";

interface DemoCreateSceneProps {
  state: DemoSceneState;
}

function DemoField({
  label,
  value,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-medium text-foreground">{label}</label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <div
          className={cn(
            "w-full rounded-lg border border-border bg-background py-2 text-[11px] text-foreground",
            icon ? "pl-8 pr-3" : "px-3"
          )}
        >
          {value || <span className="text-muted">{placeholder}</span>}
        </div>
      </div>
    </div>
  );
}

export default function DemoCreateScene({ state }: DemoCreateSceneProps) {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3">
      <div className="mb-4 flex items-start gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <IconPlus className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Create a Room</h2>
          <p className="text-[10px] text-muted">Set up your chat room and invite others.</p>
        </div>
      </div>

      <Card className="space-y-3 p-3">
        <DemoField
          label="Your Name"
          value={state.adminName}
          placeholder="John Doe"
          icon={<IconUser className="h-3 w-3" />}
        />
        <DemoField
          label="Room Name"
          value={state.roomName}
          placeholder="Team Standup"
          icon={<IconHome className="h-3 w-3" />}
        />

        <div className="h-px bg-border" />

        <div className="grid grid-cols-2 gap-2">
          <DemoField label="Trending" value={state.mediumThreshold} placeholder="3" />
          <DemoField label="Hot" value={state.hotThreshold} placeholder="10" />
        </div>

        <div className="relative">
          <DemoHighlightRing active={state.highlight === "create-submit"} />
          <Button
            size="sm"
            className="w-full pointer-events-none"
            loading={state.createLoading}
          >
            <IconPlus className="h-4 w-4" />
            Create Room
          </Button>
        </div>
      </Card>

      {state.showCreateToast && (
        <div
          className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[10px] text-foreground animate-slide-up"
        >
          Room created! Redirecting...
        </div>
      )}
    </div>
  );
}
