"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconLogIn, IconPlus } from "@/lib/icons";
import Button from "@/components/Button";
import FeatureCards from "./FeatureCards";
import DemoModal from "@/components/landing/demo/DemoModal";

export default function Hero() {
  const router = useRouter();
  const [loading, setLoading] = useState<"create" | "join" | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  const navigate = (path: string, key: "create" | "join") => {
    setLoading(key);
    router.push(path);
    setTimeout(() => setLoading(null), 3000);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-16 sm:py-24">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        Real-time · WebSocket powered
      </div>

      <h1 className="mb-4 text-center text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
        Chat that{" "}
        <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
          ranks itself
        </span>
      </h1>

      <p className="mb-10 max-w-2xl text-center text-lg text-muted">
        A real-time chatroom where the community decides what matters.
        Upvote messages you love — the best ones rise to the top.
      </p>

      <div className="mb-16 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          loading={loading === "create"}
          onClick={() => navigate("/admin/create", "create")}
        >
          <IconPlus className="h-5 w-5" />
          Create Room
        </Button>
        <Button
          variant="secondary"
          size="lg"
          loading={loading === "join"}
          onClick={() => navigate("/user/join", "join")}
        >
          <IconLogIn className="h-5 w-5" />
          Join Room
        </Button>
      </div>

      <div className="w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted">How it works</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <FeatureCards />
      </div>

      <div className="mt-12 flex flex-col items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setDemoOpen(true)}>
          See Demo
        </Button>
        <span className="text-sm text-muted">Built with FastAPI + Next.js</span>
      </div>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
