"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import DemoModal from "@/components/landing/demo/DemoModal";

export default function HomeContent() {
  const [demoOpen, setDemoOpen] = useState(false);

  const openDemo = () => setDemoOpen(true);

  return (
    <AppShell onSeeDemo={openDemo}>
      <Hero onSeeDemo={openDemo} />
      <Footer />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </AppShell>
  );
}
