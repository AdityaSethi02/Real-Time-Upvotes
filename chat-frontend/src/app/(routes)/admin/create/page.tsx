"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AppShell from "@/components/layout/AppShell";
import FormLayout from "@/components/forms/FormLayout";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import ToastContainer from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { markSessionFresh, setSession } from "@/lib/session";
import { API_URL } from "@/lib/config";
import { IconHome, IconPlus, IconUser } from "@/lib/icons";

const COOLDOWN_OPTIONS = [
  { value: "0sec", label: "No cooldown" },
  { value: "5sec", label: "5 seconds" },
  { value: "10sec", label: "10 seconds" },
  { value: "15sec", label: "15 seconds" },
  { value: "20sec", label: "20 seconds" },
  { value: "25sec", label: "25 seconds" },
  { value: "30sec", label: "30 seconds" },
];

export default function CreateRoomPage() {
  const router = useRouter();
  const { toasts, show, dismiss } = useToast();
  const [adminName, setAdminName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [chatCoolDown, setChatCoolDown] = useState("");
  const [upvoteCoolDown, setUpvoteCoolDown] = useState("");
  const [mediumVoteThreshold, setMediumVoteThreshold] = useState("3");
  const [hotVoteThreshold, setHotVoteThreshold] = useState("10");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!adminName.trim()) newErrors.adminName = "Name is required";
    if (!roomName.trim()) newErrors.roomName = "Room name is required";

    const medium = parseInt(mediumVoteThreshold, 10);
    const hot = parseInt(hotVoteThreshold, 10);
    if (!Number.isFinite(medium) || medium < 1) {
      newErrors.mediumVoteThreshold = "Must be a positive number";
    }
    if (!Number.isFinite(hot) || hot < 2) {
      newErrors.hotVoteThreshold = "Must be at least 2";
    }
    if (
      Number.isFinite(medium) &&
      Number.isFinite(hot) &&
      medium >= hot
    ) {
      newErrors.hotVoteThreshold = "Hot threshold must be higher than trending";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/admin`, {
        adminName,
        roomName,
        chatCoolDown: chatCoolDown || "0sec",
        upvoteCoolDown: upvoteCoolDown || "0sec",
        mediumVoteThreshold: parseInt(mediumVoteThreshold, 10) || 3,
        hotVoteThreshold: parseInt(hotVoteThreshold, 10) || 10,
      });
      const data = response.data as {
        room: { roomId: string };
        admin: { adminId: string };
        session: { sessionToken: string; role: string };
      };
      setSession(
        data.admin.adminId,
        adminName.trim(),
        data.session.sessionToken,
        data.session.role === "admin",
        data.room.roomId
      );
      markSessionFresh();
      show("Room created! Redirecting...", "success");
      router.push(`/room/${data.room.roomId}`);
    } catch {
      show("Failed to create room. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <FormLayout
        title="Create a Room"
        subtitle="Set up your chat room and invite others with the room code."
        icon={<IconPlus className="h-6 w-6" />}
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
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Room details
            </p>
            <Input
              id="adminName"
              label="Your Name"
              placeholder="John Doe"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              error={errors.adminName}
              icon={<IconUser className="h-4 w-4" />}
            />
            <Input
              id="roomName"
              label="Room Name"
              placeholder="Team Standup"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              error={errors.roomName}
              icon={<IconHome className="h-4 w-4" />}
              hint="This is how your room will appear to everyone."
            />
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Vote thresholds
            </p>
            <Input
              id="mediumVoteThreshold"
              label="Trending threshold"
              type="number"
              min={1}
              value={mediumVoteThreshold}
              onChange={(e) => setMediumVoteThreshold(e.target.value)}
              error={errors.mediumVoteThreshold}
              hint="Messages with this many votes appear in Trending."
            />
            <Input
              id="hotVoteThreshold"
              label="Hot threshold"
              type="number"
              min={2}
              value={hotVoteThreshold}
              onChange={(e) => setHotVoteThreshold(e.target.value)}
              error={errors.hotVoteThreshold}
              hint="Must be higher than trending. Triggers admin alerts."
            />
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Cooldown settings
            </p>
            <Select
              id="chatCoolDown"
              label="Chat Cooldown"
              hint="How long users must wait between sending messages."
              options={COOLDOWN_OPTIONS}
              value={chatCoolDown}
              onChange={setChatCoolDown}
            />
            <Select
              id="upvoteCoolDown"
              label="Upvote Cooldown"
              hint="How long before a user can upvote the same message again."
              options={COOLDOWN_OPTIONS}
              value={upvoteCoolDown}
              onChange={setUpvoteCoolDown}
            />
          </div>

          <Button className="w-full" size="lg" loading={loading} onClick={handleSubmit}>
            <IconPlus className="h-5 w-5" />
            Create Room
          </Button>
        </Card>
      </FormLayout>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </AppShell>
  );
}
