"use client";

import { IconChevronUp } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface UpvoteButtonProps {
  votes: number;
  onUpvote: () => void;
  disabled?: boolean;
  alreadyUpvoted?: boolean;
  cooldown?: number;
  size?: "sm" | "md";
}

export default function UpvoteButton({
  votes,
  onUpvote,
  disabled,
  alreadyUpvoted,
  cooldown,
  size = "md",
}: UpvoteButtonProps) {
  const isDisabled = disabled || alreadyUpvoted || !!cooldown;

  return (
    <button
      onClick={onUpvote}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        isDisabled
          ? "border-border text-muted cursor-not-allowed opacity-50"
          : "border-border text-muted hover:border-primary/50 hover:bg-primary/10 hover:text-primary active:animate-bounce-vote",
        alreadyUpvoted && "border-primary/30 text-primary/70"
      )}
      title={alreadyUpvoted ? "Already upvoted" : undefined}
    >
      <IconChevronUp className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      <span>{votes}</span>
      {cooldown ? <span className="text-hot">({cooldown}s)</span> : null}
    </button>
  );
}
