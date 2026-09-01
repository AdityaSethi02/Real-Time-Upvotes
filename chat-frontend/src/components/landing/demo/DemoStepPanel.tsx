"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconPause,
  IconPlay,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

interface DemoStepPanelProps {
  stepIndex: number;
  stepCount: number;
  title: string;
  description: string;
  playing: boolean;
  reducedMotion: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onGoToStep: (index: number) => void;
}

export default function DemoStepPanel({
  stepIndex,
  stepCount,
  title,
  description,
  playing,
  reducedMotion,
  onPrev,
  onNext,
  onTogglePlay,
  onGoToStep,
}: DemoStepPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Step {String(stepIndex + 1).padStart(2, "0")} / {String(stepCount).padStart(2, "0")}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-foreground" aria-live="polite">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: stepCount }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onGoToStep(i)}
            aria-label={`Go to step ${i + 1}`}
            className={cn(
              "rounded-full transition-all",
              i === stepIndex
                ? "h-2 w-6 bg-primary"
                : "h-2 w-2 bg-border hover:bg-muted"
            )}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={stepIndex === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-40"
          aria-label="Previous step"
        >
          <IconChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <IconPause className="h-4 w-4" /> : <IconPlay className="h-4 w-4" />}
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={stepIndex >= stepCount - 1}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-40"
          aria-label="Next step"
        >
          Next
          <IconChevronRight className="h-4 w-4" />
        </button>
      </div>

      {reducedMotion && (
        <p className="text-[10px] text-muted">
          Reduced motion enabled — autoplay is paused.
        </p>
      )}
    </div>
  );
}
