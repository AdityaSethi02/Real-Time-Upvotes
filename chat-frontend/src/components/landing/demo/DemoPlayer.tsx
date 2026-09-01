"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DemoLandingScene from "./scenes/DemoLandingScene";
import DemoCreateScene from "./scenes/DemoCreateScene";
import DemoJoinScene from "./scenes/DemoJoinScene";
import DemoChatScene from "./scenes/DemoChatScene";
import DeviceFrame from "./DeviceFrame";
import DemoStepPanel from "./DemoStepPanel";
import {
  initialDemoSceneState,
  type DemoDevice,
  type DemoSceneState,
} from "./demoData";
import {
  DEMO_STEPS,
  DEMO_STEP_COUNT,
  createDemoApi,
} from "./demoScript";

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

function DemoSceneView({ state }: { state: DemoSceneState }) {
  switch (state.scene) {
    case "landing":
      return <DemoLandingScene state={state} />;
    case "create":
      return <DemoCreateScene state={state} />;
    case "join":
      return <DemoJoinScene state={state} />;
    case "chat":
      return <DemoChatScene state={state} />;
    default:
      return null;
  }
}

interface DemoPlayerProps {
  onTryCreate?: () => void;
  onTryJoin?: () => void;
}

export default function DemoPlayer({ onTryCreate, onTryJoin }: DemoPlayerProps) {
  const reducedMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [sceneState, setSceneState] = useState<DemoSceneState>(initialDemoSceneState);

  const sceneStateRef = useRef(sceneState);
  sceneStateRef.current = sceneState;

  const stepIndexRef = useRef(stepIndex);
  stepIndexRef.current = stepIndex;

  const playingRef = useRef(playing);
  playingRef.current = playing;

  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterGenerationRef = useRef(0);
  const enterTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cooldownTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearEnterTimers = useCallback(() => {
    enterTimersRef.current.forEach(clearTimeout);
    enterTimersRef.current = [];
    cooldownTimersRef.current.forEach(clearTimeout);
    cooldownTimersRef.current = [];
    enterGenerationRef.current += 1;
  }, []);

  const clearAutoplayTimer = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const setState = useCallback(
    (patch: Partial<DemoSceneState> | ((s: DemoSceneState) => Partial<DemoSceneState>)) => {
      setSceneState((prev) => ({
        ...prev,
        ...(typeof patch === "function" ? patch(prev) : patch),
      }));
    },
    []
  );

  const getState = useCallback(() => sceneStateRef.current, []);

  const runStepEnter = useCallback(
    (index: number) => {
      clearEnterTimers();
      const gen = enterGenerationRef.current;
      const step = DEMO_STEPS[index];
      if (!step?.onEnter) return;

      const api = createDemoApi(setState, getState, cooldownTimersRef.current);

      const trackTimeout = (fn: () => void, ms: number) => {
        const id = setTimeout(() => {
          if (enterGenerationRef.current !== gen) return;
          fn();
        }, ms);
        enterTimersRef.current.push(id);
      };

      const wrappedApi = {
        ...api,
        delay: (ms: number) =>
          new Promise<void>((resolve) => trackTimeout(() => resolve(), ms)),
        async typeText(text: string, charMs = 45) {
          for (let i = 1; i <= text.length; i++) {
            const charIndex = i;
            await new Promise<void>((resolve) =>
              trackTimeout(() => {
                setState({ typedText: text.slice(0, charIndex) });
                resolve();
              }, charMs)
            );
          }
        },
        startCooldown(chatId: string, seconds: number) {
          api.startCooldown(chatId, seconds);
        },
        startChatCooldown(seconds: number) {
          api.startChatCooldown(seconds);
        },
      };

      const result = step.onEnter(wrappedApi);
      if (result && typeof (result as Promise<void>).then === "function") {
        void (result as Promise<void>);
      }
    },
    [clearEnterTimers, getState, setState]
  );

  const scheduleAutoplay = useCallback(
    (index: number) => {
      clearAutoplayTimer();
      if (!playingRef.current || reducedMotion) return;

      const duration = DEMO_STEPS[index]?.durationMs ?? 3000;
      autoplayTimerRef.current = setTimeout(() => {
        if (!playingRef.current) return;
        const next = Math.min(index + 1, DEMO_STEP_COUNT - 1);
        if (next === index) {
          setPlaying(false);
          return;
        }
        setSceneState({
          ...initialDemoSceneState,
          device: sceneStateRef.current.device,
          scene: DEMO_STEPS[next].scene,
        });
        setStepIndex(next);
      }, duration);
    },
    [clearAutoplayTimer, reducedMotion]
  );

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, DEMO_STEP_COUNT - 1));
      clearAutoplayTimer();
      clearEnterTimers();
      setSceneState({
        ...initialDemoSceneState,
        device: sceneStateRef.current.device,
        scene: DEMO_STEPS[clamped].scene,
      });
      setStepIndex(clamped);
    },
    [clearAutoplayTimer, clearEnterTimers]
  );

  useEffect(() => {
    runStepEnter(stepIndex);
    scheduleAutoplay(stepIndex);
  }, [stepIndex, runStepEnter, scheduleAutoplay]);

  useEffect(() => {
    if (playing && !reducedMotion) {
      scheduleAutoplay(stepIndexRef.current);
    } else {
      clearAutoplayTimer();
    }
  }, [playing, reducedMotion, scheduleAutoplay, clearAutoplayTimer]);

  useEffect(() => {
    return () => {
      clearAutoplayTimer();
      clearEnterTimers();
    };
  }, [clearAutoplayTimer, clearEnterTimers]);

  useEffect(() => {
    if (reducedMotion) setPlaying(false);
  }, [reducedMotion]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToStep(stepIndexRef.current - 1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToStep(stepIndexRef.current + 1);
      }
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToStep]);

  const handleDeviceChange = (device: DemoDevice) => {
    setState({ device });
  };

  const currentStep = DEMO_STEPS[stepIndex];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex-1 min-w-0">
        <DeviceFrame
          device={sceneState.device}
          onDeviceChange={handleDeviceChange}
          showCursor={sceneState.showCursor}
          cursorTarget={sceneState.cursorTarget}
        >
          <DemoSceneView state={sceneState} />
        </DeviceFrame>
      </div>

      <div className="lg:w-80 shrink-0">
        <DemoStepPanel
          stepIndex={stepIndex}
          stepCount={DEMO_STEP_COUNT}
          title={currentStep.title}
          description={currentStep.description}
          playing={playing && !reducedMotion}
          reducedMotion={reducedMotion}
          onPrev={() => goToStep(stepIndex - 1)}
          onNext={() => goToStep(stepIndex + 1)}
          onTogglePlay={() => setPlaying((p) => !p)}
          onGoToStep={goToStep}
        />

        <div className="mt-6 flex flex-col gap-2 sm:flex-row lg:flex-col">
          {onTryCreate && (
            <button
              type="button"
              onClick={onTryCreate}
              className="flex-1 rounded-xl border border-border bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Try it — Create Room
            </button>
          )}
          {onTryJoin && (
            <button
              type="button"
              onClick={onTryJoin}
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
            >
              Try it — Join Room
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function resetDemoPlayerState(): DemoSceneState {
  return { ...initialDemoSceneState };
}
