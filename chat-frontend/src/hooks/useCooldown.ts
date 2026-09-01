"use client";

import { useEffect, useState } from "react";

export function useCooldown(duration: number) {
  const [active, setActive] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [tick, setTick] = useState(0);

  const start = (overrideDuration?: number) => {
    const effective = overrideDuration ?? duration;
    if (effective <= 0) return;
    setActive(true);
    setRemaining(effective);
    setTick((t) => t + 1);
  };

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setRemaining((time) => {
        if (time <= 1) {
          setActive(false);
          return 0;
        }
        return time - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active, tick]);

  return { active, remaining, start };
}

export function useCooldownMap() {
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  const start = (id: string, duration: number) => {
    if (duration <= 0) return;
    setCooldowns((prev) => ({ ...prev, [id]: duration }));
  };

  const isActive = (id: string) => !!cooldowns[id];
  const getRemaining = (id: string) => cooldowns[id] ?? 0;

  const activeCount = Object.keys(cooldowns).length;

  useEffect(() => {
    if (activeCount === 0) return;

    const interval = setInterval(() => {
      setCooldowns((prev) => {
        if (Object.keys(prev).length === 0) return prev;
        const updated = { ...prev };
        let changed = false;
        Object.keys(updated).forEach((id) => {
          if (updated[id] <= 1) {
            delete updated[id];
            changed = true;
          } else {
            updated[id] -= 1;
            changed = true;
          }
        });
        return changed ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCount]);

  return { cooldowns, start, isActive, getRemaining };
}
