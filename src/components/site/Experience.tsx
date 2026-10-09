import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo, useCallback, type PointerEvent as RPointerEvent } from "react";
import { UtensilsCrossed, Printer, Play, Pause, Plus, Check, Sparkles, Clock, Globe, ChevronLeft, ChevronRight, ChefHat } from "lucide-react";

// ONLY use photos from C:\Users\habts\Downloads\cafe-la\src\assets
import filetMignonImg from "@/assets/pngtree-filet-mignon-with-red-wine-sauce-png-image_13146442.png";
import fettuccineImg from "@/assets/Creamy Salmon Fettuccine on a Ridged Plate.png";
import grilledSalmonImg from "@/assets/Grilled Salmon.png";
import nilePerchImg from "@/assets/Nile Perch.png";
import diavolaPizzaImg from "@/assets/Diavola-1.png";
import salmonPizzaImg from "@/assets/pngtree-pizza-with-salmon-and-mozzarella-on-the-table-transparent-background-png-image_13756108.png";
import clubSandwichImg from "@/assets/club-sandwich-with-ham-cheese-tomato-on-transparent-background-free-png.webp";
import gardenSaladImg from "@/assets/a-garden-salad-served-in-a-bowl-isolated-against-a-transparent-background-for-crisp-presentation-free-png.webp";
import pizzaSliceImg from "@/assets/delicious-pizza-slice-with-melting-cheese-pepperoni-olives-png.webp";
import layer2Img from "@/assets/Layer 2.png";
import gourmetBurgerImg from "@/assets/4268e9b9d767c719f9a81dbe217bbd7f.png";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatBirr } from "@/lib/format";
import { SIGNATURE_FOODS, type SignatureFood } from "@/lib/signature-foods";
import type { PublicMenuItem, Settings } from "@/lib/cafe.functions";
import { toast } from "sonner";
import { ModernLightSwitch } from "./ModernLightSwitch";
import headerBg from "@/assets/unnamed.webp";

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => setR(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return r;
}

export function DiningIntro() {
  return null;
}

// Backward-compatible alias
export const PourIntro = DiningIntro;

/* 2 — 3D Lit Studio Turntable orbiting dishes from src/assets */
export function Studio({ name }: { name: string }) {
  const [angle, setAngle] = useState(0);
  const drag = useRef<{ x: number; a: number; lastX: number; vx: number } | null>(null);
  const reduced = useReducedMotion();
  const cart = useCart();

  const studioItems = useMemo(
    () => [
      {
        id: "f4444444-4444-4444-a444-444444444444",
        src: filetMignonImg,
        name: "Filet Mignon with Red Wine Demi-Glace",
        tag: "French Haute Cuisine",
        price: 1480,
        at: 0,
        scale: "h-44 sm:h-60",
        alt: "Prime Filet Mignon with red wine sauce",
      },
      {
        id: "f1111111-1111-4111-a111-111111111111",
        src: diavolaPizzaImg,
        name: "Pizza Diavola Napoletana",
        tag: "Wood-Fired Pizza",
        price: 720,
        at: 60,
        scale: "h-44 sm:h-60",
        alt: "Artisan Pizza Diavola",
      },
      {
        id: "f5555555-5555-4555-a555-555555555555",
        src: grilledSalmonImg,
        name: "Pan-Seared Norwegian Salmon",
        tag: "Nordic Coastal",
        price: 1250,
        at: 120,
        scale: "h-40 sm:h-56",
        alt: "Grilled Salmon fillet",
      },
      {
        id: "f6666666-6666-4666-a666-666666666666",
        src: fettuccineImg,
        name: "Creamy Salmon Fettuccine",
        tag: "Artisan Pasta",
        price: 890,
        at: 180,
        scale: "h-44 sm:h-60",
        alt: "Creamy Salmon Fettuccine on a Ridged Plate",
      },
      {
        id: "f2222222-2222-4222-a222-222222222222",
        src: clubSandwichImg,
        name: "Triple-Decker Club Sandwich",
        tag: "International Bistro",
        price: 460,
        at: 240,
        scale: "h-44 sm:h-60",
        alt: "Club sandwich with ham, cheese, tomato",
      },
      {
        id: "f7777777-7777-4777-a777-777777777777",
        src: nilePerchImg,
        name: "Pan-Seared Nile Perch Fillet",
        tag: "Regional Specialty",
        price: 950,
        at: 300,
        scale: "h-40 sm:h-56",
        alt: "Pan-seared Nile perch fillet",
      },
    ],
    []
  );

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = () => {
      if (!drag.current) {
        setAngle((a) => (a + 0.18) % 360);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const down = (e: RPointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, a: angle, lastX: e.clientX, vx: 0 };
  };

  const move = (e: RPointerEvent) => {
    if (!drag.current) return;
    const delta = (e.clientX - drag.current.x) * 0.45;
    drag.current.vx = e.clientX - drag.current.lastX;
    drag.current.lastX = e.clientX;
    setAngle(drag.current.a + delta);
  };

  const up = () => {
    drag.current = null;
  };

  const activeFrontItem = useMemo(() => {
    let best = studioItems[0]!;
    let minDiff = 999;
    studioItems.forEach((item) => {
      let currentItemAngle = (angle + item.at) % 360;
      if (currentItemAngle < 0) currentItemAngle += 360;
      const diff = Math.min(currentItemAngle, 360 - currentItemAngle);
      if (diff < minDiff) {
        minDiff = diff;
        best = item;
      }
    });
    return best;
  }, [angle, studioItems]);

  const handleAddFrontItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    cart.add({
      itemId: activeFrontItem.id,
      name: activeFrontItem.name,
      price: activeFrontItem.price,
      quantity: 1,
      imageUrl: activeFrontItem.src,
    });
    toast.success(`Added ${activeFrontItem.name} to cart`);
  };

  return (
    <section className="relative isolate overflow-hidden bg-background text-foreground transition-colors duration-500">
      {/* Blurred background image for header area with adaptive overlay */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center transition-opacity duration-500"
        style={{ backgroundImage: `url(${headerBg})`, filter: 'blur(8px)', opacity: 0.45 }}
      />
      {/* Dual-mode scrim: soft warm alabaster silk in light mode, deep moody graphite in dark mode */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/90 via-background/70 to-background/95 dark:from-black/70 dark:via-[#282828]/55 dark:to-[#282828]/95" />
      <div className="exp-spotlight absolute inset-0 -z-10" />

      <div className="mx-auto grid min-h-[94vh] max-w-6xl items-center gap-8 px-5 pb-16 pt-24 md:grid-cols-[1.1fr_1.3fr]">
        <div className="z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-semibold text-accent backdrop-blur-sm">
            <Globe className="size-3.5" />
            <span>International Haute Cuisine in Bole</span>
          </div>
          <h1 className="mt-4 text-5xl leading-[1.02] sm:text-7xl font-display text-foreground tracking-tight">
            A taste worth <em className="italic text-accent">discovering.</em>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Center-cut filet mignon, wood-fired Diavola pizza, fresh grilled salmon, and handmade fettuccine. Grab the table and spin the 3D platter.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" variant="accent" className="shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/menu">Explore Full Menu</Link>
            </Button>
            <Button asChild size="lg" variant="heroOutline" className="transition-all duration-300">
              <Link to="/reserve">Reserve a Table</Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-4 rounded-2xl liquid-glass-card p-4 shadow-xl text-foreground">
            <div className="relative z-10 flex-1">
              <p className="text-xs uppercase tracking-wider text-accent font-semibold">{activeFrontItem.tag}</p>
              <p className="mt-0.5 font-display text-lg font-medium text-foreground">{activeFrontItem.name}</p>
              <p className="text-sm font-bold text-foreground/90">{formatBirr(activeFrontItem.price)}</p>
            </div>
            <Button size="sm" variant="accent" onClick={handleAddFrontItem} className="relative z-10 gap-1.5 shadow-md">
              <Plus className="size-4" /> Add
            </Button>
          </div>
        </div>

        <div
          className="relative h-[500px] w-full cursor-grab touch-pan-y select-none sm:h-[540px] active:cursor-grabbing"
          style={{ perspective: 1300 }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          <div className="exp-floor absolute bottom-4 left-1/2 h-28 w-[88%] -translate-x-1/2 rounded-[50%]" />
          <div className="absolute bottom-10 left-1/2 h-4 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-xl" />

          <div
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(-9deg) rotateY(${angle}deg)`,
              transition: drag.current ? "none" : "transform 0.05s linear",
            }}
          >
            {studioItems.map((o) => (
              <div
                key={o.id}
                className="absolute bottom-16 left-1/2 transition-opacity duration-300"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${o.at}deg) translateZ(250px) translateX(-50%)`,
                }}
              >
                <div
                  style={{
                    transform: `rotateY(${-(angle + o.at)}deg)`,
                  }}
                  className="group relative flex flex-col items-center"
                >
                  <img
                    src={o.src}
                    alt={o.alt}
                    draggable={false}
                    className={`${o.scale} w-auto max-w-none drop-shadow-[0_20px_25px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-105`}
                  />
                  <div className="pointer-events-none mt-2 rounded-full liquid-glass-pill px-3 py-1 text-[11px] font-medium text-foreground opacity-90 shadow-md whitespace-nowrap">
                    {o.name}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-1 right-2 text-xs text-muted-foreground">
            ⇄ Drag to rotate platter
          </div>
        </div>
      </div>
    </section>
  );
}

/* 3 — Product cards that lean toward your pointer */
function LeanCard({ item, onSelect }: { item: PublicMenuItem; onSelect: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      setT({ x: Math.max(-1, Math.min(1, dx * 2)), y: Math.max(-1, Math.min(1, dy * 2)) });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <button
      ref={ref}
      onClick={onSelect}
      className="group rounded-2xl border border-border/80 bg-card p-4 text-left shadow-soft transition-all duration-300 ease-out will-change-transform hover:border-accent/60 hover:shadow-xl dark:border-white/10 dark:bg-card/70 cursor-pointer"
      style={{ transform: `perspective(800px) rotateY(${t.x * 12}deg) rotateX(${-t.y * 12}deg) translateZ(0)` }}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary/40 dark:bg-secondary/20 p-2 flex items-center justify-center transition-colors">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="size-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground/40">
            <UtensilsCrossed className="size-10" />
          </div>
        )}
      </div>
      <h3 className="mt-4 text-lg font-medium leading-tight text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
      <p className="mt-1.5 font-bold text-foreground">{formatBirr(item.price)}</p>
      {!item.available && (
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-destructive">Sold out</p>
      )}
    </button>
  );
}

export function LeanCards({ items, onSelect }: { items: PublicMenuItem[]; onSelect: (i: PublicMenuItem) => void }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <Sparkles className="size-3.5" />
            <span>Chef's Daily Selection</span>
          </div>
          <h2 className="mt-2 text-4xl sm:text-5xl font-display text-foreground">Crafted to perfection</h2>
        </div>
        <Link to="/menu" className="text-sm font-semibold text-accent hover:underline">
          Full menu →
        </Link>
      </div>
      {items.length ? (
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {items.map((i) => (
            <LeanCard key={i.id} item={i} onSelect={() => onSelect(i)} />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-10 text-center text-muted-foreground">
          Our menu is being prepared.
        </p>
      )}
    </section>
  );
}

/* 4 — THE INTERACTIVE 3D CULINARY CLOCK (CulinaryClock) */
/* The food is OUTSIDE the clock, and shows up along the clock's analog line respectively */
function getShortestAngleDelta(fromAngle: number, toAngle: number): number {
  const normFrom = ((fromAngle % 360) + 360) % 360;
  const normTo = ((toAngle % 360) + 360) % 360;
  let diff = normTo - normFrom;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

export function CulinaryClock({ hours }: { hours: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const cart = useCart();

  // Kinetic physics refs for 60/120fps fluid motion without CSS transition jitter
  const targetAngleRef = useRef(0);
  const currentAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{
    pointerId: number;
    lastAngle: number;
    lastTime: number;
  } | null>(null);

  const [activeDishIndex, setActiveDishIndex] = useState(0);
  const activeDishIndexRef = useRef(0);
  const [displayAngle, setDisplayAngle] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // All 11 Signature Dishes positioned outside the clock dial
  const clockDishes = useMemo(
    () => [
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f8888888-8888-4888-a888-488888888888") ?? SIGNATURE_FOODS[7]!,
        slot: "lunch-burger",
        label: "12:00 PM",
        title: "Gourmet Burger",
        angle: 0,
        tag: "Prime Beef",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f1111111-1111-4111-a111-111111111111") ?? SIGNATURE_FOODS[0]!,
        slot: "lunch-diavola",
        label: "12:45 PM",
        title: "Wood-Fired Diavola",
        angle: 33,
        tag: "Neapolitan Pizza",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f7777777-7777-4777-a777-777777777777") ?? SIGNATURE_FOODS[6]!,
        slot: "lunch-perch",
        label: "01:45 PM",
        title: "Pan-Seared Nile Perch",
        angle: 65,
        tag: "Fresh Catch",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f2222222-2222-4222-a222-222222222222") ?? SIGNATURE_FOODS[1]!,
        slot: "afternoon-club",
        label: "03:15 PM",
        title: "Triple-Decker Club",
        angle: 98,
        tag: "Bistro Sandwich",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "fbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb") ?? SIGNATURE_FOODS[10]!,
        slot: "afternoon-slice",
        label: "04:30 PM",
        title: "Artisan Pizza Slice",
        angle: 131,
        tag: "Wood-Fired Slice",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "faaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa") ?? SIGNATURE_FOODS[9]!,
        slot: "sunset-pizza",
        label: "06:00 PM",
        title: "Salmon & Mozzarella Pizza",
        angle: 164,
        tag: "Gourmet White Base",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f4444444-4444-4444-a444-444444444444") ?? SIGNATURE_FOODS[3]!,
        slot: "dinner-steak",
        label: "07:30 PM",
        title: "Prime Filet Mignon",
        angle: 196,
        tag: "French Haute Cuisine",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f6666666-6666-4666-a666-666666666666") ?? SIGNATURE_FOODS[5]!,
        slot: "dinner-pasta",
        label: "08:45 PM",
        title: "Creamy Salmon Fettuccine",
        angle: 229,
        tag: "Artisan Ribbon Pasta",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f5555555-5555-4555-a555-555555555555") ?? SIGNATURE_FOODS[4]!,
        slot: "night-salmon",
        label: "10:00 PM",
        title: "Pan-Seared Grilled Salmon",
        angle: 262,
        tag: "Nordic Coastal",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f3333333-3333-4333-a333-333333333333") ?? SIGNATURE_FOODS[2]!,
        slot: "breakfast-brioche",
        label: "08:30 AM",
        title: "Golden Brioche Toast",
        angle: 295,
        tag: "Normandy Butter Delice",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f9999999-9999-4999-a999-499999999999") ?? SIGNATURE_FOODS[8]!,
        slot: "morning-salad",
        label: "10:30 AM",
        title: "Garden Salad Bowl",
        angle: 327,
        tag: "Crisp Organic Greens",
      },
    ],
    []
  );

  // High-performance RAF physics loop: continuous, silky-smooth rotation & damped lerp
  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();
    let lastRenderedAngle = 0;

    const loop = (now: number) => {
      const dt = Math.min(now - lastTime, 40);
      lastTime = now;

      if (isAutoPlaying && !isDraggingRef.current) {
        // Brisk, elegant speed: ~45 deg/sec at 1x, ~90 deg/sec at 2x
        const autoSpeed = 0.045 * speedMultiplier;
        targetAngleRef.current += autoSpeed * dt;
      } else if (!isDraggingRef.current && Math.abs(velocityRef.current) > 0.005) {
        // Natural inertial glide decay
        targetAngleRef.current += velocityRef.current * (dt / 16.6);
        velocityRef.current *= Math.pow(0.92, dt / 16.6);
      }

      // Silky-smooth damped lerp: graceful luxury Swiss timepiece sweep (~350ms fluid arc)
      const diff = targetAngleRef.current - currentAngleRef.current;
      const lerpFactor = Math.min(1, 1 - Math.exp(-0.009 * dt));
      currentAngleRef.current += diff * lerpFactor;

      // Direct hardware-accelerated transform update on clock hand: 120fps fluid without CSS conflict
      if (handRef.current) {
        handRef.current.style.transform = `rotate(${currentAngleRef.current}deg)`;
      }

      // In auto-play or dial drag mode, dynamically track nearest dish
      if (isAutoPlaying || isDraggingRef.current) {
        const norm = ((currentAngleRef.current % 360) + 360) % 360;
        let best = 0;
        let minDiff = 999;
        clockDishes.forEach((d, idx) => {
          let dDiff = Math.abs(norm - d.angle) % 360;
          if (dDiff > 180) dDiff = 360 - dDiff;
          if (dDiff < minDiff) {
            minDiff = dDiff;
            best = idx;
          }
        });

        if (best !== activeDishIndexRef.current) {
          activeDishIndexRef.current = best;
          setActiveDishIndex(best);
        }
      }

      // Sync displayAngle throttled for dial digits
      if (Math.abs(currentAngleRef.current - lastRenderedAngle) > 0.4) {
        lastRenderedAngle = currentAngleRef.current;
        setDisplayAngle(currentAngleRef.current);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isAutoPlaying, speedMultiplier, clockDishes]);

  // Discrete dish-stepping presentation: 1 scroll gesture = 1 smooth dish rotation
  const stepToDish = useCallback(
    (nextIdx: number) => {
      const count = clockDishes.length;
      const clamped = Math.max(0, Math.min(count - 1, nextIdx));
      if (clamped === activeDishIndexRef.current) return;

      setIsAutoPlaying(false);
      velocityRef.current = 0;

      const targetDish = clockDishes[clamped];
      if (!targetDish) return;

      const delta = getShortestAngleDelta(currentAngleRef.current, targetDish.angle);
      targetAngleRef.current = currentAngleRef.current + delta;

      activeDishIndexRef.current = clamped;
      setActiveDishIndex(clamped);
    },
    [clockDishes]
  );

  const wheelAccumulatorRef = useRef(0);
  const lastStepTimeRef = useRef(0);
  const wheelResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Discrete scroll-step presentation: 1 scroll gesture = 1 smooth dish rotation
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Check if the culinary clock section is currently active in the viewport
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      // In-view when top is near or above top of screen and section occupies majority of viewport
      const isClockInView = rect.top <= 120 && rect.bottom >= windowH * 0.55;
      if (!isClockInView) return;

      const currentIdx = activeDishIndexRef.current;
      const isAtFirst = currentIdx === 0;
      const isAtLast = currentIdx === clockDishes.length - 1;

      // Scrolling UP at first dish -> release to normal page scroll up
      if (isAtFirst && e.deltaY < 0) return;

      // Scrolling DOWN at last dish -> release to normal page scroll down
      if (isAtLast && e.deltaY > 0) return;

      // Inside dish sequence: intercept scroll gesture
      e.preventDefault();

      const now = performance.now();
      wheelAccumulatorRef.current += e.deltaY;

      if (wheelResetTimerRef.current) {
        clearTimeout(wheelResetTimerRef.current);
      }
      wheelResetTimerRef.current = setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, 200);

      const cooldown = 240; // ms between discrete steps
      const threshold = 35; // px accumulated scroll

      if (now - lastStepTimeRef.current >= cooldown) {
        if (wheelAccumulatorRef.current >= threshold) {
          stepToDish(currentIdx + 1);
          lastStepTimeRef.current = now;
          wheelAccumulatorRef.current = 0;
        } else if (wheelAccumulatorRef.current <= -threshold) {
          stepToDish(currentIdx - 1);
          lastStepTimeRef.current = now;
          wheelAccumulatorRef.current = 0;
        }
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (wheelResetTimerRef.current) clearTimeout(wheelResetTimerRef.current);
    };
  }, [clockDishes.length, stepToDish]);

  // Touch swipe support on mobile devices
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let touchStartY = 0;
    let touchStartX = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0]!.clientY;
        touchStartX = e.touches[0]!.clientX;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const dy = touchStartY - e.touches[0]!.clientY; // positive = swipe up = scroll down
      const dx = Math.abs(touchStartX - e.touches[0]!.clientX);

      if (dx > Math.abs(dy)) return; // horizontal swipe

      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const isClockInView = rect.top <= 120 && rect.bottom >= windowH * 0.55;
      if (!isClockInView) return;

      const currentIdx = activeDishIndexRef.current;
      const isAtFirst = currentIdx === 0;
      const isAtLast = currentIdx === clockDishes.length - 1;

      if ((isAtFirst && dy < 0) || (isAtLast && dy > 0)) {
        return; // boundary release
      }

      if (Math.abs(dy) > 35) {
        e.preventDefault();
        const now = performance.now();
        if (now - lastStepTimeRef.current >= 260) {
          if (dy > 0) {
            stepToDish(currentIdx + 1);
          } else {
            stepToDish(currentIdx - 1);
          }
          lastStepTimeRef.current = now;
          touchStartY = e.touches[0]!.clientY;
        }
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [clockDishes.length, stepToDish]);

  // Keyboard arrow keys navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const isClockInView = rect.top <= 150 && rect.bottom >= windowH * 0.5;
      if (!isClockInView) return;

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        if (activeDishIndexRef.current < clockDishes.length - 1) {
          e.preventDefault();
          stepToDish(activeDishIndexRef.current + 1);
        }
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        if (activeDishIndexRef.current > 0) {
          e.preventDefault();
          stepToDish(activeDishIndexRef.current - 1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clockDishes.length, stepToDish]);

  const activeDish = clockDishes[activeDishIndex]!;

  const handlePrevDish = () => {
    stepToDish(activeDishIndexRef.current - 1);
  };

  const handleNextDish = () => {
    stepToDish(activeDishIndexRef.current + 1);
  };

  // Direct touch/drag gesture on dial
  const handleDialPointerDown = (e: React.PointerEvent) => {
    const dial = dialRef.current;
    if (!dial) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    setIsAutoPlaying(false);
    velocityRef.current = 0;

    const rect = dial.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);

    dragStartRef.current = {
      pointerId: e.pointerId,
      lastAngle: startAngle,
      lastTime: performance.now(),
    };
  };

  const handleDialPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    const dial = dialRef.current;
    if (!dial) return;

    const rect = dial.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const nowAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const nowTime = performance.now();

    let delta = nowAngle - dragStartRef.current.lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    targetAngleRef.current += delta;
    currentAngleRef.current += delta;

    const dt = Math.max(1, nowTime - dragStartRef.current.lastTime);
    velocityRef.current = (delta / dt) * 16.6 * 0.8;

    dragStartRef.current.lastAngle = nowAngle;
    dragStartRef.current.lastTime = nowTime;
  };

  const handleDialPointerUp = (e: React.PointerEvent) => {
    if (dragStartRef.current?.pointerId === e.pointerId) {
      isDraggingRef.current = false;
      dragStartRef.current = null;
    }
  };

  const handleAddToCart = (dishFood: SignatureFood) => {
    cart.add({
      itemId: dishFood.id,
      name: dishFood.name,
      price: dishFood.price,
      quantity: 1,
      imageUrl: dishFood.image,
    });
    setAddedItem(dishFood.id);
    toast.success(`Added ${dishFood.name} to cart!`);
    setTimeout(() => setAddedItem(null), 2000);
  };

  const orbitRadius = isMobile ? 150 : 210;

  return (
    <section
      ref={ref}
      id="culinary-clock"
      className="relative min-h-screen py-12 sm:py-16 bg-gradient-to-b from-background via-secondary/25 to-background flex flex-col items-center justify-center overflow-hidden select-none"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        setMouseParallax({ x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) });
      }}
    >
      {/* Ambient chromatic light refractions */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 -z-10 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[140px] animate-pulse" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 -z-10 size-[28rem] rounded-full bg-primary/10 blur-[150px]" />
      <div className="pointer-events-none absolute left-1/2 bottom-1/3 -z-10 size-[26rem] rounded-full bg-amber-500/10 blur-[130px]" />

      <div className="relative w-full flex flex-col items-center justify-center gap-3 sm:gap-5 px-4 sm:px-6">
        {/* Modern Light Switch */}
        <div className="absolute top-0 right-3 sm:right-6 md:right-10 lg:right-14 z-30 pointer-events-auto">
          <ModernLightSwitch />
        </div>

        <div className="text-center max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent backdrop-blur-sm">
            <Clock className="size-3.5" />
            <span>The Culinary Timepiece</span>
          </div>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-foreground">
            Flavors that turn with the clock
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
            Rotate through our daily culinary hours — revealing each dish at its golden hour.
          </p>
        </div>

        {/* 3D Clock Stage: Analog Clock in Center, Food OUTSIDE in Orbit */}
        <div className="grid w-full max-w-[1400px] items-center gap-6 lg:gap-8 lg:grid-cols-[1.38fr_1fr]">
          <div
            className="perspective-1000 relative mx-auto flex items-center justify-center select-none"
            style={{
              width: "min(96vw, 660px)",
              height: isMobile ? "370px" : "490px",
            }}
          >
            <div
              className="preserve-3d relative size-full flex items-center justify-center transition-transform duration-150 ease-out"
              style={{
                transform: `rotateX(${-mouseParallax.y * 6}deg) rotateY(${mouseParallax.x * 6}deg)`,
              }}
            >
              {/* THE ANALOG CLOCK (Center, Liquid Glass Dial, Drag-interactive) */}
              <div
                ref={dialRef}
                onPointerDown={handleDialPointerDown}
                onPointerMove={handleDialPointerMove}
                onPointerUp={handleDialPointerUp}
                onPointerCancel={handleDialPointerUp}
                className="liquid-glass-dial relative size-44 sm:size-56 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-xl"
              >
                <div className="absolute inset-2 sm:inset-2.5 rounded-full border border-foreground/15 dark:border-white/20 pointer-events-none" />

                {/* 12 Hour Ticks */}
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${i * 30}deg)` }}>
                    <span
                      className={`absolute left-1/2 top-2 -translate-x-1/2 rounded-full ${
                        i % 3 === 0 ? "h-4 w-1.5 bg-primary/80" : "h-2.5 w-0.5 bg-primary/35"
                      }`}
                    />
                    {i % 3 === 0 && (
                      <span
                        className="absolute left-1/2 top-6 -translate-x-1/2 font-display text-xs sm:text-sm font-semibold text-primary/70"
                        style={{ transform: `rotate(${-i * 30}deg)` }}
                      >
                        {i === 0 ? "12" : i}
                      </span>
                    )}
                  </div>
                ))}

                {/* 60 Minute Dots */}
                {Array.from({ length: 60 }, (_, i) => (
                  <div key={`m-${i}`} className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${i * 6}deg)` }}>
                    <span className="absolute left-1/2 top-1 size-1 -translate-x-1/2 rounded-full bg-primary/20" />
                  </div>
                ))}

                {/* Polished Center Bearing Jewel (No text overlap!) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-3.5 sm:size-4 rounded-full border-2 border-background bg-accent shadow-[0_0_12px_rgba(202,138,4,0.7)] z-20 pointer-events-none" />

                {/* Clock Face Display: Live Digital Time & Service below center bearing */}
                <div className="z-10 flex flex-col items-center text-center px-2 pointer-events-none mt-10 sm:mt-12">
                  <span className="font-mono text-xs sm:text-sm font-bold tracking-tight text-foreground bg-background/70 dark:bg-card/75 px-2.5 py-0.5 rounded-full border border-border/40 shadow-xs backdrop-blur-md">
                    {activeDish.label}
                  </span>
                  <p className="mt-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-accent truncate max-w-[110px] sm:max-w-[130px]">
                    {activeDish.title}
                  </p>
                </div>

                {/* THE ROTATING ANALOG LINE — EXTENDS OUTSIDE THE CLOCK DIRECTLY TO THE ACTIVE DISH */}
                <div
                  ref={handRef}
                  className="absolute inset-0 pointer-events-none will-change-transform"
                  style={{
                    transform: `rotate(${displayAngle}deg)`,
                  }}
                >
                  <div
                    className="absolute bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rounded-full"
                    style={{
                      height: `${orbitRadius}px`,
                      width: "3px",
                      background: "linear-gradient(to top, var(--color-primary) 15%, var(--color-accent) 70%, var(--color-accent) 100%)",
                      boxShadow: "0 0 16px var(--color-accent)",
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_18px_var(--color-accent)] ring-4 ring-accent/25" />
                  </div>
                </div>
              </div>

              {/* ALL 11 FOOD ITEMS IN ORBIT WITH BUTTERY SPRING TRANSITION */}
              {clockDishes.map((item, idx) => {
                const isActive = idx === activeDishIndex;
                const rad = (item.angle * Math.PI) / 180;
                const posX = Math.sin(rad) * orbitRadius;
                const posY = -Math.cos(rad) * orbitRadius;

                return (
                  <button
                    key={item.slot}
                    type="button"
                    onClick={() => stepToDish(idx)}
                    className={`absolute flex flex-col items-center justify-center cursor-pointer will-change-transform ${
                      isActive
                        ? "z-30 scale-120 sm:scale-130 opacity-100 drop-shadow-2xl"
                        : "z-10 scale-85 sm:scale-92 opacity-50 hover:opacity-95 hover:scale-105"
                    }`}
                    style={{
                      left: `calc(50% + ${posX}px)`,
                      top: `calc(50% + ${posY}px)`,
                      transform: "translate(-50%, -50%)",
                      transition: "transform 0.35s cubic-bezier(0.34, 1.45, 0.64, 1), opacity 0.25s ease, filter 0.25s ease",
                    }}
                  >
                    <div className="relative group flex flex-col items-center">
                      {isActive && (
                        <div className="absolute -inset-3 rounded-full bg-accent/25 blur-lg -z-10 animate-pulse" />
                      )}
                      <img
                        src={item.food.image}
                        alt={item.food.name}
                        loading="eager"
                        draggable={false}
                        className={`clock-shadow w-auto object-contain transition-transform duration-300 ${
                          isMobile
                            ? isActive ? "h-22 max-w-[105px]" : "h-13 max-w-[60px]"
                            : isActive ? "h-30 max-w-[150px] sm:h-38 sm:max-w-[180px]" : "h-15 max-w-[75px] sm:h-18 sm:max-w-[85px]"
                        } ${isActive ? "animate-float-slow" : ""}`}
                      />

                      <div
                        className={`mt-1 rounded-full whitespace-nowrap transition-all shadow-md ${
                          isActive
                            ? "liquid-glass-pill bg-accent/25 text-accent font-bold ring-2 ring-accent/40 text-xs sm:text-sm px-3.5 py-0.5"
                            : "liquid-glass-pill text-foreground/85 text-[10px] sm:text-xs px-2.5 py-0.5"
                        }`}
                      >
                        <span className="font-semibold">{item.label}</span>
                        {isActive && <span className="hidden sm:inline"> · {item.title}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Luxury Liquid Glass Presentation Card for Active Dish */}
          <div className="relative group/card w-full max-w-md lg:max-w-lg mx-auto">
            {/* Chromatic glow backdrop */}
            <div className="pointer-events-none absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-amber-500/20 via-primary/10 to-accent/25 blur-2xl opacity-80 transition-opacity duration-700 group-hover/card:opacity-100" />
            <div className="pointer-events-none absolute -top-8 -left-6 -z-10 size-44 rounded-full bg-amber-400/25 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-6 -right-6 -z-10 size-40 rounded-full bg-accent/25 blur-3xl" />

            <div className="liquid-glass-card rounded-2xl p-5 sm:p-6 transition-all duration-300 overflow-hidden z-20">
              <div key={activeDish.food.id} className="animate-dish-glide">
                {/* Specular fluid sheen */}
                <div className="pointer-events-none absolute -top-1/2 left-0 right-0 h-full bg-gradient-to-b from-white/30 via-transparent to-transparent opacity-60" />

                {/* Header: Time & Service Badge */}
                <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-foreground/10 pb-3.5">
                  <div className="liquid-glass-pill flex items-center gap-2 rounded-full px-3 py-1">
                    <span className="relative flex size-2.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-80" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-bold tracking-wide text-foreground">
                      {activeDish.label}
                    </span>
                  </div>
                  <span className="liquid-glass-pill rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-accent shadow-sm">
                    {activeDish.title}
                  </span>
                </div>

                {/* Dish Title & Description */}
                <div className="relative mt-4">
                  <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-primary/80">
                    {activeDish.food.cuisine}
                  </p>
                  <h3 className="mt-1 font-display text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
                    {activeDish.food.name}
                  </h3>
                  <p className="mt-1 font-display text-xs sm:text-sm italic text-foreground/75">
                    {activeDish.food.subtitle}
                  </p>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-foreground/85 line-clamp-3">
                    {activeDish.food.description}
                  </p>
                </div>

                {/* Frosted Badges */}
                <div className="relative mt-4 flex flex-wrap items-center gap-2">
                  {activeDish.food.prepTime && (
                    <span className="liquid-glass-pill rounded-lg px-2.5 py-1 text-xs font-semibold text-foreground/90">
                      ⏱ {activeDish.food.prepTime}
                    </span>
                  )}
                  {activeDish.food.calories && (
                    <span className="liquid-glass-pill rounded-lg px-2.5 py-1 text-xs font-semibold text-foreground/90">
                      🔥 {activeDish.food.calories}
                    </span>
                  )}
                  {activeDish.food.badges.map((b) => (
                    <span key={b} className="liquid-glass-pill rounded-lg px-2.5 py-1 text-xs font-medium text-foreground/90">
                      {b}
                    </span>
                  ))}
                </div>

                {/* Price & Action Button */}
                <div className="relative mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-foreground/10 pt-4">
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold text-foreground/60 uppercase tracking-wider">Price</p>
                    <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-primary drop-shadow-sm">
                      {formatBirr(activeDish.food.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="default"
                      className="relative overflow-hidden rounded-xl bg-gradient-to-b from-primary to-primary/90 hover:from-primary/95 hover:to-primary text-primary-foreground border border-accent/40 shadow-lg px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                      onClick={() => handleAddToCart(activeDish.food)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform" />
                      {addedItem === activeDish.food.id ? (
                        <span className="flex items-center gap-1.5">
                          <Check className="size-4 text-accent" /> Added
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Plus className="size-4 text-accent" /> Add to Order
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modernized Floating Control Dock with 11 Position Indicators */}
        <div className="relative z-30 mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-1 sm:gap-2 rounded-full border border-border/60 bg-background/85 px-3 sm:px-4 py-1.5 shadow-md backdrop-blur-md dark:border-white/10 dark:bg-card/90">
          <Button
            size="icon"
            variant="ghost"
            className="size-7 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
            onClick={handlePrevDish}
            disabled={activeDishIndex === 0}
            aria-label="Previous dish"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            size="sm"
            variant={isAutoPlaying ? "accent" : "ghost"}
            className="h-7 rounded-full px-2.5 text-xs font-medium gap-1.5"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          >
            {isAutoPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
            <span>{isAutoPlaying ? "Pause" : "Auto"}</span>
          </Button>

          <span className="h-3.5 w-px bg-border/60 mx-0.5" />

          {/* Active dish & time slot display */}
          <div className="flex items-center gap-1.5 px-1.5 text-xs">
            <span className="font-semibold text-foreground">{activeDish.label}</span>
            <span className="text-muted-foreground hidden sm:inline max-w-[170px] truncate">· {activeDish.food.name}</span>
            <span className="font-mono text-[10px] text-accent/80 font-bold">({activeDishIndex + 1}/{clockDishes.length})</span>
          </div>

          {/* 11 Golden Indicator Dots */}
          <div className="hidden md:flex items-center gap-1.5 px-1.5">
            {clockDishes.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => stepToDish(dotIdx)}
                className={`size-2 rounded-full transition-all duration-300 cursor-pointer ${
                  dotIdx === activeDishIndex
                    ? "bg-accent scale-135 shadow-[0_0_8px_var(--color-accent)] ring-1 ring-accent"
                    : "bg-foreground/20 hover:bg-foreground/50"
                }`}
                aria-label={`Go to dish ${dotIdx + 1}`}
              />
            ))}
          </div>

          <span className="h-3.5 w-px bg-border/60 mx-0.5" />

          <Button
            size="sm"
            variant="ghost"
            className="h-7 rounded-full px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setSpeedMultiplier((s) => (s === 1 ? 2 : 1))}
            title="Toggle speed"
          >
            {speedMultiplier === 1 ? "1x" : "2x"}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="size-7 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
            onClick={handleNextDish}
            disabled={activeDishIndex === clockDishes.length - 1}
            aria-label="Next dish"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}


// Backward-compatible alias
export const LatteClock = CulinaryClock;

export const INTERNATIONAL_SHOWCASE_IDS = [
  "f4444444-4444-4444-a444-444444444444", // Prime Filet Mignon
  "f1111111-1111-4111-a111-111111111111", // Wood-Fired Diavola
  "f5555555-5555-4555-a555-555555555555", // Pan-Seared Salmon
  "f2222222-2222-4222-a222-222222222222", // Triple-Decker Club
];

/* 5 — 3D International Cuisine Showcase Strip */
export function InternationalShowcase() {
  const cart = useCart();
  const showcaseFoods = [
    {
      food: SIGNATURE_FOODS.find((f) => f.id === INTERNATIONAL_SHOWCASE_IDS[0]) ?? SIGNATURE_FOODS[3]!,
      region: "French Haute Cuisine",
      flag: "🥩",
      badge: "Prime Filet Mignon",
    },
    {
      food: SIGNATURE_FOODS.find((f) => f.id === INTERNATIONAL_SHOWCASE_IDS[1]) ?? SIGNATURE_FOODS[0]!,
      region: "Italian Neapolitan",
      flag: "🍕",
      badge: "Wood-Fired Diavola",
    },
    {
      food: SIGNATURE_FOODS.find((f) => f.id === INTERNATIONAL_SHOWCASE_IDS[2]) ?? SIGNATURE_FOODS[4]!,
      region: "Nordic Coastal",
      flag: "🐟",
      badge: "Pan-Seared Salmon",
    },
    {
      food: SIGNATURE_FOODS.find((f) => f.id === INTERNATIONAL_SHOWCASE_IDS[3]) ?? SIGNATURE_FOODS[1]!,
      region: "International Bistro",
      flag: "🥪",
      badge: "Triple-Decker Club",
    },
  ];

  return (
    <section className="border-t border-border/80 bg-card/60 dark:bg-card/40 py-20 transition-colors">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <Globe className="size-3.5" />
            <span>World-Class Dining</span>
          </div>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl text-foreground">International Kitchen</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Sourced with unyielding quality and prepared by master chefs right here in Addis Ababa.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {showcaseFoods.map(({ food, region }) => (
            <div
              key={food.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-md dark:border-white/10 dark:bg-card/70"
            >
              <div>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary/30 dark:bg-secondary/20 p-3 flex items-center justify-center transition-colors group-hover:bg-secondary/40">
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-background/85 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur-sm border border-border/40">
                    {region}
                  </span>
                  <img
                    src={food.image}
                    alt={food.name}
                    loading="lazy"
                    className="size-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 font-semibold text-base leading-snug text-foreground group-hover:text-primary transition-colors">
                  {food.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {food.description}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between pt-1">
                <span className="font-semibold text-base text-foreground">
                  {formatBirr(food.price)}
                </span>
                <Button
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs font-medium gap-1 shadow-none transition-all active:scale-95"
                  onClick={() => {
                    cart.add({
                      itemId: food.id,
                      name: food.name,
                      price: food.price,
                      quantity: 1,
                      imageUrl: food.image,
                    });
                    toast.success(`Added ${food.name} to cart`);
                  }}
                >
                  <Plus className="size-3.5" /> Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 6 — Organic culinary herb leaves drifting weightless behind fresh garden bowl */
const BOTANICALS = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 20 + ((i * 7) % 24),
  dur: 9 + ((i * 5) % 10),
  delay: -((i * 3) % 12),
  rot: (i * 47) % 360,
}));

export function CulinaryBotanicals({ s }: { s: Settings }) {
  const [m, setM] = useState({ x: 0, y: 0 });
  return (
    <section
      className="relative isolate overflow-hidden border-t border-border bg-espresso text-espresso-foreground"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setM({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
      }}
    >
      <div className="absolute inset-0 -z-10" style={{ transform: `translate(${m.x * -30}px, ${m.y * -30}px)` }}>
        {BOTANICALS.map((b, i) => (
          <svg
            key={i}
            viewBox="0 0 24 32"
            className="exp-leaf absolute text-accent/50"
            style={{
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: b.size,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              ["--r" as string]: `${b.rot}deg`,
            }}
          >
            {/* Fresh culinary bay / sage / olive leaf */}
            <path
              d="M12 2 C20 8, 22 22, 12 30 C2 22, 4 8, 12 2 Z"
              fill="currentColor"
              opacity="0.85"
            />
            {/* Center leaf vein */}
            <path d="M12 4 L12 28" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.45" />
            {/* Subtle botanical side veins */}
            <path
              d="M12 10 Q16 12 18 15 M12 18 Q16 20 18 23 M12 10 Q8 12 6 15 M12 18 Q8 20 6 23"
              stroke="currentColor"
              strokeWidth="0.8"
              fill="none"
              opacity="0.35"
            />
          </svg>
        ))}
      </div>
      <div className="mx-auto grid min-h-[80vh] max-w-6xl items-center gap-10 px-5 py-24 md:grid-cols-2">
        <img
          src={gardenSaladImg}
          width={1024}
          height={1024}
          loading="lazy"
          alt="Fresh Mediterranean garden salad"
          className="mx-auto w-[80%] max-w-md transition-transform duration-300 ease-out drop-shadow-2xl"
          style={{ transform: `rotate(${-6 + m.x * 10}deg) translate(${m.x * 20}px, ${m.y * 20}px)` }}
        />
        <div>
          <p className="eyebrow text-accent font-semibold tracking-widest">Our story</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-display text-espresso-foreground">{s.tagline}</h2>
          {s.about && <p className="mt-6 max-w-md leading-relaxed opacity-85 text-espresso-foreground/90">{s.about}</p>}
          <Button asChild variant="accent" size="lg" className="mt-8 shadow-lg hover:shadow-xl transition-all">
            <Link to="/about">More about us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Backward-compatible alias
export const DriftBeans = CulinaryBotanicals;

/* 7 — Thermal printer feeds your receipt out of its slot */
export function ReceiptPrinter({ cafeName }: { cafeName: string }) {
  const cart = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e?.isIntersecting && (setRun((r) => r || 1), io.disconnect()),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const now = new Date();
  return (
    <section ref={ref} className="mx-auto grid max-w-6xl items-start gap-12 px-5 py-24 md:grid-cols-2">
      <div className="md:pt-10">
        <p className="eyebrow text-muted-foreground">Your order</p>
        <h2 className="mt-2 text-4xl sm:text-5xl font-display">Fresh off the press</h2>
        <p className="mt-4 max-w-sm text-muted-foreground">
          {cart.count
            ? "Here's what's in your bag. Pay when you receive it."
            : "Your receipt is empty. Add something from the menu and it prints right here."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {cart.count ? (
            <Button asChild size="lg">
              <Link to="/checkout">Checkout</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link to="/menu">Browse menu</Link>
            </Button>
          )}
          <Button size="lg" variant="outline" onClick={() => setRun((r) => r + 1)}>
            <Printer /> Reprint
          </Button>
        </div>
      </div>
      <div className="mx-auto w-full max-w-sm">
        <div className="relative z-10 rounded-t-2xl bg-primary px-6 pb-4 pt-5 text-primary-foreground shadow-soft">
          <div className="flex items-center justify-between">
            <span className="eyebrow opacity-70">Thermal 58</span>
            <span className={`size-2 rounded-full ${run ? "exp-blink bg-accent" : "bg-primary-foreground/30"}`} />
          </div>
          <div className="mt-4 h-2 rounded-full bg-espresso" />
        </div>
        <div className="-mt-1 overflow-hidden px-4">
          <div
            key={run}
            className={`exp-paper bg-card px-5 pb-8 pt-6 font-mono text-xs shadow-soft ${
              run ? "exp-feed" : "-translate-y-full"
            }`}
          >
            <p className="text-center font-display text-base">{cafeName}</p>
            <p className="mt-1 text-center text-muted-foreground">
              {now.toLocaleDateString()} ·{" "}
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <div className="my-3 border-t border-dashed" />
            {cart.lines.length ? (
              cart.lines.map((l) => (
                <div key={l.key} className="flex justify-between gap-3 py-0.5">
                  <span className="truncate">
                    {l.quantity}× {l.name}
                  </span>
                  <span>{formatBirr(l.price * l.quantity)}</span>
                </div>
              ))
            ) : (
              <p className="py-2 text-center text-muted-foreground">— nothing yet —</p>
            )}
            <div className="my-3 border-t border-dashed" />
            <div className="flex justify-between font-bold">
              <span>Subtotal</span>
              <span>{formatBirr(cart.subtotal)}</span>
            </div>
            <p className="mt-4 text-center text-muted-foreground">Thank you · Merci · አመሰግናለሁ</p>
          </div>
        </div>
      </div>
    </section>
  );
}
