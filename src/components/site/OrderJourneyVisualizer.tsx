import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Heart,
  CheckCircle2,
  DollarSign,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { formatBirr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type OrderStageKey =
  | "taken"
  | "chef"
  | "preparing"
  | "cooking"
  | "ready"
  | "delivered";

export interface OrderStage {
  id: OrderStageKey;
  label: string;
  tag: string;
  eta: string;
  color: string;
  glow: string;
}

export const ORDER_STAGES: OrderStage[] = [
  {
    id: "taken",
    label: "Order Taken",
    tag: "Verified",
    eta: "0 min",
    color: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.4)",
  },
  {
    id: "chef",
    label: "Arrived to Chef",
    tag: "In Kitchen",
    eta: "+3 mins",
    color: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.4)",
  },
  {
    id: "preparing",
    label: "Preparing",
    tag: "Prep Station",
    eta: "+8 mins",
    color: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.4)",
  },
  {
    id: "cooking",
    label: "Cooking",
    tag: "Wood-Fired & Grill",
    eta: "+15 mins",
    color: "#f97316",
    glow: "rgba(249, 115, 22, 0.45)",
  },
  {
    id: "ready",
    label: "Ready",
    tag: "At The Pass",
    eta: "+22 mins",
    color: "#eab308",
    glow: "rgba(234, 179, 8, 0.45)",
  },
  {
    id: "delivered",
    label: "Delivered",
    tag: "Table & Enjoy",
    eta: "Completed",
    color: "#22c55e",
    glow: "rgba(34, 197, 94, 0.45)",
  },
];

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
  const initialIndex = Math.max(
    0,
    ORDER_STAGES.findIndex((s) => s.id === currentStage)
  );

  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tipTarget, setTipTarget] = useState<"waiter" | "chef" | "both">("both");
  const [tipAmount, setTipAmount] = useState<number>(100);
  const [tipCustom, setTipCustom] = useState<string>("");
  const [tippedSuccess, setTippedSuccess] = useState<boolean>(false);

  // Synchronized ref for activeIndex inside the wheel event listener
  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const lastScrollTime = useRef<number>(0);
  const accumulatedDelta = useRef<number>(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll / Mouse Wheel driven stage switching
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const SCROLL_THRESHOLD = 45;
    const COOLDOWN_MS = 280;

    const handleWheel = (e: WheelEvent) => {
      // Ignore mostly horizontal scrolling gestures
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX) * 0.8) return;

      const currentIndex = activeIndexRef.current;
      const isAtEnd = currentIndex >= ORDER_STAGES.length - 1;
      const isAtStart = currentIndex <= 0;

      // When scrolling down at the final stage (cycle completed):
      // Allow native page scroll to pass through and continue down to the footer!
      if (e.deltaY > 0 && isAtEnd) {
        accumulatedDelta.current = 0;
        return;
      }

      // When scrolling up at the first stage:
      // Allow native page scroll to pass through and continue up towards the top!
      if (e.deltaY < 0 && isAtStart) {
        accumulatedDelta.current = 0;
        return;
      }

      // Intercept wheel scroll to step through stages in this place
      e.preventDefault();

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = setTimeout(() => {
        accumulatedDelta.current = 0;
      }, 220);

      const now = Date.now();
      if (now - lastScrollTime.current < COOLDOWN_MS) {
        return;
      }

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
  }, []);

  // Auto-simulation timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= ORDER_STAGES.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeStage: OrderStage = (ORDER_STAGES[activeIndex] ?? ORDER_STAGES[0])!;
  const progressPercent = (activeIndex / (ORDER_STAGES.length - 1)) * 100;

  const handleSendTip = () => {
    const finalAmount = tipCustom ? Number(tipCustom) : tipAmount;
    if (!finalAmount || finalAmount <= 0) {
      toast.error("Please select a tip amount");
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
    <div ref={containerRef} className="w-full space-y-10">
      {/* 1 — HUD Header: Order Number, Active Status & Simulation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/70 dark:border-white/10 bg-card/70 dark:bg-card/40 p-5 sm:p-6 backdrop-blur-xl shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
            <span className="size-2 rounded-full animate-ping" style={{ backgroundColor: activeStage.color }} />
            <span>Live Kitchen Pipeline</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-foreground font-mono font-bold">{orderNumber}</span>
          </div>

          <div className="mt-2 flex items-baseline gap-3">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {activeStage.label}
            </h2>
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Stage {activeIndex + 1} of {ORDER_STAGES.length}
            </span>
          </div>
        </div>

        {/* Quick Simulator Toolbar & Scroll Status Pill */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/40 px-3 py-1.5 text-[11px] font-medium text-muted-foreground select-none">
            {activeIndex >= ORDER_STAGES.length - 1 ? (
              <>
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Cycle complete
                </span>
                <span className="text-muted-foreground/60">· Scroll down to continue</span>
              </>
            ) : (
              <>
                <span className="size-1.5 rounded-full bg-accent animate-ping" />
                <span>Scroll over to switch stages</span>
              </>
            )}
          </span>

          {interactive && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer",
                  isPlaying
                    ? "bg-accent text-accent-foreground shadow-md ring-2 ring-accent/30"
                    : "border border-border/70 bg-secondary/70 hover:bg-secondary text-foreground"
                )}
              >
                {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
                <span>{isPlaying ? "Pause Flow" : "Simulate Flow"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveIndex(0);
                  setIsPlaying(false);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-secondary/50 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Reset to beginning"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2 — Animated Graphic Pipeline Track */}
      <div className="relative rounded-3xl border border-border/70 dark:border-white/10 bg-gradient-to-b from-card/90 via-card/50 to-card/20 p-6 sm:p-8 backdrop-blur-xl shadow-xl overflow-hidden">
        {/* Subtle Ambient Radial Glow of current stage */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full blur-3xl opacity-20 transition-all duration-700"
          style={{ backgroundColor: activeStage.color }}
        />

        {/* SVG Pipeline Track Connecting Line (Desktop) */}
        <div className="relative mb-6 hidden md:block">
          {/* Base Track */}
          <div className="h-2 w-full rounded-full bg-secondary/80 dark:bg-white/10 relative overflow-hidden">
            {/* Illuminated Active Track with glowing gradient */}
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, #3b82f6 0%, #8b5cf6 30%, #f97316 70%, ${activeStage.color} 100%)`,
                boxShadow: `0 0 16px ${activeStage.color}`,
              }}
            />
          </div>

          {/* Glowing Travelling Energy Pulse */}
          <div
            className="absolute -top-1.5 size-5 -translate-x-1/2 rounded-full border-2 border-white shadow-lg transition-all duration-700 ease-out flex items-center justify-center animate-pulse"
            style={{
              left: `${progressPercent}%`,
              backgroundColor: activeStage.color,
              boxShadow: `0 0 20px 4px ${activeStage.color}`,
            }}
          >
            <span className="size-1.5 rounded-full bg-white" />
          </div>
        </div>

        {/* Stage Nodes Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4 relative z-10">
          {ORDER_STAGES.map((st, idx) => {
            const isCurrent = idx === activeIndex;
            const isCompleted = idx < activeIndex;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "group relative flex flex-col items-center justify-between rounded-2xl p-4 sm:p-5 text-center transition-all duration-500 cursor-pointer text-left border select-none",
                  isCurrent
                    ? "border-accent ring-4 ring-accent/30 shadow-2xl scale-[1.04] bg-card/95 dark:bg-card/85"
                    : isCompleted
                    ? "border-primary/40 bg-card/60 dark:bg-card/30 hover:border-primary/70"
                    : "border-border/50 bg-secondary/30 dark:bg-secondary/15 opacity-60 hover:opacity-100 hover:border-border"
                )}
              >
                {/* Stage Index Badge */}
                <div className="flex w-full items-center justify-between mb-3">
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                      isCurrent
                        ? "bg-accent text-accent-foreground"
                        : isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">{st.eta}</span>
                </div>

                {/* Animated Graphic Artwork for Stage */}
                <div className="my-2 flex size-20 sm:size-24 items-center justify-center">
                  <StageGraphic stage={st.id} isActive={isCurrent} isDone={isCompleted} />
                </div>

                {/* Text Label */}
                <div className="mt-3 w-full">
                  <h3
                    className={cn(
                      "font-sans text-xs sm:text-sm font-semibold tracking-tight transition-colors line-clamp-1",
                      isCurrent ? "text-foreground font-bold" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {st.label}
                  </h3>
                  <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">{st.tag}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 — Large Graphic Focal Spotlight on Current Active Stage */}
      <div className="relative overflow-hidden rounded-3xl border border-border/70 dark:border-white/10 bg-card/80 dark:bg-card/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative flex size-28 sm:size-32 shrink-0 items-center justify-center rounded-2xl bg-secondary/50 dark:bg-white/[0.04] border border-border/50 p-4 shadow-inner">
            <StageGraphic stage={activeStage.id} isActive={true} isDone={false} size="large" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent">
                Active Process
              </span>
              <span className="text-xs text-muted-foreground">{activeStage.tag}</span>
            </div>
            <h3 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-foreground">
              {activeStage.label}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-md">
              {getStageDescription(activeStage.id)}
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/40 p-4 shrink-0">
          <div className="size-3 rounded-full animate-ping" style={{ backgroundColor: activeStage.color }} />
          <div>
            <p className="text-xs font-bold text-foreground">Kitchen ETA</p>
            <p className="text-xs text-muted-foreground font-mono">{activeStage.eta}</p>
          </div>
        </div>
      </div>

      {/* 4 — Tips for Waiters and Chef (Appreciation & Gratitude Station) */}
      <div className="relative overflow-hidden rounded-3xl border border-accent/40 bg-gradient-to-b from-accent/15 via-card/90 to-card p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
          <div className="flex items-center gap-3.5">
            <div className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-md">
              <Heart className="size-6 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Gratitude & Service
                </span>
                <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  Optional
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Tip for Waiters & Kitchen Chefs
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Reward our floor waitstaff and culinary brigade for exceptional hospitality.
              </p>
            </div>
          </div>

          {/* Choose Recipient Segment */}
          <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border/60 bg-secondary/60 p-1 shrink-0">
            {[
              { id: "waiter", label: "Waitstaff 🤵" },
              { id: "chef", label: "Chefs 👨‍🍳" },
              { id: "both", label: "Split 50/50 💖" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipTarget(t.id as "waiter" | "chef" | "both")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  tipTarget === t.id
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tip Amount Pickers */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[50, 100, 200, 500].map((amt) => {
              const isSel = tipAmount === amt && !tipCustom;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setTipAmount(amt);
                    setTipCustom("");
                  }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border",
                    isSel
                      ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                      : "border-border/70 bg-card/80 hover:bg-secondary text-foreground"
                  )}
                >
                  {formatBirr(amt)}
                </button>
              );
            })}

            {/* Custom Amount Input */}
            <div className="relative">
              <input
                type="number"
                min="10"
                placeholder="Custom ETB"
                value={tipCustom}
                onChange={(e) => setTipCustom(e.target.value)}
                className="h-9 w-28 rounded-xl border border-border/70 bg-card/80 px-3 text-xs placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none"
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
                : "bg-accent hover:bg-accent/90 text-accent-foreground hover:scale-[1.02] active:scale-[0.98]"
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

/**
 * Animated SVG Graphics for Each Stage
 */
function StageGraphic({
  stage,
  isActive,
  isDone,
  size = "normal",
}: {
  stage: OrderStageKey;
  isActive: boolean;
  isDone: boolean;
  size?: "normal" | "large";
}) {
  const iconSize = size === "large" ? 100 : 70;

  switch (stage) {
    case "taken":
      return (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 80 80"
          className={cn("transition-transform duration-500", isActive && "scale-110")}
        >
          {/* Pulse Signal Circles */}
          {isActive && (
            <circle cx="40" cy="40" r="34" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.4" className="animate-ping" />
          )}
          {/* Digital Terminal Base */}
          <rect x="22" y="34" width="36" height="28" rx="5" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
          <rect x="27" y="40" width="26" height="12" rx="3" fill="#3b82f6" opacity="0.25" />
          {/* Printed Receipt Ticket slipping up */}
          <path
            d="M28 34 L28 16 L34 19 L40 16 L46 19 L52 16 L52 34 Z"
            fill="#f8fafc"
            stroke="#94a3b8"
            strokeWidth="1.5"
            className={isActive ? "animate-bounce" : ""}
          />
          {/* Receipt text lines */}
          <line x1="32" y1="22" x2="48" y2="22" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="32" y1="26" x2="44" y2="26" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
          {/* Checkmark indicator */}
          <circle cx="54" cy="54" r="8" fill="#3b82f6" />
          <path d="M51 54 L53 56 L57 52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

    case "chef":
      return (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 80 80"
          className={cn("transition-transform duration-500", isActive && "scale-110")}
        >
          {/* Metallic Ticket Rail */}
          <rect x="14" y="16" width="52" height="6" rx="3" fill="#64748b" />
          {/* Hanging order slip */}
          <rect x="33" y="19" width="14" height="22" rx="2" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.5" />
          <line x1="36" y1="24" x2="44" y2="24" stroke="#8b5cf6" strokeWidth="1.2" />
          <line x1="36" y1="28" x2="42" y2="28" stroke="#8b5cf6" strokeWidth="1.2" />
          {/* Chef Toque Hat */}
          <g className={isActive ? "animate-pulse" : ""}>
            {/* Puffy Toque Crown */}
            <path
              d="M26 48 C20 44, 22 32, 32 34 C34 26, 46 26, 48 34 C58 32, 60 44, 54 48 Z"
              fill="#f1f5f9"
              stroke="#8b5cf6"
              strokeWidth="2"
            />
            {/* Chef Hat Band */}
            <rect x="25" y="47" width="30" height="11" rx="2" fill="#8b5cf6" />
            <line x1="28" y1="52" x2="52" y2="52" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          </g>
          {/* Gold Star */}
          <path d="M40 37 L41.5 41 L45.5 41 L42.5 43.5 L43.5 47.5 L40 45 L36.5 47.5 L37.5 43.5 L34.5 41 L38.5 41 Z" fill="#eab308" />
        </svg>
      );

    case "preparing":
      return (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 80 80"
          className={cn("transition-transform duration-500", isActive && "scale-110")}
        >
          {/* Wooden Prep Board */}
          <rect x="18" y="44" width="44" height="18" rx="4" fill="#78350f" stroke="#b45309" strokeWidth="1.5" />
          <rect x="21" y="47" width="38" height="12" rx="2" fill="#92400e" opacity="0.6" />
          {/* Sliced Ingredients on Board */}
          <circle cx="30" cy="53" r="3.5" fill="#ef4444" />
          <circle cx="37" cy="53" r="3" fill="#22c55e" />
          <circle cx="44" cy="53" r="3.5" fill="#eab308" />
          {/* Damascus Chef Knife angled */}
          <g
            style={{
              transformOrigin: "48px 42px",
              transform: isActive ? "rotate(-12deg)" : "rotate(0deg)",
              transition: "transform 0.4s ease-in-out",
            }}
          >
            {/* Handle */}
            <rect x="46" y="24" width="6" height="16" rx="2" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" transform="rotate(40 49 32)" />
            {/* Steel Blade */}
            <path
              d="M48 32 C38 34, 25 39, 22 43 L44 43 Z"
              fill="#e2e8f0"
              stroke="#06b6d4"
              strokeWidth="1.8"
            />
            {/* Cutting motion dash */}
            {isActive && (
              <line x1="28" y1="41" x2="38" y2="41" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="2 2" />
            )}
          </g>
          {/* Floating Herb Leaf */}
          <path d="M48 20 C54 18, 56 26, 48 28 C44 26, 44 20, 48 20 Z" fill="#22c55e" className={isActive ? "animate-bounce" : ""} />
        </svg>
      );

    case "cooking":
      return (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 80 80"
          className={cn("transition-transform duration-500", isActive && "scale-110")}
        >
          {/* Wood-Fired Brick Oven Dome */}
          <path
            d="M20 58 C20 32, 60 32, 60 58 Z"
            fill="#3f3f46"
            stroke="#f97316"
            strokeWidth="2"
          />
          {/* Oven Hearth Opening */}
          <path d="M28 58 C28 44, 52 44, 52 58 Z" fill="#18181b" />
          {/* Leaping Flames in Oven */}
          <g className={isActive ? "animate-pulse" : ""}>
            <path
              d="M32 58 C32 50, 36 46, 40 42 C44 46, 48 50, 48 58 Z"
              fill="#f97316"
              opacity="0.9"
            />
            <path
              d="M35 58 C35 52, 38 49, 40 45 C42 49, 45 52, 45 58 Z"
              fill="#fbbf24"
            />
            <path
              d="M38 58 C38 54, 39 52, 40 50 C41 52, 42 54, 42 58 Z"
              fill="#ffffff"
            />
          </g>
          {/* Rising Sparks / Embers */}
          {isActive && (
            <>
              <circle cx="34" cy="38" r="1.5" fill="#f97316" className="animate-ping" />
              <circle cx="46" cy="36" r="1.5" fill="#facc15" className="animate-ping" />
              <circle cx="40" cy="32" r="1.8" fill="#fb923c" className="animate-ping" />
            </>
          )}
          {/* Base oven stone ledge */}
          <rect x="16" y="58" width="48" height="5" rx="2" fill="#71717a" />
        </svg>
      );

    case "ready":
      return (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 80 80"
          className={cn("transition-transform duration-500", isActive && "scale-110")}
        >
          {/* Service Bell / Cloche Plate Base */}
          <ellipse cx="40" cy="58" rx="26" ry="6" fill="#64748b" stroke="#eab308" strokeWidth="1.5" />
          {/* Silver Cloche Dome */}
          <path
            d="M18 56 C18 36, 62 36, 62 56 Z"
            fill="#e2e8f0"
            stroke="#eab308"
            strokeWidth="2"
            style={{
              transformOrigin: "40px 56px",
              transform: isActive ? "translateY(-4px)" : "translateY(0)",
              transition: "transform 0.4s ease",
            }}
          />
          {/* Cloche Top Handle Knob */}
          <circle cx="40" cy="35" r="4" fill="#eab308" />
          {/* Specular Highlight Sheen on Cloche */}
          <path d="M26 52 C27 42, 34 39, 40 38" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
          {/* Sparkles of perfection */}
          {isActive && (
            <>
              <path d="M20 32 L22 36 L26 38 L22 40 L20 44 L18 40 L14 38 L18 36 Z" fill="#eab308" className="animate-spin" />
              <path d="M58 28 L59.5 31 L62.5 32.5 L59.5 34 L58 37 L56.5 34 L53.5 32.5 L56.5 31 Z" fill="#facc15" className="animate-pulse" />
            </>
          )}
        </svg>
      );

    case "delivered":
      return (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 80 80"
          className={cn("transition-transform duration-500", isActive && "scale-110")}
        >
          {/* Clinking Glass 1 */}
          <path
            d="M26 30 L36 30 L33 44 C33 48, 29 48, 29 44 Z"
            fill="#38bdf8"
            opacity="0.6"
            stroke="#22c55e"
            strokeWidth="1.8"
            transform="rotate(-15 31 37)"
          />
          <line x1="31" y1="46" x2="31" y2="58" stroke="#22c55e" strokeWidth="2" />
          <line x1="25" y1="58" x2="37" y2="58" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />

          {/* Clinking Glass 2 */}
          <path
            d="M44 30 L54 30 L51 44 C51 48, 47 48, 47 44 Z"
            fill="#fb7185"
            opacity="0.6"
            stroke="#22c55e"
            strokeWidth="1.8"
            transform="rotate(15 49 37)"
          />
          <line x1="49" y1="46" x2="49" y2="58" stroke="#22c55e" strokeWidth="2" />
          <line x1="43" y1="58" x2="55" y2="58" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />

          {/* Toast Clink Star in center */}
          <circle cx="40" cy="34" r="3" fill="#facc15" className="animate-ping" />
          <path d="M40 22 C43 20, 45 23, 40 27 C35 23, 37 20, 40 22 Z" fill="#ef4444" className={isActive ? "animate-bounce" : ""} />
        </svg>
      );
  }
}

function getStageDescription(stage: OrderStageKey): string {
  switch (stage) {
    case "taken":
      return "Order recorded and verified by our system. Payment method and order ticket queued.";
    case "chef":
      return "Order ticket arrived at the executive kitchen station. Head chef has assigned line cooks.";
    case "preparing":
      return "Mise en place in progress: fresh ingredients sliced, dough portioned, and herbs selected.";
    case "cooking":
      return "Wood-fired oven roasting at 450°C, prime cuts sizzling on grill, and pasta sauces simmering.";
    case "ready":
      return "Plating completed at the chef's pass, quality checked, and garnished with fresh herbs.";
    case "delivered":
      return "Dishes served to your table with warm Parisian bistro hospitality. Savor every bite!";
  }
}
