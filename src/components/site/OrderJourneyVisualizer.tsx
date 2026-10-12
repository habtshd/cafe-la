import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Heart,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Video,
  Layers,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatBirr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import stage1Img from "@/assets/order-journey/stage1-order-taken.png";
import stage2Img from "@/assets/order-journey/stage2-arrived-chef.png";
import stage3Img from "@/assets/order-journey/stage3-preparing.png";
import stage4Img from "@/assets/order-journey/stage4-ready.png";

export type OrderStageKey =
  | "taken"
  | "chef"
  | "preparing"
  | "cooking"
  | "ready"
  | "delivered";

export interface OrderStage {
  id: OrderStageKey;
  stepNum: number;
  label: string;
  tag: string;
  eta: string;
  color: string;
  glow: string;
  image: string;
  description: string;
}

export const ORDER_STAGES: OrderStage[] = [
  {
    id: "taken",
    stepNum: 1,
    label: "Order Taken",
    tag: "Verified",
    eta: "0 min",
    color: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.4)",
    image: stage1Img,
    description: "Order verified and transmitted to kitchen display systems.",
  },
  {
    id: "chef",
    stepNum: 2,
    label: "Arrived to Chef",
    tag: "In Kitchen",
    eta: "+3 mins",
    color: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.4)",
    image: stage2Img,
    description: "Head chef acknowledged ticket and designated culinary stations.",
  },
  {
    id: "preparing",
    stepNum: 3,
    label: "Preparing",
    tag: "Prep Station",
    eta: "+8 mins",
    color: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.45)",
    image: stage3Img,
    description: "Artisan prep, searing, sautéing, and fire-cooking in motion.",
  },
  {
    id: "ready",
    stepNum: 4,
    label: "Ready",
    tag: "At The Pass",
    eta: "+22 mins",
    color: "#eab308",
    glow: "rgba(234, 179, 8, 0.45)",
    image: stage4Img,
    description: "Plated to perfection at the chef pass, garnished, and ready to serve.",
  },
];

// Helper to map 6 legacy stage keys into 4 illustrated video stages
function mapKeyToIllustratedIndex(key?: OrderStageKey): number {
  switch (key) {
    case "taken":
      return 0;
    case "chef":
      return 1;
    case "preparing":
    case "cooking":
      return 2;
    case "ready":
    case "delivered":
      return 3;
    default:
      return 2;
  }
}

export function OrderJourneyVisualizer({
  currentStage = "cooking",
  orderNumber = "LN-784210",
  interactive = true,
}: {
  currentStage?: OrderStageKey;
  orderNumber?: string;
  interactive?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialIndex = mapKeyToIllustratedIndex(currentStage);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<"interactive" | "video">("interactive");
  const [videoMuted, setVideoMuted] = useState(true);

  // Tip & Gratitude State
  const [tipTarget, setTipTarget] = useState<"waiter" | "chef" | "both">("both");
  const [tipAmount, setTipAmount] = useState<number>(100);
  const [tipCustom, setTipCustom] = useState<string>("");
  const [tippedSuccess, setTippedSuccess] = useState<boolean>(false);

  // Synchronized ref for activeIndex inside the wheel listener
  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const lastScrollTime = useRef<number>(0);
  const accumulatedDelta = useRef<number>(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mouse wheel step navigation (scroll gesture steps through stages)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !interactive || viewMode === "video") return;

    const SCROLL_THRESHOLD = 45;
    const COOLDOWN_MS = 280;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX) * 0.8) return;

      const currentIndex = activeIndexRef.current;
      const isAtEnd = currentIndex >= ORDER_STAGES.length - 1;
      const isAtStart = currentIndex <= 0;

      // Allow natural scroll to pass through at edges
      if (e.deltaY > 0 && isAtEnd) {
        accumulatedDelta.current = 0;
        return;
      }
      if (e.deltaY < 0 && isAtStart) {
        accumulatedDelta.current = 0;
        return;
      }

      e.preventDefault();

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = setTimeout(() => {
        accumulatedDelta.current = 0;
      }, 220);

      const now = Date.now();
      if (now - lastScrollTime.current < COOLDOWN_MS) return;

      accumulatedDelta.current += e.deltaY;

      if (accumulatedDelta.current >= SCROLL_THRESHOLD) {
        lastScrollTime.current = now;
        accumulatedDelta.current = 0;
        setActiveIndex((prev) => Math.min(ORDER_STAGES.length - 1, prev + 1));
        setIsPlaying(false);
      } else if (accumulatedDelta.current <= -SCROLL_THRESHOLD) {
        lastScrollTime.current = now;
        accumulatedDelta.current = 0;
        setActiveIndex((prev) => Math.max(0, prev - 1));
        setIsPlaying(false);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, [interactive, viewMode]);

  // Auto-simulation timer (smoothly steps like the video)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= ORDER_STAGES.length - 1) {
          return 0; // Loop seamlessly
        }
        return prev + 1;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeStage: OrderStage = (ORDER_STAGES[activeIndex] ?? ORDER_STAGES[0])!;
  const progressPercent = (activeIndex / (ORDER_STAGES.length - 1)) * 100;

  const handleSendTip = () => {
    const finalAmount = tipCustom ? Number(tipCustom) : tipAmount;
    if (!finalAmount || finalAmount <= 0) {
      toast.error("Please enter or select a valid tip amount");
      return;
    }

    setTippedSuccess(true);
    const targetLabel =
      tipTarget === "both"
        ? "waitstaff and culinary kitchen team"
        : tipTarget === "chef"
        ? "chef & kitchen brigade"
        : "waiter & floor service";

    toast.success(`Thank you! ${formatBirr(finalAmount)} tip sent for the ${targetLabel}! 🎉`, {
      description: "Your generosity has been delivered to the team.",
    });
  };

  return (
    <div ref={containerRef} className="w-full space-y-8 select-none">
      {/* 1 — HUD Header: Order Status, Stage Name & Video/Simulation Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-[#161a24]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
            <span
              className="size-2 rounded-full animate-ping"
              style={{ backgroundColor: activeStage.color }}
            />
            <span>Live Kitchen Journey</span>
            <span className="text-white/30">·</span>
            <span className="text-amber-400 font-mono font-bold tracking-wider">{orderNumber}</span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-3">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {activeStage.label}
            </h2>
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-400/90">
              Stage {activeStage.stepNum} of {ORDER_STAGES.length}
            </span>
          </div>
        </div>

        {/* View Mode Switcher & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle: Interactive vs Video */}
          <div className="inline-flex rounded-full bg-black/40 p-1">
            <button
              type="button"
              onClick={() => {
                setViewMode("interactive");
                setIsPlaying(false);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                viewMode === "interactive"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-white/70 hover:text-white"
              )}
            >
              <Layers className="size-3.5" />
              <span>Interactive</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("video");
                setIsPlaying(false);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                viewMode === "video"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-white/70 hover:text-white"
              )}
            >
              <Video className="size-3.5" />
              <span>Watch Video</span>
            </button>
          </div>

          {/* Interactive Simulation Controls */}
          {viewMode === "interactive" && interactive && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeIndex === 0}
                className="size-8 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer"
                title="Previous stage"
              >
                <ChevronLeft className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/25 transition-all cursor-pointer"
                title={isPlaying ? "Pause journey" : "Auto-play journey"}
              >
                {isPlaying ? <Pause className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current" />}
                <span>{isPlaying ? "Pause" : "Auto Play"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveIndex((prev) => Math.min(ORDER_STAGES.length - 1, prev + 1))}
                disabled={activeIndex === ORDER_STAGES.length - 1}
                className="size-8 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer"
                title="Next stage"
              >
                <ChevronRight className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveIndex(0);
                  setIsPlaying(false);
                }}
                className="size-8 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                title="Reset to Stage 1"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2 — MAIN STAGE CONTAINER */}
      {viewMode === "video" ? (
        /* Video Mode: Authentic playback of gemini_generated_video_4811ceeb.mp4 */
        <div className="relative overflow-hidden rounded-3xl bg-black shadow-2xl p-4 sm:p-6 flex flex-col items-center">
          <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-[#0f1218] aspect-video">
            <video
              src="/gemini_generated_video_4811ceeb.mp4"
              autoPlay
              loop
              playsInline
              muted={videoMuted}
              className="size-full object-contain"
            />
            {/* Ambient Sound Toggle Button */}
            <button
              type="button"
              onClick={() => setVideoMuted(!videoMuted)}
              className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-md hover:bg-black/90 transition-colors cursor-pointer"
            >
              {videoMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5 text-amber-400" />}
              <span>{videoMuted ? "Unmute" : "Muted"}</span>
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between w-full max-w-4xl px-2">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-semibold text-white/90">Authentic Kitchen Animation Video</span>
            </div>
            <button
              type="button"
              onClick={() => setViewMode("interactive")}
              className="text-xs text-amber-400 hover:underline cursor-pointer"
            >
              Switch to Interactive Pipeline →
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Mode: The exact 4 Illustrated Cards with Live Video-Matched Animations */
        <div className="relative rounded-3xl bg-[#12151d] p-5 sm:p-7 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Ambient Radial Backlight Glow of current active stage */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[550px] rounded-full blur-[140px] opacity-25 transition-all duration-700"
            style={{ backgroundColor: activeStage.color }}
          />

          {/* TOP CONNECTING PROGRESS TIMELINE (Identical to video 00:01 - 00:08) */}
          <div className="relative mb-8 sm:mb-10 px-2 sm:px-6">
            {/* Background Rail */}
            <div className="h-1.5 sm:h-2 w-full rounded-full bg-[#242b38] relative overflow-visible">
              {/* Active Golden Progress Rail */}
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  background: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)",
                  boxShadow: "0 0 16px rgba(245, 158, 11, 0.75)",
                }}
              />

              {/* Glowing Travelling Comet Particle Head */}
              <div
                className="absolute top-1/2 size-4 sm:size-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white transition-all duration-700 ease-out flex items-center justify-center animate-comet z-30"
                style={{
                  left: `${progressPercent}%`,
                  backgroundColor: "#f59e0b",
                  boxShadow: "0 0 24px 6px rgba(245, 158, 11, 0.95), 0 0 45px rgba(251, 191, 36, 0.6)",
                }}
              >
                <span className="size-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            {/* Timeline Stage Indicator Dots */}
            <div className="absolute inset-x-2 sm:inset-x-6 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
              {ORDER_STAGES.map((st, idx) => {
                const isCompleted = idx < activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      "pointer-events-auto flex size-7 sm:size-8 items-center justify-center rounded-full font-bold text-xs sm:text-sm transition-all duration-500 cursor-pointer shadow-lg",
                      isCurrent
                        ? "bg-[#f59e0b] text-black ring-4 ring-amber-400/40 scale-125 font-black z-20 shadow-[0_0_20px_rgba(245,158,11,0.8)]"
                        : isCompleted
                        ? "bg-[#fbbf24] text-black scale-100 z-10"
                        : "bg-[#1f2533] text-white/50 scale-90"
                    )}
                    aria-label={`Jump to stage ${st.stepNum}: ${st.label}`}
                  >
                    {isCompleted ? "✓" : st.stepNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* THE 4 ILLUSTRATED JOURNEY CARDS (Matching the Video's Layout & Visual Art) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 relative z-10">
            {ORDER_STAGES.map((st, idx) => {
              const isCurrent = idx === activeIndex;
              const isCompleted = idx < activeIndex;

              return (
                <div
                  key={st.id}
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    "group relative flex flex-col justify-between overflow-hidden rounded-[26px] p-2.5 transition-all duration-500 cursor-pointer select-none",
                    isCurrent
                      ? "bg-[#1a1f2c] scale-[1.03] z-20 shadow-[0_0_35px_rgba(245,158,11,0.45)]"
                      : isCompleted
                      ? "bg-[#161a23]/90 opacity-85 hover:opacity-100"
                      : "bg-[#141720]/70 opacity-60 hover:opacity-95"
                  )}
                >
                  {/* Active Card Ambient Backlight Sheen */}
                  {isCurrent && (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-500/15 via-transparent to-amber-500/5 rounded-[24px]" />
                  )}

                  {/* Artwork Stage Frame with Image and Dynamic Animated Overlays */}
                  <div className="relative w-full aspect-square rounded-[20px] overflow-hidden bg-[#161922] shadow-inner">
                    {/* The Full High-Resolution Illustrated Card Image */}
                    <img
                      src={st.image}
                      alt={st.label}
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="eager"
                      draggable={false}
                    />

                    {/* DYNAMIC ANIMATION OVERLAYS (MATCHING THE VIDEO ACTIONS) */}

                    {/* Stage 1: Order Taken -> Radar waves & spark rays behind phone */}
                    {st.id === "taken" && isCurrent && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="absolute size-24 rounded-full border border-emerald-400/60 animate-radar-wave-1" />
                        <div className="absolute size-28 rounded-full border border-amber-400/50 animate-radar-wave-2" />
                      </div>
                    )}

                    {/* Stage 2: Arrived to Chef -> Sizzling pan & billowing steam plumes */}
                    {st.id === "chef" && isCurrent && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        {/* Steam Puff 1 */}
                        <div className="absolute right-[28%] top-[38%] size-8 rounded-full bg-white/40 blur-sm animate-steam-1" />
                        {/* Steam Puff 2 */}
                        <div className="absolute right-[22%] top-[32%] size-10 rounded-full bg-white/45 blur-md animate-steam-2" />
                        {/* Steam Puff 3 */}
                        <div className="absolute right-[32%] top-[40%] size-7 rounded-full bg-white/35 blur-sm animate-steam-3" />
                        {/* Sizzling spark specks */}
                        <div className="absolute right-[25%] top-[42%] size-1.5 rounded-full bg-amber-400 animate-ping" />
                      </div>
                    )}

                    {/* Stage 3: Preparing -> Drifting herbs fluttering down into the bowl */}
                    {st.id === "preparing" && isCurrent && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        {/* Falling Herb Flake 1 */}
                        <div className="absolute left-[46%] top-[38%] size-2 rounded-full bg-emerald-400 animate-herb-1" />
                        {/* Falling Herb Flake 2 */}
                        <div className="absolute left-[52%] top-[36%] size-1.5 rounded-full bg-emerald-500 animate-herb-2" />
                        {/* Falling Herb Flake 3 */}
                        <div className="absolute left-[49%] top-[40%] size-2 rounded-full bg-emerald-300 animate-herb-3" />
                      </div>
                    )}

                    {/* Stage 4: Ready At The Pass -> Radiant Rotating Sunburst Beams & Cloche Steam */}
                    {st.id === "ready" && isCurrent && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center">
                        {/* Rotating 360 Sunburst Light Beams */}
                        <svg
                          viewBox="0 0 200 200"
                          className="absolute size-[220%] animate-sunburst-spin opacity-55"
                          style={{ top: "45%", left: "50%" }}
                        >
                          {Array.from({ length: 16 }, (_, i) => (
                            <line
                              key={i}
                              x1="100"
                              y1="100"
                              x2={100 + Math.cos((i * 22.5 * Math.PI) / 180) * 100}
                              y2={100 + Math.sin((i * 22.5 * Math.PI) / 180) * 100}
                              stroke="#fbbf24"
                              strokeWidth="4"
                              strokeLinecap="round"
                              opacity={i % 2 === 0 ? "0.8" : "0.4"}
                            />
                          ))}
                        </svg>

                        {/* Cloche Knob Steam Clouds */}
                        <div className="absolute left-1/2 top-[24%] -translate-x-1/2 size-7 rounded-full bg-white/50 blur-sm animate-steam-1" />
                        <div className="absolute left-[48%] top-[20%] size-9 rounded-full bg-white/40 blur-md animate-steam-2" />
                      </div>
                    )}

                    {/* DYNAMIC BADGE OVERLAY (Synchronized Status) */}
                    <div className="absolute top-2.5 left-2.5 z-20">
                      <div
                        className={cn(
                          "size-7 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all duration-300",
                          isCurrent
                            ? "bg-[#f59e0b] text-black ring-2 ring-white/60 animate-pulse font-black"
                            : isCompleted
                            ? "bg-[#fbbf24] text-black font-bold"
                            : "bg-black/60 backdrop-blur-md text-white/60"
                        )}
                      >
                        {isCompleted ? "✓" : st.stepNum}
                      </div>
                    </div>

                    {/* DYNAMIC ETA PILL OVERLAY */}
                    <div className="absolute top-2.5 right-2.5 z-20">
                      <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-mono font-bold text-white/80">
                        {st.eta}
                      </span>
                    </div>
                  </div>

                  {/* Stage Bottom Summary */}
                  <div className="p-3 w-full">
                    <div className="flex items-center justify-between">
                      <h3
                        className={cn(
                          "font-display text-base font-bold tracking-tight transition-colors",
                          isCurrent ? "text-amber-400" : "text-white"
                        )}
                      >
                        {st.label}
                      </h3>
                      <span className="text-[11px] font-medium text-white/40">{st.tag}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/60 line-clamp-1">{st.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACTIVE STAGE SPOTLIGHT BAR */}
          <div className="mt-8 rounded-2xl bg-white/[0.03] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 uppercase tracking-wider">
                Current Status
              </span>
              <p className="text-sm text-white/80 font-medium">
                <strong className="text-white font-bold">{activeStage.label}:</strong>{" "}
                {activeStage.description}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 shrink-0">
              <span>Expected:</span>
              <strong className="rounded-md bg-amber-500/15 px-2 py-0.5">
                {activeStage.eta}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* 3 — TIPS FOR WAITERS & KITCHEN CHEF (Gratitude Station) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-amber-500/10 via-[#181c26] to-[#12151d] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="grid size-12 place-items-center rounded-2xl bg-amber-500 text-black shadow-lg">
              <Heart className="size-6 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Gratitude & Hospitality
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                  Optional
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                Tip for Waiters & Kitchen Chefs
              </h3>
              <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                Reward our floor waitstaff and culinary brigade for exceptional dining care.
              </p>
            </div>
          </div>

          {/* Choose Recipient Segment */}
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-black/40 p-1 shrink-0">
            {(
              [
                { id: "both", label: "Team & Both" },
                { id: "chef", label: "Kitchen Chef" },
                { id: "waiter", label: "Floor Waiter" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipTarget(t.id)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                  tipTarget === t.id
                    ? "bg-amber-500 text-black shadow-sm font-bold"
                    : "text-white/60 hover:text-white"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Selector */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2 flex-wrap">
            {[50, 100, 200, 500].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setTipAmount(amt);
                  setTipCustom("");
                }}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                  tipAmount === amt && !tipCustom
                    ? "bg-amber-500/25 text-amber-300 shadow-sm"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                {amt} ETB
              </button>
            ))}

            <div className="relative">
              <input
                type="number"
                min="10"
                placeholder="Custom ETB"
                value={tipCustom}
                onChange={(e) => setTipCustom(e.target.value)}
                className="h-9 w-28 rounded-xl bg-white/5 px-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Send Tip Button */}
          <button
            type="button"
            onClick={handleSendTip}
            disabled={tippedSuccess}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg transition-all duration-300 cursor-pointer",
              tippedSuccess
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-amber-500 hover:bg-amber-400 text-black hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {tippedSuccess ? (
              <>
                <CheckCircle2 className="size-4" />
                <span>Tip Sent! Thank you!</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                <span>Send {formatBirr(tipCustom ? Number(tipCustom) : tipAmount)} Tip</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
