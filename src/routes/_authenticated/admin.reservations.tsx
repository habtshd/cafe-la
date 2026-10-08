import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/reservations")({ component: Reservations });

type Status = "pending" | "confirmed" | "completed" | "cancelled";

function Reservations() {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data = [] } = useQuery({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reservations").select("*").gte("reservation_date", today).order("reservation_date").order("reservation_time");
      if (error) throw error;
      return data;
    },
  });
  useEffect(() => {
    const ch = supabase.channel("res").on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => qc.invalidateQueries({ queryKey: ["admin-reservations"] })).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  async function update(id: string, patch: { status?: Status; reservation_date?: string; reservation_time?: string }) {
    const { error } = await supabase.from("reservations").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-reservations"] });
  }

  const groups = [
    { t: "Today", rows: data.filter((r) => r.reservation_date === today) },
    { t: "Upcoming", rows: data.filter((r) => r.reservation_date > today) },
  ];
  return (
    <div>
      <h1 className="text-3xl">Reservations</h1>
      {groups.map((g) => (
        <section key={g.t} className="mt-8">
          <h2 className="text-lg">{g.t}</h2>
          {g.rows.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">None.</p>
          ) : (
            <div className="mt-3 divide-y rounded-md border bg-card">
              {g.rows.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-4 p-4">
                  <div className="min-w-48 flex-1">
                    <p className="font-semibold">{r.customer_name} · {r.guests} guests</p>
                    <p className="text-xs text-muted-foreground"><a href={`tel:${r.customer_phone}`} className="underline">{r.customer_phone}</a>{r.special_request && ` — ${r.special_request}`}</p>
                  </div>
                  <Input type="date" defaultValue={r.reservation_date} className="h-8 w-36" onBlur={(e) => e.target.value !== r.reservation_date && update(r.id, { reservation_date: e.target.value })} />
                  <Input type="time" defaultValue={r.reservation_time} className="h-8 w-28" onBlur={(e) => e.target.value !== r.reservation_time && update(r.id, { reservation_time: e.target.value })} />
                  <span className={cn("rounded-full px-2 py-0.5 text-xs capitalize", r.status === "confirmed" ? "bg-success text-success-foreground" : r.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-secondary")}>{r.status}</span>
                  <div className="flex gap-1">
                    {r.status === "pending" && <Button size="sm" onClick={() => update(r.id, { status: "confirmed" })}>Confirm</Button>}
                    {r.status === "confirmed" && <Button size="sm" variant="outline" onClick={() => update(r.id, { status: "completed" })}>Complete</Button>}
                    {r.status !== "cancelled" && r.status !== "completed" && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => update(r.id, { status: "cancelled" })}>Cancel</Button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
