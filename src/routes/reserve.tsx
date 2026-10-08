import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { settingsQuery } from "@/lib/queries";
import { createReservation } from "@/lib/cafe.functions";

export const Route = createFileRoute("/reserve")({
  head: () => ({
    meta: [
      { title: "Reserve a table — La Nouvelle Cafe" },
      { name: "description", content: "Request a table at La Nouvelle Cafe." },
      { property: "og:title", content: "Reserve a table — La Nouvelle Cafe" },
      { property: "og:description", content: "Send a table reservation request." },
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
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({ name: "", phone: "", date: today, time: "12:00", guests: 2, note: "" });

  if (!s.offers_reservations) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <h1 className="text-3xl">Reservations aren't available</h1>
          <Button asChild className="mt-6"><Link to="/contact">Contact us</Link></Button>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-lg px-5 py-16">
        <h1 className="text-4xl">Reserve a table</h1>
        {done ? (
          <div className="mt-8 rounded-md border bg-card p-6">
            <p className="text-lg font-semibold">Request received</p>
            <p className="mt-2 text-muted-foreground">We'll call {f.phone} to confirm your table.</p>
          </div>
        ) : (
          <form
            className="mt-8 grid gap-4 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await submit({ data: { customerName: f.name, customerPhone: f.phone, date: f.date, time: f.time, guests: f.guests, specialRequest: f.note } });
                setDone(true);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Couldn't send request");
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="space-y-1.5"><Label>Name</Label><Input required minLength={2} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input required type="tel" minLength={7} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Date</Label><Input required type="date" min={today} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Time</Label><Input required type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Guests</Label><Input required type="number" min={1} max={50} value={f.guests} onChange={(e) => setF({ ...f, guests: Number(e.target.value) })} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Special request (optional)</Label><Textarea maxLength={500} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
            <Button type="submit" size="lg" disabled={busy} className="sm:col-span-2">{busy ? "Sending…" : "Request table"}</Button>
          </form>
        )}
      </div>
    </SiteShell>
  );
}
