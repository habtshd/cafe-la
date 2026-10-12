import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo, useCallback, type PointerEvent as RPointerEvent } from "react";
import { UtensilsCrossed, Printer, Play, Pause, Plus, Check, Sparkles, Clock, Globe, ChevronLeft, ChevronRight, ChefHat, ArrowRight } from "lucide-react";

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
import cappuccinoImg from "@/assets/Cappuccino Cup with Latte Art.png";
import layeredIcedCoffeeImg from "@/assets/Layered Iced Coffee with Condensation.png";

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
        id: "d-cappuccino-latte-art",
        src: cappuccinoImg,
        name: "Artisan Velvet Cappuccino",
        tag: "Specialty Coffee Bar",
        price: 240,
        at: 45,
        scale: "h-36 sm:h-52",
        alt: "Artisan Cappuccino Cup with Latte Art",
      },
      {
        id: "f1111111-1111-4111-a111-111111111111",
        src: diavolaPizzaImg,
        name: "Pizza Diavola Napoletana",
        tag: "Wood-Fired Pizza",
        price: 720,
        at: 90,
        scale: "h-44 sm:h-60",
        alt: "Artisan Pizza Diavola",
      },
      {
        id: "f5555555-5555-4555-a555-555555555555",
        src: grilledSalmonImg,
        name: "Pan-Seared Norwegian Salmon",
        tag: "Nordic Coastal",
        price: 1250,
        at: 135,
        scale: "h-40 sm:h-56",
        alt: "Grilled Salmon fillet",
      },
      {
        id: "d-layered-iced-coffee",
        src: layeredIcedCoffeeImg,
        name: "Layered Iced Caramel Coffee",
        tag: "Cold Brew & Espresso",
        price: 290,
        at: 180,
        scale: "h-42 sm:h-58",
        alt: "Layered Iced Coffee with Condensation",
      },
      {
        id: "f6666666-6666-4666-a666-666666666666",
        src: fettuccineImg,
        name: "Creamy Salmon Fettuccine",
        tag: "Artisan Pasta",
        price: 890,
        at: 225,
        scale: "h-44 sm:h-60",
        alt: "Creamy Salmon Fettuccine on a Ridged Plate",
      },
      {
        id: "f2222222-2222-4222-a222-222222222222",
        src: clubSandwichImg,
        name: "Triple-Decker Club Sandwich",
        tag: "International Bistro",
        price: 460,
        at: 270,
        scale: "h-44 sm:h-60",
        alt: "Club sandwich with ham, cheese, tomato",
      },
      {
        id: "f7777777-7777-4777-a777-777777777777",
        src: nilePerchImg,
        name: "Pan-Seared Nile Perch Fillet",
        tag: "Regional Specialty",
        price: 950,
        at: 315,
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
              <Link to="/menu">View Full Menu</Link>
            </Button>
            <Button asChild size="lg" variant="heroOutline" className="transition-all duration-300">
              <Link to="/reserve">Reserve a Table</Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl liquid-glass-card p-4 shadow-xl text-foreground">
            <div className="relative z-10 flex-1">
              <p className="text-xs uppercase tracking-wider text-accent font-semibold">{activeFrontItem.tag}</p>
              <p className="mt-0.5 font-display text-lg font-medium text-foreground">{activeFrontItem.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Chef's Signature Selection · View details & prices in our menu</p>
            </div>
            <Button asChild size="sm" variant="accent" className="relative z-10 gap-1.5 shadow-md">
              <Link to="/menu" search={{ item: activeFrontItem.id }}>View in Menu &rarr;</Link>
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
function LeanCard({ item, onSelect }: { item: PublicMenuItem; onSelect?: () => void }) {
  const ref = useRef<HTMLAnchorElement>(null);
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
    <Link
      ref={ref}
      to="/menu"
      search={{ item: item.id }}
      className="group rounded-2xl border border-border/80 bg-card p-4 text-left shadow-soft transition-all duration-300 ease-out will-change-transform hover:border-accent/60 hover:shadow-xl dark:border-white/10 dark:bg-card/70 cursor-pointer block"
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
      <h3 className="mt-4 text-base sm:text-lg font-medium leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
        {item.name}
      </h3>
      <div className="mt-3 flex items-center justify-end border-t border-border/40 pt-2.5">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
          View in Menu &rarr;
        </span>
      </div>
    </Link>
  );
}

export function LeanCards({ items }: { items: PublicMenuItem[]; onSelect?: (i: PublicMenuItem) => void }) {
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
            <LeanCard key={i.id} item={i} />
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

/* Dynamic food-matching floating elements that morph based on the active dish */
const BOTANICALS = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 26 + ((i * 7) % 22),
  dur: 9 + ((i * 5) % 10),
  delay: -((i * 3) % 12),
  rot: (i * 47) % 360,
  variant: i % 4,
}));

function FoodParticle({ theme, variant }: { theme: string; variant: number }) {
  switch (theme) {
    case "pizza": {
      // 0: Spicy Pepperoni Slice, 1: Fresh Basil Leaf, 2: Black Olive Ring, 3: Chili Pepper Flake
      if (variant === 0) {
        return (
          <g>
            <circle cx="16" cy="16" r="13" fill="#dc2626" opacity="0.95" />
            <circle cx="16" cy="16" r="11" fill="#b91c1c" />
            <circle cx="12" cy="11" r="1.3" fill="#7f1d1d" />
            <circle cx="20" cy="13" r="1.5" fill="#fca5a5" opacity="0.7" />
            <circle cx="14" cy="20" r="1.2" fill="#7f1d1d" />
            <circle cx="18" cy="18" r="1" fill="#fca5a5" opacity="0.6" />
          </g>
        );
      }
      if (variant === 1) {
        return (
          <g>
            <path d="M16 3 C25 9, 27 23, 16 29 C5 23, 7 9, 16 3 Z" fill="#22c55e" opacity="0.95" />
            <path d="M16 5 L16 27" stroke="#15803d" strokeWidth="1.2" fill="none" />
            <path d="M16 11 Q21 14 24 15 M16 18 Q20 20 23 23 M16 11 Q11 14 8 15 M16 18 Q12 20 9 23" stroke="#15803d" strokeWidth="0.8" fill="none" opacity="0.6" />
          </g>
        );
      }
      if (variant === 2) {
        return (
          <g>
            <path
              d="M16 4 C22.6 4 28 9.4 28 16 C28 22.6 22.6 28 16 28 C9.4 28 4 22.6 4 16 C4 9.4 9.4 4 16 4 Z M16 11 C13.2 11 11 13.2 11 16 C11 18.8 13.2 21 16 21 C18.8 21 21 18.8 21 16 C21 13.2 18.8 11 16 11 Z"
              fill="#292524"
              opacity="0.9"
            />
            <circle cx="16" cy="16" r="11" stroke="#44403c" strokeWidth="1" fill="none" opacity="0.6" />
          </g>
        );
      }
      return (
        <g>
          <path d="M9 8 C15 6, 24 11, 23 20 C20 25, 12 25, 9 21 C6 17, 6 11, 9 8 Z" fill="#ef4444" opacity="0.95" />
          <circle cx="15" cy="17" r="2.2" fill="#fef08a" opacity="0.9" />
          <circle cx="15" cy="17" r="1.2" fill="#ca8a04" />
        </g>
      );
    }

    case "burger": {
      if (variant === 0) {
        return (
          <g>
            <ellipse cx="12" cy="14" rx="4" ry="7" fill="#fef08a" opacity="0.95" transform="rotate(-20 12 14)" />
            <ellipse cx="20" cy="18" rx="3.5" ry="6.5" fill="#fde047" opacity="0.95" transform="rotate(30 20 18)" />
          </g>
        );
      }
      if (variant === 1) {
        return (
          <g>
            <circle cx="16" cy="16" r="12" fill="#4ade80" stroke="#15803d" strokeWidth="1.8" opacity="0.9" />
            <circle cx="16" cy="16" r="7" fill="#86efac" opacity="0.7" />
            <circle cx="16" cy="16" r="2.5" fill="#166534" opacity="0.5" />
          </g>
        );
      }
      if (variant === 2) {
        return (
          <g>
            <path d="M7 11 Q18 6 25 15 Q17 24 8 18 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" opacity="0.95" />
            <path d="M11 13 Q16 10 21 16" stroke="#b45309" strokeWidth="0.8" fill="none" opacity="0.6" />
          </g>
        );
      }
      return (
        <g>
          <path d="M16 3 C24 8, 26 21, 17 29 C7 23, 9 9, 16 3 Z" fill="#22c55e" opacity="0.95" />
          <path d="M16 5 L16 27" stroke="#15803d" strokeWidth="1.2" fill="none" />
        </g>
      );
    }

    case "brioche": {
      if (variant === 0) {
        return (
          <g>
            <path d="M8 12 C14 5, 25 8, 24 18 C23 25, 12 25, 8 18 C6 14, 6 13, 8 12 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" opacity="0.95" />
            <path d="M12 12 Q18 9 20 18" stroke="#eab308" strokeWidth="1" fill="none" opacity="0.8" />
          </g>
        );
      }
      if (variant === 1) {
        return (
          <g>
            <polygon points="16,5 26,11 16,17 6,11" fill="#fde047" opacity="0.95" />
            <polygon points="6,11 16,17 16,27 6,21" fill="#ca8a04" opacity="0.9" />
            <polygon points="26,11 16,17 16,27 26,21" fill="#b45309" opacity="0.95" />
          </g>
        );
      }
      if (variant === 2) {
        return (
          <g>
            <path d="M16 4 C23 12, 24 22, 16 28 C8 22, 9 12, 16 4 Z" fill="#f59e0b" opacity="0.95" />
            <ellipse cx="14" cy="20" rx="3" ry="4" fill="#fbbf24" opacity="0.85" />
            <circle cx="13" cy="18" r="1.2" fill="#ffffff" opacity="0.7" />
          </g>
        );
      }
      return (
        <g>
          <path d="M16 3 L16 29" stroke="#b45309" strokeWidth="1.6" strokeLinecap="round" />
          <ellipse cx="12" cy="10" rx="2.5" ry="5" fill="#fde047" transform="rotate(-35 12 10)" />
          <ellipse cx="20" cy="10" rx="2.5" ry="5" fill="#fde047" transform="rotate(35 20 10)" />
          <ellipse cx="12" cy="18" rx="2.5" ry="5" fill="#fde047" transform="rotate(-35 12 18)" />
          <ellipse cx="20" cy="18" rx="2.5" ry="5" fill="#fde047" transform="rotate(35 20 18)" />
        </g>
      );
    }

    case "coffee": {
      if (variant === 0) {
        return (
          <g>
            <ellipse cx="16" cy="16" rx="9" ry="14" fill="#3b1706" opacity="0.95" />
            <ellipse cx="16" cy="16" rx="7.8" ry="12.5" fill="#5c2608" opacity="0.9" />
            <path d="M16 4 Q12.5 12 18 16 Q12.5 20 16 28" stroke="#1f0a02" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M11 9 Q8 16 11 23" stroke="#d97706" strokeWidth="0.8" opacity="0.4" fill="none" />
          </g>
        );
      }
      if (variant === 1) {
        return (
          <g>
            <ellipse cx="16" cy="16" rx="14" ry="9" fill="#2d1204" opacity="0.95" />
            <ellipse cx="16" cy="16" rx="12.5" ry="7.8" fill="#4d1d05" opacity="0.9" />
            <path d="M4 16 Q12 12.5 16 18 Q20 12.5 28 16" stroke="#170601" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M9 11 Q16 8 23 11" stroke="#f59e0b" strokeWidth="0.8" opacity="0.35" fill="none" />
          </g>
        );
      }
      if (variant === 2) {
        return (
          <g>
            <path d="M16 4 L18.5 11.5 L26 12 L20.5 17 L22 25 L16 20.5 L10 25 L11.5 17 L6 12 L13.5 11.5 Z" fill="#78350f" opacity="0.9" />
            <circle cx="16" cy="16" r="3.2" fill="#451a03" />
            <circle cx="16" cy="16" r="1.5" fill="#fde047" opacity="0.6" />
          </g>
        );
      }
      return (
        <g>
          <path d="M16 5 C22 13, 23 22, 16 27 C9 22, 10 13, 16 5 Z" fill="#d97706" opacity="0.9" />
          <ellipse cx="16" cy="19" rx="3.5" ry="4.5" fill="#f59e0b" opacity="0.8" />
          <circle cx="14" cy="16" r="1.2" fill="#ffffff" opacity="0.6" />
        </g>
      );
    }

    case "iced-coffee": {
      if (variant === 0) {
        return (
          <g>
            <ellipse cx="16" cy="16" rx="9" ry="14" fill="#3b1706" opacity="0.95" />
            <ellipse cx="16" cy="16" rx="7.5" ry="12" fill="#5c2608" opacity="0.9" />
            <path d="M16 4 Q12.5 12 18 16 Q12.5 20 16 28" stroke="#1f0a02" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        );
      }
      if (variant === 1) {
        return (
          <g>
            <polygon points="16,4 26,10 16,16 6,10" fill="#e0f2fe" opacity="0.9" />
            <polygon points="6,10 16,16 16,28 6,22" fill="#bae6fd" opacity="0.75" />
            <polygon points="26,10 16,16 16,28 26,22" fill="#7dd3fc" opacity="0.85" />
            <path d="M16 16 L16 28 M16 16 L26 10 M16 16 L6 10" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
          </g>
        );
      }
      if (variant === 2) {
        return (
          <g>
            <path d="M16 4 C24 10, 24 22, 16 28 C10 24, 8 16, 16 4 Z" fill="#b45309" opacity="0.9" />
            <path d="M14 9 Q19 16 15 23" stroke="#fcd34d" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.85" />
          </g>
        );
      }
      return (
        <g>
          <ellipse cx="16" cy="16" rx="13" ry="8.5" fill="#2d1204" opacity="0.95" />
          <path d="M4 16 Q12 12.5 16 18 Q20 12.5 28 16" stroke="#170601" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    case "salmon": {
      if (variant === 0) {
        return (
          <g>
            <circle cx="16" cy="16" r="13" fill="#facc15" opacity="0.9" />
            <circle cx="16" cy="16" r="11" fill="#fef08a" />
            <circle cx="16" cy="16" r="2" fill="#ca8a04" />
            <path d="M16 6 L16 14 M16 18 L16 26 M6 16 L14 16 M18 16 L26 16 M9 9 L14 14 M18 18 L23 23 M9 23 L14 18 M18 14 L23 9" stroke="#eab308" strokeWidth="1" opacity="0.8" />
          </g>
        );
      }
      if (variant === 1) {
        return (
          <g>
            <path d="M5 27 Q14 17 25 5" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <path d="M10 21 Q16 20 19 14 M14 16 Q19 12 22 9 M8 23 Q12 19 16 17 M17 12 Q20 8 23 7" stroke="#4ade80" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          </g>
        );
      }
      if (variant === 2) {
        return (
          <g>
            <circle cx="16" cy="16" r="9" fill="#fb7185" opacity="0.95" />
            <circle cx="13" cy="13" r="2.8" fill="#fecdd3" opacity="0.8" />
            <circle cx="16" cy="16" r="7" stroke="#e11d48" strokeWidth="0.8" fill="none" opacity="0.4" />
          </g>
        );
      }
      return (
        <g>
          <path d="M16 2 C21 8, 22 22, 16 30 C10 22, 11 8, 16 2 Z" fill="#16a34a" opacity="0.9" />
          <path d="M16 4 L16 28" stroke="#15803d" strokeWidth="1.2" fill="none" />
        </g>
      );
    }

    case "steak": {
      if (variant === 0) {
        return (
          <g>
            <path d="M16 3 L16 29" stroke="#15803d" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M16 7 L24 4 M16 7 L8 4 M16 13 L25 9 M16 13 L7 9 M16 19 L24 15 M16 19 L8 15 M16 24 L23 21 M16 24 L9 21" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        );
      }
      if (variant === 1) {
        return (
          <g>
            <circle cx="16" cy="16" r="9" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
            <circle cx="13" cy="13" r="1.8" fill="#71717a" opacity="0.8" />
            <circle cx="19" cy="19" r="1.4" fill="#52525b" opacity="0.7" />
          </g>
        );
      }
      if (variant === 2) {
        return (
          <g>
            <path d="M10 6 C19 4, 26 12, 23 22 C21 27, 12 28, 8 23 C5 18, 5 10, 10 6 Z" fill="#fef9c3" stroke="#fde047" strokeWidth="1.2" opacity="0.95" />
            <path d="M12 11 Q16 18 15 23" stroke="#facc15" strokeWidth="0.8" fill="none" opacity="0.6" />
          </g>
        );
      }
      return (
        <g>
          <path d="M16 4 C23 13, 24 22, 16 27 C8 22, 9 13, 16 4 Z" fill="#881337" opacity="0.95" />
          <circle cx="14" cy="19" r="2.8" fill="#f43f5e" opacity="0.75" />
        </g>
      );
    }

    case "pasta": {
      if (variant === 0) {
        return (
          <g>
            <path d="M6 6 Q14 14 10 20 Q6 26 18 28" stroke="#facc15" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.95" />
            <path d="M8 7 Q15 14 11 20" stroke="#fef08a" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7" />
          </g>
        );
      }
      if (variant === 1) {
        return (
          <g>
            <path d="M7 10 Q19 5 26 15 Q18 25 8 18 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" opacity="0.9" />
            <path d="M11 13 Q17 10 22 16" stroke="#ca8a04" strokeWidth="0.6" fill="none" opacity="0.5" />
          </g>
        );
      }
      if (variant === 2) {
        return (
          <g>
            <path d="M16 3 C25 9, 27 23, 16 29 C5 23, 7 9, 16 3 Z" fill="#22c55e" opacity="0.95" />
            <path d="M16 4 L16 28" stroke="#15803d" strokeWidth="1" fill="none" />
          </g>
        );
      }
      return (
        <g>
          <circle cx="16" cy="16" r="10" fill="#ef4444" opacity="0.95" />
          <circle cx="13" cy="12" r="2.6" fill="#fca5a5" opacity="0.7" />
          <path d="M16 6 L13 3 M16 6 L19 3 M16 6 L16 2" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );
    }

    case "salad":
    default: {
      if (variant === 0) {
        return (
          <g>
            <path d="M16 2 C22 6, 24 14, 21 18 C24 21, 23 27, 16 30 C9 27, 8 21, 11 18 C8 14, 10 6, 16 2 Z" fill="#22c55e" opacity="0.9" />
            <path d="M16 4 L16 28" stroke="#16a34a" strokeWidth="1.2" fill="none" />
          </g>
        );
      }
      if (variant === 1) {
        return (
          <g>
            <circle cx="16" cy="16" r="12" fill="#86efac" opacity="0.8" stroke="#22c55e" strokeWidth="1.6" />
            <circle cx="16" cy="16" r="6" fill="#dcfce7" opacity="0.7" />
            <circle cx="16" cy="16" r="2" fill="#15803d" opacity="0.4" />
          </g>
        );
      }
      if (variant === 2) {
        return (
          <g>
            <path d="M16 4 C22 9, 23 21, 16 28 C9 21, 10 9, 16 4 Z" fill="#4ade80" opacity="0.9" />
            <path d="M16 5 L16 26" stroke="#16a34a" strokeWidth="1" fill="none" opacity="0.7" />
          </g>
        );
      }
      return (
        <g>
          <circle cx="16" cy="16" r="9.5" fill="#f87171" opacity="0.95" />
          <circle cx="13" cy="12" r="2.2" fill="#fee2e2" opacity="0.8" />
          <path d="M16 6 L14 3 M16 6 L18 3" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      );
    }
  }
}

export function CulinaryClock({ hours }: { hours: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLDivElement>(null);

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
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 640) setScreenSize("mobile");
      else if (w < 1024) setScreenSize("tablet");
      else setScreenSize("desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // All 11 Signature Dishes positioned outside the clock dial with vibrant, authentic food color palettes
  const clockDishes = useMemo(
    () => [
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f8888888-8888-4888-a888-488888888888") ?? SIGNATURE_FOODS[7]!,
        slot: "lunch-burger",
        label: "12:00 PM",
        title: "Gourmet Burger",
        angle: 0,
        tag: "Prime Beef",
        theme: "burger",
        boardColor: "#b45309",
        glowColor: "rgba(253, 224, 71, 0.45)",
        accentColor: "#fef08a",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f1111111-1111-4111-a111-111111111111") ?? SIGNATURE_FOODS[0]!,
        slot: "lunch-diavola",
        label: "12:45 PM",
        title: "Wood-Fired Diavola",
        angle: 33,
        tag: "Neapolitan Pizza",
        theme: "pizza",
        boardColor: "#b91c1c",
        glowColor: "rgba(254, 202, 202, 0.45)",
        accentColor: "#fee2e2",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f7777777-7777-4777-a777-777777777777") ?? SIGNATURE_FOODS[6]!,
        slot: "lunch-perch",
        label: "01:45 PM",
        title: "Pan-Seared Nile Perch",
        angle: 65,
        tag: "Fresh Catch",
        theme: "salmon",
        boardColor: "#0284c7",
        glowColor: "rgba(186, 230, 253, 0.45)",
        accentColor: "#e0f2fe",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f2222222-2222-4222-a222-222222222222") ?? SIGNATURE_FOODS[1]!,
        slot: "afternoon-club",
        label: "03:15 PM",
        title: "Triple-Decker Club",
        angle: 98,
        tag: "Bistro Sandwich",
        theme: "burger",
        boardColor: "#ca8a04",
        glowColor: "rgba(254, 240, 138, 0.45)",
        accentColor: "#fef9c3",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "fbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb") ?? SIGNATURE_FOODS[10]!,
        slot: "afternoon-slice",
        label: "04:30 PM",
        title: "Artisan Pizza Slice",
        angle: 131,
        tag: "Wood-Fired Slice",
        theme: "pizza",
        boardColor: "#c2410c",
        glowColor: "rgba(254, 215, 170, 0.45)",
        accentColor: "#ffedd5",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "faaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa") ?? SIGNATURE_FOODS[9]!,
        slot: "sunset-pizza",
        label: "06:00 PM",
        title: "Salmon & Mozzarella Pizza",
        angle: 164,
        tag: "Gourmet White Base",
        theme: "pizza",
        boardColor: "#c85a2b",
        glowColor: "rgba(254, 215, 170, 0.45)",
        accentColor: "#fed7aa",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f4444444-4444-4444-a444-444444444444") ?? SIGNATURE_FOODS[3]!,
        slot: "dinner-steak",
        label: "07:30 PM",
        title: "Prime Filet Mignon",
        angle: 196,
        tag: "French Haute Cuisine",
        theme: "steak",
        boardColor: "#9f1239",
        glowColor: "rgba(254, 205, 211, 0.45)",
        accentColor: "#ffe4e6",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f6666666-6666-4666-a666-666666666666") ?? SIGNATURE_FOODS[5]!,
        slot: "dinner-pasta",
        label: "08:45 PM",
        title: "Creamy Salmon Fettuccine",
        angle: 229,
        tag: "Artisan Ribbon Pasta",
        theme: "pasta",
        boardColor: "#b87e14",
        glowColor: "rgba(254, 240, 138, 0.45)",
        accentColor: "#fef9c3",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f5555555-5555-4555-a555-555555555555") ?? SIGNATURE_FOODS[4]!,
        slot: "night-salmon",
        label: "10:00 PM",
        title: "Pan-Seared Grilled Salmon",
        angle: 262,
        tag: "Nordic Coastal",
        theme: "salmon",
        boardColor: "#be185d",
        glowColor: "rgba(251, 207, 232, 0.45)",
        accentColor: "#fce7f3",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f3333333-3333-4333-a333-333333333333") ?? SIGNATURE_FOODS[2]!,
        slot: "breakfast-brioche",
        label: "08:30 AM",
        title: "Golden Brioche Toast",
        angle: 295,
        tag: "Normandy Butter Delice",
        theme: "brioche",
        boardColor: "#c47a16",
        glowColor: "rgba(254, 240, 138, 0.45)",
        accentColor: "#fef9c3",
      },
      {
        food: SIGNATURE_FOODS.find((f) => f.id === "f9999999-9999-4999-a999-499999999999") ?? SIGNATURE_FOODS[8]!,
        slot: "morning-salad",
        label: "10:30 AM",
        title: "Garden Salad Bowl",
        angle: 327,
        tag: "Crisp Organic Greens",
        theme: "salad",
        boardColor: "#227b40",
        glowColor: "rgba(187, 247, 208, 0.45)",
        accentColor: "#dcfce7",
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

  const orbitRadius =
    screenSize === "mobile" ? 160 : screenSize === "tablet" ? 245 : 330;

  return (
    <section
      ref={ref}
      id="culinary-clock"
      className="relative min-h-screen py-8 sm:py-12 text-white flex flex-col items-center justify-center overflow-hidden select-none transition-colors duration-1000 ease-in-out"
      style={{
        backgroundColor: activeDish.boardColor,
      }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        setMouseParallax({ x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) });
      }}
    >
      {/* Ambient chromatic light halo morphing with the active food */}
      <div
        className="pointer-events-none absolute inset-0 blur-[150px] opacity-75 transition-all duration-1000 ease-out -z-10"
        style={{
          background: `radial-gradient(circle at calc(50% + ${Math.sin((activeDish.angle * Math.PI) / 180) * orbitRadius * 0.75}px) calc(50% + ${-Math.cos((activeDish.angle * Math.PI) / 180) * orbitRadius * 0.75}px), ${activeDish.glowColor}, transparent 65%)`,
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full blur-[160px] opacity-35 transition-all duration-1000 ease-out -z-10"
        style={{
          backgroundColor: activeDish.glowColor,
        }}
      />

      {/* Floating dynamic food symbols moving in the background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        style={{
          transform: `translate(${mouseParallax.x * -25}px, ${mouseParallax.y * -25}px)`,
        }}
      >
        {BOTANICALS.map((b, i) => (
          <svg
            key={i}
            viewBox="0 0 32 32"
            className="exp-leaf absolute transition-all duration-700 pointer-events-none drop-shadow-md"
            style={{
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              opacity: 0.82,
              ["--r" as string]: `${b.rot}deg`,
            }}
          >
            <FoodParticle theme={activeDish.theme} variant={b.variant} />
          </svg>
        ))}
      </div>

      <div className="relative w-full flex flex-col items-center justify-center gap-2 sm:gap-4 px-4 sm:px-6">
        {/* Modern Light Switch */}
        <div className="absolute top-0 right-3 sm:right-6 md:right-10 lg:right-14 z-30 pointer-events-auto">
          <ModernLightSwitch />
        </div>

        {/* 3D Clock Stage: Giant Modern Simplified Timepiece with Orbiting Dishes */}
        <div
          className="perspective-1000 relative mx-auto flex items-center justify-center select-none my-2 sm:my-4"
          style={{
            width: "min(98vw, 1100px)",
            height: screenSize === "mobile" ? "450px" : screenSize === "tablet" ? "620px" : "800px",
          }}
        >
          <div
            className="preserve-3d relative size-full flex items-center justify-center transition-transform duration-150 ease-out"
            style={{
              transform: `rotateX(${-mouseParallax.y * 6}deg) rotateY(${mouseParallax.x * 6}deg)`,
            }}
          >
            {/* THE ANALOG CLOCK (Center, Liquid Glass Dial, Simplified & Modern) */}
            <div
              ref={dialRef}
              onPointerDown={handleDialPointerDown}
              onPointerMove={handleDialPointerMove}
              onPointerUp={handleDialPointerUp}
              onPointerCancel={handleDialPointerUp}
              className="relative size-44 sm:size-56 md:size-64 lg:size-72 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/10 bg-black/30 backdrop-blur-2xl transition-all duration-700"
            >
              {/* Subtle inner concentric ring */}
              <div className="absolute inset-3 sm:inset-4 rounded-full border border-white/5 pointer-events-none" />

              {/* 12 Simplified Modern Hour Tick Markers (Clean, minimal, luxury timepiece) */}
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${i * 30}deg)` }}>
                  <span
                    className={`absolute left-1/2 top-2.5 -translate-x-1/2 rounded-full transition-colors duration-500 ${
                      i % 3 === 0
                        ? "h-3.5 w-1 bg-white/70 shadow-xs"
                        : "h-2 w-0.5 bg-white/20"
                    }`}
                  />
                  {/* Clean minimal numerals at 12, 3, 6, 9 */}
                  {i % 3 === 0 && (
                    <span
                      className="absolute left-1/2 top-6 -translate-x-1/2 font-display text-xs sm:text-sm font-medium text-white/50 tracking-wider"
                      style={{ transform: `rotate(${-i * 30}deg)` }}
                    >
                      {i === 0 ? "12" : i}
                    </span>
                  )}
                </div>
              ))}

              {/* Minimal Center Jewel Bearing with dynamic active accent */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-4 sm:size-5 rounded-full border-2 border-black/40 shadow-lg z-20 pointer-events-none transition-colors duration-700"
                style={{
                  backgroundColor: activeDish.accentColor,
                  boxShadow: `0 0 16px ${activeDish.accentColor}`,
                }}
              />

              {/* THE ROTATING ANALOG HAND / POINTER EXTENDING DIRECTLY TO ACTIVE DISH */}
              <div
                ref={handRef}
                className="absolute inset-0 pointer-events-none will-change-transform"
                style={{
                  transform: `rotate(${displayAngle}deg)`,
                }}
              >
                <div
                  className="absolute bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom rounded-full transition-colors duration-700"
                  style={{
                    height: `${orbitRadius}px`,
                    width: "2.5px",
                    background: `linear-gradient(to top, transparent 10%, ${activeDish.accentColor} 60%, ${activeDish.accentColor} 100%)`,
                    boxShadow: `0 0 16px ${activeDish.accentColor}`,
                  }}
                >
                  <div
                    className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full ring-4 ring-white/20 transition-colors duration-700"
                    style={{
                      backgroundColor: activeDish.accentColor,
                      boxShadow: `0 0 16px ${activeDish.accentColor}`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ALL 11 FOOD ITEMS IN ORBIT — PURE, BIG, MOUTHWATERING, ZERO TEXT CLUTTER */}
            {clockDishes.map((item, idx) => {
              const isActive = idx === activeDishIndex;
              const rad = (item.angle * Math.PI) / 180;
              const posX = Math.sin(rad) * orbitRadius;
              const posY = -Math.cos(rad) * orbitRadius;

              return (
                <button
                  key={item.slot}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      const el = typeof document !== "undefined" ? document.getElementById(`dish-${item.food.id}`) : null;
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                      } else {
                        window.location.href = `/menu?item=${item.food.id}`;
                      }
                    } else {
                      stepToDish(idx);
                    }
                  }}
                  className={`absolute flex flex-col items-center justify-center cursor-pointer will-change-transform select-none ${
                    isActive
                      ? "z-30 scale-130 sm:scale-140 md:scale-150 opacity-100 drop-shadow-[0_25px_45px_rgba(0,0,0,0.8)]"
                      : "z-10 scale-85 sm:scale-90 md:scale-95 opacity-55 hover:opacity-95 hover:scale-105 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                  }`}
                  style={{
                    left: `calc(50% + ${posX}px)`,
                    top: `calc(50% + ${posY}px)`,
                    transform: "translate(-50%, -50%)",
                    transition: "transform 0.4s cubic-bezier(0.34, 1.45, 0.64, 1), opacity 0.3s ease, filter 0.3s ease",
                  }}
                  aria-label={item.food.name}
                >
                  <div className="relative group flex flex-col items-center">
                    {/* Glowing ambient halo behind active food */}
                    {isActive && (
                      <div
                        className="absolute -inset-8 rounded-full blur-2xl -z-10 animate-pulse transition-all duration-700"
                        style={{ backgroundColor: activeDish.glowColor }}
                      />
                    )}
                    <img
                      src={item.food.image}
                      alt={item.food.name}
                      loading="eager"
                      draggable={false}
                      className={`w-auto object-contain transition-all duration-300 pointer-events-none ${
                        screenSize === "mobile"
                          ? isActive ? "h-28 max-w-[140px]" : "h-13 max-w-[65px]"
                          : screenSize === "tablet"
                          ? isActive ? "h-40 max-w-[200px]" : "h-18 max-w-[90px]"
                          : isActive ? "h-52 max-w-[260px]" : "h-24 max-w-[120px]"
                      } ${isActive ? "animate-float-slow" : ""}`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Minimal Modern Floating Control Dock */}
        <div className="relative z-30 mt-4 sm:mt-6 flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 shadow-xl backdrop-blur-xl transition-all duration-700">
          <Button
            size="icon"
            variant="ghost"
            className="size-7 rounded-full text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20"
            onClick={handlePrevDish}
            disabled={activeDishIndex === 0}
            aria-label="Previous"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 rounded-full px-2.5 text-xs font-medium gap-1 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          >
            {isAutoPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
            <span>{isAutoPlaying ? "Pause" : "Auto"}</span>
          </Button>

          <span className="h-3 w-px bg-white/20 mx-0.5" />

          {/* 11 Dish Progress Dots with Active Accent Color */}
          <div className="flex items-center gap-1.5 px-1.5">
            {clockDishes.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => stepToDish(dotIdx)}
                className={`size-2 rounded-full transition-all duration-300 cursor-pointer ${
                  dotIdx === activeDishIndex
                    ? "scale-140 shadow-xs ring-1 ring-white/50"
                    : "bg-white/25 hover:bg-white/60"
                }`}
                style={{
                  backgroundColor: dotIdx === activeDishIndex ? activeDish.accentColor : undefined,
                }}
                aria-label={`Dish ${dotIdx + 1}`}
              />
            ))}
          </div>

          <span className="h-3 w-px bg-white/20 mx-0.5" />

          <Button
            size="icon"
            variant="ghost"
            className="size-7 rounded-full text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20"
            onClick={handleNextDish}
            disabled={activeDishIndex === clockDishes.length - 1}
            aria-label="Next"
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
            <Link
              key={food.id}
              to="/menu"
              search={{ item: food.id }}
              className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md dark:border-white/10 dark:bg-card/70 cursor-pointer"
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

              <div className="mt-4 flex items-center justify-end pt-2 border-t border-border/40">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                  View in Menu &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const BOTANICAL_DISHES = [
  {
    id: "f9999999-9999-4999-a999-499999999999",
    name: "Crisp Mediterranean Garden Salad Bowl",
    badge: "Organic Greens & Citrus Vinaigrette",
    src: gardenSaladImg,
    alt: "Fresh Mediterranean garden salad",
    price: 420,
    theme: "salad",
    boardColor: "rgba(22, 70, 42, 0.80)",
    glowColor: "rgba(34, 197, 94, 0.40)",
    accentColor: "#4ade80",
  },
  {
    id: "f1111111-1111-4111-a111-111111111111",
    name: "Pizza Diavola Napoletana",
    badge: "Wood-Fired Crust & Spicy Salami",
    src: diavolaPizzaImg,
    alt: "Wood-fired Pizza Diavola",
    price: 720,
    theme: "pizza",
    boardColor: "rgba(120, 28, 22, 0.80)",
    glowColor: "rgba(239, 68, 68, 0.40)",
    accentColor: "#f87171",
  },
  {
    id: "f5555555-5555-4555-a555-555555555555",
    name: "Pan-Seared Norwegian Grilled Salmon",
    badge: "Atlantic Salmon & Citrus Beurre Blanc",
    src: grilledSalmonImg,
    alt: "Pan-seared Norwegian salmon fillet",
    price: 1250,
    theme: "salmon",
    boardColor: "rgba(130, 52, 22, 0.80)",
    glowColor: "rgba(249, 115, 22, 0.40)",
    accentColor: "#fb923c",
  },
  {
    id: "f4444444-4444-4444-a444-444444444444",
    name: "Prime Filet Mignon Demi-Glace",
    badge: "Center-Cut Prime Tenderloin & Cabernet Glaze",
    src: filetMignonImg,
    alt: "Prime Filet Mignon with red wine reduction",
    price: 1480,
    theme: "steak",
    boardColor: "rgba(75, 16, 32, 0.80)",
    glowColor: "rgba(244, 63, 94, 0.40)",
    accentColor: "#fb7185",
  },
  {
    id: "f6666666-6666-4666-a666-666666666666",
    name: "Creamy Salmon Fettuccine",
    badge: "Handmade Egg Ribbon Pasta & Flaked Salmon",
    src: fettuccineImg,
    alt: "Creamy Salmon Fettuccine on a ridged plate",
    price: 890,
    theme: "pasta",
    boardColor: "rgba(120, 80, 22, 0.80)",
    glowColor: "rgba(234, 179, 8, 0.40)",
    accentColor: "#facc15",
  },
  {
    id: "d-cappuccino-latte-art",
    name: "Artisan Velvet Cappuccino",
    badge: "Double Ristretto Espresso & Heart Rosetta",
    src: cappuccinoImg,
    alt: "Artisan cappuccino with rosetta latte art",
    price: 240,
    theme: "coffee",
    boardColor: "rgba(85, 48, 24, 0.80)",
    glowColor: "rgba(217, 119, 6, 0.40)",
    accentColor: "#fcd34d",
  },
  {
    id: "d-layered-iced-coffee",
    name: "Layered Iced Caramel Coffee",
    badge: "Cold Espresso Mist, Whole Milk & Caramel",
    src: layeredIcedCoffeeImg,
    alt: "Layered iced coffee with condensation",
    price: 290,
    theme: "iced-coffee",
    boardColor: "rgba(100, 58, 22, 0.80)",
    glowColor: "rgba(245, 158, 11, 0.40)",
    accentColor: "#fde047",
  },
];

export function CulinaryBotanicals({ s }: { s: Settings }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [m, setM] = useState({ x: 0, y: 0 });
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeIdxRef = useRef(activeIdx);
  useEffect(() => {
    activeIdxRef.current = activeIdx;
  }, [activeIdx]);

  const lastScrollTime = useRef<number>(0);
  const accumulatedDelta = useRef<number>(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll / Mouse Wheel driven dish switching
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const SCROLL_THRESHOLD = 45;
    const COOLDOWN_MS = 280;

    const handleWheel = (e: WheelEvent) => {
      // Ignore mostly horizontal scrolling gestures
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX) * 0.8) return;

      const currentIdx = activeIdxRef.current;
      const isAtEnd = currentIdx >= BOTANICAL_DISHES.length - 1;
      const isAtStart = currentIdx <= 0;

      // When scrolling down at the final dish (cycle completed):
      // Allow native page scroll to pass through and continue down towards the footer!
      if (e.deltaY > 0 && isAtEnd) {
        accumulatedDelta.current = 0;
        return;
      }

      // When scrolling up at the first dish:
      // Allow native page scroll to pass through and continue up!
      if (e.deltaY < 0 && isAtStart) {
        accumulatedDelta.current = 0;
        return;
      }

      // Within the cycle: intercept wheel to switch the botanical dish
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
        setActiveIdx((prev) => Math.min(BOTANICAL_DISHES.length - 1, prev + 1));
        setIsPaused(true);
      } else if (accumulatedDelta.current <= -SCROLL_THRESHOLD) {
        lastScrollTime.current = now;
        accumulatedDelta.current = 0;
        setActiveIdx((prev) => Math.max(0, prev - 1));
        setIsPaused(true);
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

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % BOTANICAL_DISHES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const activeDish = BOTANICAL_DISHES[activeIdx]!;

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden border-t border-border/40 text-white backdrop-blur-xl transition-colors duration-1000 ease-in-out"
      style={{
        backgroundColor: activeDish.boardColor,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setM({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
      }}
    >
      {/* Dynamic ambient color halo that morphs with the active food */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 blur-[140px] opacity-70 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 35% 50%, ${activeDish.glowColor}, transparent 70%)`,
        }}
      />

      {/* Floating particles that morph to match the active food */}
      <div className="absolute inset-0 -z-10" style={{ transform: `translate(${m.x * -30}px, ${m.y * -30}px)` }}>
        {BOTANICALS.map((b, i) => (
          <svg
            key={i}
            viewBox="0 0 32 32"
            className="exp-leaf absolute transition-all duration-700 pointer-events-none drop-shadow-md"
            style={{
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              opacity: 0.75,
              ["--r" as string]: `${b.rot}deg`,
            }}
          >
            <FoodParticle theme={activeDish.theme} variant={b.variant} />
          </svg>
        ))}
      </div>

      <div className="mx-auto grid min-h-[85vh] max-w-6xl items-center gap-12 px-5 py-24 md:grid-cols-2">
        <div className="relative mx-auto flex w-full max-w-md flex-col items-center justify-center">
          {/* Radial light aura behind the active dish */}
          <div
            className="pointer-events-none absolute size-72 sm:size-96 rounded-full blur-3xl transition-all duration-1000"
            style={{ backgroundColor: activeDish.glowColor }}
          />

          <div className="relative aspect-square w-full max-w-[380px] sm:max-w-[420px] flex items-center justify-center overflow-visible">
            {BOTANICAL_DISHES.map((dish, idx) => {
              const isActive = idx === activeIdx;
              return (
                <img
                  key={dish.id}
                  src={dish.src}
                  width={1024}
                  height={1024}
                  loading="lazy"
                  alt={dish.alt}
                  className={`absolute max-h-[320px] sm:max-h-[380px] w-auto object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.65)] transition-all duration-700 ease-out select-none ${
                    isActive
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-90 translate-y-3 pointer-events-none"
                  }`}
                  style={{
                    transform: isActive
                      ? `rotate(${-5 + m.x * 8}deg) translate(${m.x * 16}px, ${m.y * 16}px)`
                      : undefined,
                  }}
                />
              );
            })}
          </div>

          {/* Active Dish Name pill */}
          <Link
            to="/menu"
            search={{ item: activeDish.id }}
            className="group/pill relative mt-5 flex items-center gap-2.5 rounded-full border border-white/20 bg-black/45 hover:bg-black/60 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-lg transition-all duration-300"
          >
            <span
              className="size-2 rounded-full animate-pulse transition-colors duration-1000"
              style={{ backgroundColor: activeDish.accentColor }}
            />
            <span className="font-display text-sm tracking-wide">{activeDish.name}</span>
            <span className="text-white/40">·</span>
            <span className="text-white/80 group-hover/pill:text-white transition-colors">View in Menu &rarr;</span>
          </Link>

          {/* Subtle navigation dots & cycle indicator */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {BOTANICAL_DISHES.map((d, dotIdx) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActiveIdx(dotIdx)}
                  className={`size-2 rounded-full transition-all duration-300 cursor-pointer ${
                    dotIdx === activeIdx
                      ? "scale-130 shadow-xs ring-2 ring-white/60"
                      : "opacity-35 hover:opacity-75"
                  }`}
                  style={{
                    backgroundColor: dotIdx === activeIdx ? activeDish.accentColor : "white",
                  }}
                  aria-label={`Show ${d.name}`}
                />
              ))}
            </div>
            {activeIdx >= BOTANICAL_DISHES.length - 1 && (
              <span className="text-[10px] text-white/70 font-medium animate-pulse">
                · Cycle complete
              </span>
            )}
          </div>
        </div>

        {/* Right side story text */}
        <div className="z-10 text-left">
          <p
            className="eyebrow font-semibold tracking-widest uppercase transition-colors duration-1000"
            style={{ color: activeDish.accentColor }}
          >
            Our story · {activeDish.badge}
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-display text-white font-medium tracking-tight">
            {s.tagline}
          </h2>
          {s.about && (
            <p className="mt-6 max-w-md leading-relaxed text-white/85 text-sm sm:text-base">
              {s.about}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              asChild
              variant="accent"
              size="lg"
              className="shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <Link to="/about">More about us</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 bg-black/30 text-white hover:bg-black/50 hover:text-white backdrop-blur-sm"
            >
              <Link to="/menu" search={{ item: activeDish.id }} className="flex items-center gap-1.5">
                <span>View in Menu</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
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
