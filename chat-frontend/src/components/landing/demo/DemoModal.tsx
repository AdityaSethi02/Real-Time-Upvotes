"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconClose } from "@/lib/icons";
import DemoPlayer from "./DemoPlayer";

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DemoModal({ open, onClose }: DemoModalProps) {
  const router = useRouter();
  const [playerKey, setPlayerKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setPlayerKey((k) => k + 1);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="glass w-full max-w-5xl rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 max-h-[96vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 id="demo-modal-title" className="text-lg font-semibold text-foreground">
              Product Demo
            </h2>
            <p className="text-sm text-muted">
              See how ChatBoard works — from room setup to trending messages.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground transition-colors shrink-0"
            aria-label="Close demo"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <DemoPlayer
          key={playerKey}
          onTryCreate={() => handleNavigate("/admin/create")}
          onTryJoin={() => handleNavigate("/user/join")}
        />
      </div>
    </div>
  );
}
