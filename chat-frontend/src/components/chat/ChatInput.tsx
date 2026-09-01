"use client";

import { IconSend } from "@/lib/icons";
import { useRef, useState } from "react";
import Button from "@/components/Button";
import { MAX_MESSAGE_LENGTH } from "@/lib/config";

interface ChatInputProps {
  onSend: (message: string) => boolean;
  disabled?: boolean;
  cooldown?: number;
  maxLength?: number;
}

export default function ChatInput({
  onSend,
  disabled,
  cooldown,
  maxLength = MAX_MESSAGE_LENGTH,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [lengthError, setLengthError] = useState("");

  const handleSend = () => {
    const value = inputRef.current?.value.trim();
    if (!value || disabled) return;

    if (value.length > maxLength) {
      setLengthError(`Message must be ${maxLength} characters or fewer`);
      return;
    }

    setLengthError("");
    const sent = onSend(value);
    if (sent && inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-surface/50 p-4">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          disabled={disabled}
          maxLength={maxLength}
          onKeyDown={handleKeyDown}
          onChange={() => setLengthError("")}
          className="flex-1 rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
        <Button
          onClick={handleSend}
          disabled={disabled}
          size="md"
          className="shrink-0"
        >
          {cooldown ? `${cooldown}s` : <IconSend className="h-4 w-4" />}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">
        Press Enter to send · max {maxLength} characters
      </p>
      {lengthError && <p className="mt-1 text-xs text-hot">{lengthError}</p>}
    </div>
  );
}
