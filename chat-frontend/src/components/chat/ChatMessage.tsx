import { cn } from "@/lib/utils";
import { getAvatarColor, getInitials } from "@/lib/avatar";

interface ChatMessageProps {
  name: string;
  message: string;
  votes: number;
  isOwn?: boolean;
  children?: React.ReactNode;
}

export default function ChatMessage({ name, message, votes, isOwn, children }: ChatMessageProps) {
  const avatarColor = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "group flex gap-3 animate-slide-up",
        isOwn && "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
          avatarColor
        )}
      >
        {initials}
      </div>

      <div className={cn("flex max-w-[75%] flex-col gap-1", isOwn && "items-end")}>
        <span className="text-xs text-muted">{name}</span>
        <div
          className={cn(
            "relative rounded-2xl px-4 py-2.5 text-sm text-foreground",
            isOwn
              ? "rounded-tr-sm bg-primary/20 border border-primary/30"
              : "rounded-tl-sm bg-surface border border-border"
          )}
        >
          <p className="break-words">{message}</p>
        </div>
        <div className={cn("flex items-center gap-2", isOwn && "flex-row-reverse")}>
          {votes > 0 && (
            <span className="text-xs text-muted">{votes} upvote{votes !== 1 ? "s" : ""}</span>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
