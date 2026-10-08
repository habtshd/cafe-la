import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { UtensilsCrossed as Coffee, Printer } from "lucide-react";
import bag from "@/assets/exp-bag.png";
import beanCup from "@/assets/exp-beancup.png";
import iced from "@/assets/exp-iced.png";
import tiltedCup from "@/assets/exp-cup.png";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatBirr } from "@/lib/format";
import type { PublicMenuItem, Settings } from "@/lib/cafe.functions";

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => setR(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return r;
}

/* 1 — A drawn glass fills, then pours away to open the page */
export function PourIntro() {
  const [phase, setPhase] = useState<"fill" | "pour" | "done">("fill");
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return setPhase("done");
    const a = setTimeout(() => setPhase("pour"), 1700);
    const b = setTimeout(() => setPhase("done"), 2900);
    return () => (clearTimeout(a), clearTimeout(b));
  }, [reduced]);
  if (phase === "done") return null;
  return (
    <div
      className={`fixed inset-0 z-[60] grid place-items-center bg-background transition-opacity duration-700 ${phase === "pour" ? "opacity-0 delay-500" : ""}`}
      onClick={() => setPhase("done")}
      aria-hidden
    >
      <svg viewBox="0 0 200 200" className={`w-48 text-primary ${phase === "pour" ? "exp-cup-pour" : ""}`}>
        <defs>
          <clipPath id="cupClip"><path d="M50 70 h90 l-10 80 a20 20 0 0 1 -20 18 h-30 a20 20 0 0 1 -20 -18z" /></clipPath>
        </defs>
        <g clipPath="url(#cupClip)">
          <rect x="40" y="70" width="110" height="110" className="exp-fill fill-primary" />
        </g>
        <path d="M50 70 h90 l-10 80 a20 20 0 0 1 -20 18 h-30 a20 20 0 0 1 -20 -18z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" className="exp-draw" pathLength={1} />
        <path d="M138 88 a18 18 0 0 1 0 36 h-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="exp-draw" pathLength={1} />
        <path d="M80 50 q8 -10 0 -20 M100 50 q8 -10 0 -20 M120 50 q8 -10 0 -20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="exp-steam" />
      </svg>
    </div>
  );
}

/* 2 — Lit studio turntable you can grab and spin */
export function Studio({ name }: { name: string }) {
  const [angle, setAngle] = useState(-20);
  const drag = useRef<{ x: number; a: number } | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = () => {
      if (!drag.current) setAngle((a) => a + 0.12);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);
  const down = (e: RPointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, a: angle };
  };
  const move = (e: RPointerEvent) => drag.current && setAngle(drag.current.a + (e.clientX - drag.current.x) * 0.5);
  const objects = [
    { src: bag, w: 768, h: 1024, at: 0, cls: "h-72 sm:h-96", alt: "Basket of croissants beside a silver cloche" },
    { src: beanCup, w: 1024, h: 1024, at: 180, cls: "h-40 sm:h-56", alt: "Plate of mushroom tagliatelle" },
  ];
  return (
    <section className="relative isolate overflow-hidden bg-espresso text-espresso-foreground">
      <div className="exp-spotlight absolute inset-0 -z-10" />
      <div className="mx-auto grid min-h-[92vh] max-w-6xl items-center gap-10 px-5 pb-16 pt-24 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="eyebrow opacity-70">{name}</p>
          <h1 className="mt-4 text-5xl leading-[1.02] sm:text-7xl">A taste worth <em className="text-accent">discovering.</em></h1>
          <p className="mt-6 max-w-sm opacity-75">French-inspired cuisine, crafted with passion in the heart of Addis Ababa. Grab the table and spin it.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="accent"><Link to="/menu">Explore our menu</Link></Button>
            <Button asChild size="lg" variant="heroOutline"><Link to="/reserve">Reserve a table</Link></Button>
          </div>
        </div>
        <div
          className="relative h-[460px] cursor-grab touch-pan-y select-none active:cursor-grabbing"
          style={{ perspective: 1100 }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          <div className="exp-floor absolute bottom-8 left-1/2 h-24 w-[85%] -translate-x-1/2 rounded-[50%]" />
          <div className="absolute inset-0" style={{ transformStyle: "preserve-3d", transform: `rotateX(-6deg) rotateY(${angle}deg)` }}>
            {objects.map((o) => (
              <div key={o.alt} className="absolute bottom-16 left-1/2" style={{ transformStyle: "preserve-3d", transform: `rotateY(${o.at}deg) translateZ(110px) translateX(-50%)` }}>
                <img
                  src={o.src} width={o.w} height={o.h} alt={o.alt} draggable={false}
                  className={`${o.cls} w-auto max-w-none drop-shadow-2xl`}
                  style={{ transform: `rotateY(${-(angle + o.at)}deg)` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* 3 — Four product cards that lean toward your hand */
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
      className="group rounded-lg border bg-card p-4 text-left shadow-soft transition-transform duration-200 ease-out will-change-transform"
      style={{ transform: `perspective(800px) rotateY(${t.x * 14}deg) rotateX(${-t.y * 14}deg) translateZ(0)` }}
    >
      <div className="aspect-square overflow-hidden rounded-md bg-secondary">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground/40"><Coffee className="size-10" /></div>
        )}
      </div>
      <h3 className="mt-4 text-lg leading-tight group-hover:text-primary">{item.name}</h3>
      <p className="mt-1 font-semibold">{formatBirr(item.price)}</p>
      {!item.available && <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-destructive">Sold out</p>}
    </button>
  );
}

export function LeanCards({ items, onSelect }: { items: PublicMenuItem[]; onSelect: (i: PublicMenuItem) => void }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted-foreground">From the menu</p>
          <h2 className="mt-2 text-4xl sm:text-5xl">Reach for one</h2>
        </div>
        <Link to="/menu" className="text-sm font-semibold text-primary hover:underline">Full menu →</Link>
      </div>
      {items.length ? (
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {items.map((i) => <LeanCard key={i.id} item={i} onSelect={() => onSelect(i)} />)}
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-10 text-center text-muted-foreground">Our menu is being prepared.</p>
      )}
    </section>
  );
}

/* 4 — Lemonade turning on a clock face as you scroll */
export function LatteClock({ hours }: { hours: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const total = r.height - window.innerHeight;
      setP(Math.max(0, Math.min(1, -r.top / total)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const hour = 8 + Math.round(p * 14); // 8:00 → 22:00 sweep
  return (
    <section ref={ref} className="relative h-[220vh] bg-secondary/60">
      <div className="sticky top-0 grid h-screen place-items-center overflow-hidden px-5">
        <div className="relative grid place-items-center" style={{ width: "min(80vw, 62vh, 560px)", height: "min(80vw, 62vh, 560px)" }}>
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 30}deg)` }}>
              <span className={`absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-primary/40 ${i % 3 === 0 ? "h-5 w-1" : "h-2.5 w-0.5"}`} />
            </div>
          ))}
          <div className="absolute inset-0" style={{ transform: `rotate(${p * 420}deg)` }}>
            <span className="absolute bottom-1/2 left-1/2 h-[44%] w-0.5 -translate-x-1/2 origin-bottom rounded-full bg-accent" />
          </div>
          <img
            src={iced} width={768} height={1024} loading="lazy" alt="Mint lemonade"
            className="relative h-[58%] w-auto drop-shadow-2xl"
            style={{ transform: `rotate(${(p - 0.5) * 50}deg) scale(${0.9 + p * 0.15})` }}
          />
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
          <p className="font-display text-4xl tabular-nums">{String(hour).padStart(2, "0")}:00</p>
          <p className="eyebrow mt-2 text-muted-foreground">{hours || "Breakfast to late dinner"}</p>
        </div>
      </div>
    </section>
  );
}

/* 5 — Herbs drifting weightless behind a tilted bowl */
const BEANS = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 18 + ((i * 7) % 26),
  dur: 9 + ((i * 5) % 10),
  delay: -((i * 3) % 12),
  rot: (i * 47) % 360,
}));

export function DriftBeans({ s }: { s: Settings }) {
  const [m, setM] = useState({ x: 0, y: 0 });
  return (
    <section
      className="relative isolate overflow-hidden bg-espresso text-espresso-foreground"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setM({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
      }}
    >
      <div className="absolute inset-0 -z-10" style={{ transform: `translate(${m.x * -30}px, ${m.y * -30}px)` }}>
        {BEANS.map((b, i) => (
          <svg key={i} viewBox="0 0 20 28" className="exp-bean absolute text-accent/60"
            style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`, ["--r" as string]: `${b.rot}deg` }}>
            <path d="M10 1 C19 8, 19 20, 10 27 C1 20, 1 8, 10 1Z" fill="currentColor" />
            <path d="M10 3 L10 25" stroke="var(--espresso)" strokeWidth="1.6" fill="none" />
          </svg>
        ))}
      </div>
      <div className="mx-auto grid min-h-[80vh] max-w-6xl items-center gap-10 px-5 py-24 md:grid-cols-2">
        <img
          src={tiltedCup} width={1024} height={1024} loading="lazy" alt="Caesar salad"
          className="mx-auto w-[80%] transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${-8 + m.x * 10}deg) translate(${m.x * 20}px, ${m.y * 20}px)` }}
        />
        <div>
          <p className="eyebrow opacity-70">Our story</p>
          <h2 className="mt-3 text-4xl sm:text-5xl">{s.tagline}</h2>
          {s.about && <p className="mt-6 max-w-md leading-relaxed opacity-80">{s.about}</p>}
          <Button asChild variant="accent" size="lg" className="mt-8"><Link to="/about">More about us</Link></Button>
        </div>
      </div>
    </section>
  );
}

/* 6 — Thermal printer feeds your receipt out of its slot */
export function ReceiptPrinter({ cafeName }: { cafeName: string }) {
  const cart = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && (setRun((r) => r || 1), io.disconnect()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const now = new Date();
  return (
    <section ref={ref} className="mx-auto grid max-w-6xl items-start gap-12 px-5 py-24 md:grid-cols-2">
      <div className="md:pt-10">
        <p className="eyebrow text-muted-foreground">Your order</p>
        <h2 className="mt-2 text-4xl sm:text-5xl">Fresh off the press</h2>
        <p className="mt-4 max-w-sm text-muted-foreground">
          {cart.count ? "Here's what's in your bag. Pay when you receive it." : "Your receipt is empty. Add something from the menu and it prints right here."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {cart.count ? (
            <Button asChild size="lg"><Link to="/checkout">Checkout</Link></Button>
          ) : (
            <Button asChild size="lg"><Link to="/menu">Browse menu</Link></Button>
          )}
          <Button size="lg" variant="outline" onClick={() => setRun((r) => r + 1)}><Printer /> Reprint</Button>
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
          <div key={run} className={`exp-paper bg-card px-5 pb-8 pt-6 font-mono text-xs shadow-soft ${run ? "exp-feed" : "-translate-y-full"}`}>
            <p className="text-center font-display text-base">{cafeName}</p>
            <p className="mt-1 text-center text-muted-foreground">{now.toLocaleDateString()} · {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            <div className="my-3 border-t border-dashed" />
            {cart.lines.length ? (
              cart.lines.map((l) => (
                <div key={l.key} className="flex justify-between gap-3 py-0.5">
                  <span className="truncate">{l.quantity}× {l.name}</span>
                  <span>{formatBirr(l.price * l.quantity)}</span>
                </div>
              ))
            ) : (
              <p className="py-2 text-center text-muted-foreground">— nothing yet —</p>
            )}
            <div className="my-3 border-t border-dashed" />
            <div className="flex justify-between font-bold"><span>Subtotal</span><span>{formatBirr(cart.subtotal)}</span></div>
            <p className="mt-4 text-center text-muted-foreground">Thank you · Merci · አመሰግናለሁ</p>
          </div>
        </div>
      </div>
    </section>
  );
}
