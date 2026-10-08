import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAdminSettings, updateAdminSettings } from "@/lib/admin.functions";
import type { Settings as S } from "@/lib/cafe.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsPage });

const TEXT: { k: keyof S; label: string; area?: boolean; placeholder?: string }[] = [
  { k: "cafe_name", label: "Cafe name" },
  { k: "tagline", label: "Headline on home page" },
  { k: "about", label: "About text", area: true },
  { k: "address", label: "Address", area: true },
  { k: "opening_hours", label: "Opening hours", area: true, placeholder: "Mon–Sun 7:00 – 22:00" },
  { k: "phone", label: "Phone" },
  { k: "email", label: "Email" },
  { k: "map_url", label: "Google Maps link" },
  { k: "instagram_url", label: "Instagram link" },
  { k: "facebook_url", label: "Facebook link" },
  { k: "telegram_url", label: "Telegram link" },
  { k: "tiktok_url", label: "TikTok link" },
];
const TOGGLES: { k: keyof S; label: string }[] = [
  { k: "accepting_orders", label: "Accepting online orders" },
  { k: "offers_pickup", label: "Pickup" },
  { k: "offers_delivery", label: "Delivery" },
  { k: "offers_dine_in", label: "Dine-in" },
  { k: "offers_reservations", label: "Table reservations" },
];

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => getAdminSettings(),
  });
  const [f, setF] = useState<S | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) setF(data); }, [data]);
  if (!f) return <p className="text-muted-foreground">Loading…</p>;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateAdminSettings({ data: f! });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["settings"] });
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Cafe settings</h1>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
      </div>
      <section className="space-y-3">
        <h2 className="text-lg">Ordering</h2>
        <div className="grid gap-3 rounded-md border bg-card p-4 sm:grid-cols-2">
          {TOGGLES.map((t) => (
            <label key={t.k} className="flex items-center gap-3 text-sm">
              <Switch checked={!!f[t.k]} onCheckedChange={(v) => setF({ ...f, [t.k]: v })} /> {t.label}
            </label>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Delivery fee (ETB)</Label><Input type="number" min={0} value={f.delivery_fee} onChange={(e) => setF({ ...f, delivery_fee: e.target.value as unknown as number })} /></div>
          <div className="space-y-1.5"><Label>Typical prep time (minutes)</Label><Input type="number" min={0} value={f.prep_time_minutes} onChange={(e) => setF({ ...f, prep_time_minutes: e.target.value as unknown as number })} /></div>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg">Website content</h2>
        <p className="text-sm text-muted-foreground">Leave anything blank to hide it from the website.</p>
        {TEXT.map((t) => (
          <div key={t.k} className="space-y-1.5">
            <Label>{t.label}</Label>
            {t.area ? (
              <Textarea rows={3} value={String(f[t.k] ?? "")} placeholder={t.placeholder} onChange={(e) => setF({ ...f, [t.k]: e.target.value })} />
            ) : (
              <Input value={String(f[t.k] ?? "")} onChange={(e) => setF({ ...f, [t.k]: e.target.value })} />
            )}
          </div>
        ))}
      </section>
    </form>
  );
}
