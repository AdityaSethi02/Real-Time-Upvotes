"use client";

import { cn } from "@/lib/utils";
import type { DemoDevice, DemoCursorTarget } from "./demoData";
import DemoCursor from "./DemoCursor";

interface DeviceFrameProps {
  device: DemoDevice;
  onDeviceChange?: (device: DemoDevice) => void;
  children: React.ReactNode;
  className?: string;
  showCursor?: boolean;
  cursorTarget?: DemoCursorTarget | null;
}

const DEVICE_OPTIONS: { id: DemoDevice; label: string; icon: string }[] = [
  { id: "laptop", label: "Laptop", icon: "💻" },
  { id: "phone", label: "Phone", icon: "📱" },
];

export default function DeviceFrame({
  device,
  onDeviceChange,
  children,
  className,
  showCursor = false,
  cursorTarget = null,
}: DeviceFrameProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {onDeviceChange && (
        <div className="flex justify-center gap-2">
          {DEVICE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onDeviceChange(opt.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                device === opt.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-surface text-muted hover:border-primary/40 hover:text-foreground"
              )}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative mx-auto w-full">
        {device === "laptop" ? (
          <div className="rounded-xl border border-border bg-surface p-2 shadow-2xl shadow-black/40">
            <div className="mb-2 flex items-center gap-1.5 px-2">
              <span className="h-2 w-2 rounded-full bg-hot/80" />
              <span className="h-2 w-2 rounded-full bg-amber-vote/80" />
              <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
              <div className="mx-auto max-w-[60%] truncate rounded-md bg-background/80 px-3 py-0.5 text-[10px] text-muted">
                chatboard.app
              </div>
            </div>
            <div
              className="relative overflow-hidden rounded-lg border border-border bg-background"
              style={{ height: "min(420px, 52vh)" }}
            >
              {children}
              <DemoCursor target={cursorTarget} visible={showCursor} />
            </div>
            <div className="mx-auto mt-2 h-2 w-24 rounded-full bg-border" />
          </div>
        ) : (
          <div className="mx-auto w-[min(280px,100%)]">
            <div className="rounded-[2rem] border-4 border-border bg-surface p-2 shadow-2xl shadow-black/40">
              <div className="mx-auto mb-2 h-5 w-24 rounded-full bg-border" />
              <div
                className="relative overflow-hidden rounded-[1.25rem] border border-border bg-background"
                style={{ height: "min(460px, 58vh)" }}
              >
                {children}
                <DemoCursor target={cursorTarget} visible={showCursor} />
              </div>
              <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-border" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
