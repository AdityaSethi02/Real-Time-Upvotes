"use client";

import { IconCheck, IconClose, IconCopy } from "@/lib/icons";
import { useEffect, useState } from "react";
import Button from "@/components/Button";

interface RoomInfoModalProps {
  open: boolean;
  onClose: () => void;
  roomName?: string;
  roomId?: string;
  chatCoolDown?: number;
  upvoteCoolDown?: number;
  mediumThreshold?: number;
  hotThreshold?: number;
  onLeaveRoom?: () => void;
}

export default function RoomInfoModal({
  open,
  onClose,
  roomName,
  roomId,
  chatCoolDown,
  upvoteCoolDown,
  mediumThreshold,
  hotThreshold,
  onLeaveRoom,
}: RoomInfoModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleCopy = async () => {
    if (!roomId) return;
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard denied
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="glass w-full max-w-md rounded-2xl p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-info-title"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="room-info-title" className="text-lg font-semibold text-foreground">
            Room Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted mb-1">Room Name</p>
            <p className="font-medium text-foreground">{roomName ?? "—"}</p>
          </div>

          <div>
            <p className="text-xs text-muted mb-1">Room Code</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-background border border-border px-3 py-2 text-sm font-mono text-foreground truncate">
                {roomId}
              </code>
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted mb-1">Chat Cooldown</p>
              <p className="font-medium text-foreground">{chatCoolDown ?? 0}s</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Upvote Cooldown</p>
              <p className="font-medium text-foreground">{upvoteCoolDown ?? 0}s</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Trending threshold</p>
              <p className="font-medium text-foreground">{mediumThreshold ?? 3}+ votes</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Hot threshold</p>
              <p className="font-medium text-foreground">{hotThreshold ?? 10}+ votes</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {onLeaveRoom && (
            <Button variant="secondary" className="w-full" onClick={onLeaveRoom}>
              Leave Room
            </Button>
          )}
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
