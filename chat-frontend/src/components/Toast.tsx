"use client";

import { IconClose } from "@/lib/icons";
import type { Toast, ToastType } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const typeStyles: Record<ToastType, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10",
  error: "border-hot/30 bg-hot/10",
  info: "border-border bg-surface",
  hot: "border-hot/50 bg-hot/15 animate-pulse-glow",
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm text-foreground shadow-lg animate-slide-up",
            typeStyles[toast.type]
          )}
        >
          <p className="flex-1">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-muted hover:text-foreground transition-colors"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
