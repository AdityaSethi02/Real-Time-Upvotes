import { IconMessage } from "@/lib/icons";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "No messages yet",
  description = "Be the first to say something!",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border">
        <IconMessage className="h-6 w-6 text-muted" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}
