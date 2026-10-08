import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Coffee, Sun, CheckCircle2, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { settingsQuery } from "@/lib/queries";
import { createReservation } from "@/lib/cafe.functions";
import outdoorCafeImg from "@/assets/charming-vector-illustration-cozy-cafe-with-outdoor-seating-vector-illustration_1176913-47425.jpg";
import indoorLoungeImg from "@/assets/istockphoto-2037359827-612x612.jpg";

export const Route = createFileRoute("/reserve")({
  head: () => ({
    meta: [
      { title: "Reserve a Table — La Nouvelle Cafe" },
      { name: "description", content: "Request an indoor lounge or outdoor terrace table at La Nouvelle Cafe." },
      { property: "og:title", content: "Reserve a Table — La Nouvelle Cafe" },
      { property: "og:description", content: "Send a table reservation request for indoor or outdoor seating." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: Reserve,
});

function Reserve() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  const submit = useServerFn(createReservation);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seatingArea, setSeatingArea] = useState<"indoor" | "outdoor">("indoor");
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({ name: "", phone: "", date: today, time: "19:00", guests: 2, note: "" });

  if (!s.offers_reservations) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <h1 className="text-3xl font-display">Reservations aren't available</h1>
          <p className="mt-2 text-muted-foreground">We welcome walk-ins anytime during opening hours.</p>
          <Button asChild className="mt-6"><Link to="/contact">Contact us</Link></Button>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-5 pt-28 pb-20">
        <div className="mb-10 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <Sparkles className="size-3.5" />
            <span>Table Service</span>
          </div>
          <h1 className="mt-2 text-4xl sm:text-5xl font-display text-foreground">Reserve a table</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Choose your preferred dining atmosphere and book your spot at La Nouvelle.
          </p>
        </div>

        {done ? (
          <div className="mx-auto max-w-md rounded-2xl border border-primary/20 bg-card p-8 text-center shadow-soft">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-accent/20 text-accent mb-4">
              <CheckCircle2 className="size-6" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Reservation Request Received</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Thank you, <span className="font-medium text-foreground">{f.name}</span>. We've received your request for a table in the{" "}
              <span className="font-semibold text-foreground">
                {seatingArea === "outdoor" ? "Outdoor Parisian Terrace" : "Indoor Lounge & Bar"}
              </span>.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              We'll call you at <span className="font-semibold text-foreground">{f.phone}</span> to confirm availability.
            </p>
            <Button asChild className="mt-6" variant="accent">
              <Link to="/menu">Explore Menu While Waiting</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] items-start">
            {/* Seating Area Selection Cards */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                1. Select Preferred Seating Area
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Indoor Card */}
                <button
                  type="button"
                  onClick={() => setSeatingArea("indoor")}
                  className={`group relative overflow-hidden rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    seatingArea === "indoor"
                      ? "border-accent ring-2 ring-accent/50 bg-card shadow-md"
                      : "border-border bg-card/60 opacity-80 hover:opacity-100 hover:border-foreground/30"
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
                    <img
                      src={indoorLoungeImg}
                      alt="Indoor Espresso Bar & Dining Lounge"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 rounded-full bg-background/85 px-2.5 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur-sm flex items-center gap-1">
                      <Coffee className="size-3 text-accent" />
                      <span>Indoor</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-display text-base font-semibold text-foreground">Espresso Bar & Lounge</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Warm pendant lights, cozy banquette seating, and intimate dinner dining.
                    </p>
                  </div>
                </button>

                {/* Outdoor Card */}
                <button
                  type="button"
                  onClick={() => setSeatingArea("outdoor")}
                  className={`group relative overflow-hidden rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    seatingArea === "outdoor"
                      ? "border-accent ring-2 ring-accent/50 bg-card shadow-md"
                      : "border-border bg-card/60 opacity-80 hover:opacity-100 hover:border-foreground/30"
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
                    <img
                      src={outdoorCafeImg}
                      alt="Outdoor Parisian Terrace"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 rounded-full bg-background/85 px-2.5 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur-sm flex items-center gap-1">
                      <Sun className="size-3 text-amber-500" />
                      <span>Terrace</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-display text-base font-semibold text-foreground">Parisian Terrace</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sunlit open-air terrace with awnings, fresh breeze, and cafe tables.
                    </p>
                  </div>
                </button>
              </div>

              <div className="mt-6 rounded-xl border border-border/70 bg-secondary/20 p-4 text-xs text-muted-foreground">
                <p>
                  💡 <span className="font-semibold text-foreground">Note:</span> Seating preferences are accommodated based on availability upon arrival.
                </p>
              </div>
            </div>

            {/* Reservation Form */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                2. Guest & Schedule Details
              </p>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  try {
                    const areaNote = seatingArea === "outdoor" ? "[Seating: Outdoor Parisian Terrace]" : "[Seating: Indoor Bar & Lounge]";
                    const fullRequest = f.note ? `${areaNote} ${f.note}` : areaNote;

                    await submit({
                      data: {
                        customerName: f.name,
                        customerPhone: f.phone,
                        date: f.date,
                        time: f.time,
                        guests: f.guests,
                        specialRequest: fullRequest,
                      },
                    });
                    setDone(true);
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Couldn't send request");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Full Name</Label>
                  <Input required minLength={2} placeholder="Abebe Bikila" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Phone Number</Label>
                  <Input required type="tel" minLength={7} placeholder="+251 91 123 4567" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input required type="date" min={today} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Time</Label>
                  <Input required type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Number of Guests</Label>
                  <Input required type="number" min={1} max={50} value={f.guests} onChange={(e) => setF({ ...f, guests: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Special requests (optional)</Label>
                  <Textarea placeholder="Anniversary celebration, high chair, window table, etc." maxLength={500} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
                </div>
                <Button type="submit" size="lg" variant="accent" disabled={busy} className="sm:col-span-2 mt-2">
                  {busy ? "Sending Request…" : "Request Table Reservation"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
