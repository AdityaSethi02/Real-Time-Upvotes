"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AppShell from "@/components/layout/AppShell";
import FormLayout from "@/components/forms/FormLayout";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ToastContainer from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { logoutSession, markSessionFresh, setSession } from "@/lib/session";
import { API_URL } from "@/lib/config";
import { IconCopy, IconKey, IconLogIn, IconUser } from "@/lib/icons";

export default function JoinRoomPage() {
  const router = useRouter();
  const { toasts, show, dismiss } = useToast();
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const presetRoomId = params.get("roomId");
    if (presetRoomId) {
      setRoomId(presetRoomId);
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!userName.trim()) newErrors.userName = "Name is required";
    if (!roomId.trim()) newErrors.roomId = "Room code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setRoomId(text.trim());
    } catch {
      show("Could not read clipboard.", "error");
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await logoutSession();
      const response = await axios.post(`${API_URL}/api/user`, {
        userName,
        roomId: roomId.trim(),
      });
      const data = response.data as {
        user: { userId: string };
        session: { sessionToken: string; role: string };
      };
      setSession(
        data.user.userId,
        userName.trim(),
        data.session.sessionToken,
        data.session.role === "admin",
        roomId.trim()
      );
      markSessionFresh();
      show("Joined room! Redirecting...", "success");
      router.push(`/room/${roomId.trim()}`);
    } catch {
      show("Room not found or failed to join.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <FormLayout
        title="Join a Room"
        subtitle="Enter the room code shared by the room creator."
        icon={<IconLogIn className="h-6 w-6" />}
      >
        <Card
          className="space-y-6"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
        >
          <Input
            id="userName"
            label="Your Name"
            placeholder="John Doe"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            error={errors.userName}
            icon={<IconUser className="h-4 w-4" />}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="roomId" className="text-sm font-medium text-foreground">
              Room Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <IconKey className="h-4 w-4" />
                </span>
                <input
                  id="roomId"
                  placeholder="Paste room code here"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all hover:border-primary/30"
                />
              </div>
              <button
                type="button"
                onClick={handlePaste}
                title="Paste from clipboard"
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 text-sm text-muted transition-all hover:border-primary/40 hover:text-foreground"
              >
                <IconCopy className="h-4 w-4" />
                <span className="hidden sm:inline">Paste</span>
              </button>
            </div>
            {errors.roomId && <p className="text-xs text-hot">{errors.roomId}</p>}
            {!errors.roomId && (
              <p className="text-xs text-muted">
                Ask the room creator to share their room code with you.
              </p>
            )}
          </div>

          <Button className="w-full" size="lg" loading={loading} onClick={handleSubmit}>
            <IconLogIn className="h-5 w-5" />
            Join Room
          </Button>
        </Card>
      </FormLayout>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </AppShell>
  );
}
