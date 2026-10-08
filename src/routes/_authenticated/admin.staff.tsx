import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { addStaff, listStaff, removeStaff } from "@/lib/cafe.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/staff")({ component: Staff });

function Staff() {
  const qc = useQueryClient();
  const list = useServerFn(listStaff);
  const add = useServerFn(addStaff);
  const remove = useServerFn(removeStaff);
  const { data = [], error } = useQuery({ queryKey: ["staff"], queryFn: () => list() });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");

  if (error) return <p className="text-destructive">{(error as Error).message}</p>;
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl">Staff</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Team members first create an account on the staff sign-in page, then you add their email here. Staff can manage orders, reservations and the menu; admins can also change settings and staff.
      </p>
      <form
        className="mt-6 flex flex-wrap gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await add({ data: { email, role } });
            setEmail("");
            toast.success("Access granted");
            qc.invalidateQueries({ queryKey: ["staff"] });
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed");
          }
        }}
      >
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="max-w-xs" />
        <select value={role} onChange={(e) => setRole(e.target.value as "staff" | "admin")} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        <Button type="submit">Add</Button>
      </form>
      <ul className="mt-8 divide-y rounded-md border bg-card">
        {data.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 p-4 text-sm">
            <span>{r.email || r.user_id} {r.isMe && <span className="text-muted-foreground">(you)</span>}</span>
            <span className="flex items-center gap-3">
              <span className="capitalize text-muted-foreground">{r.role}</span>
              {!r.isMe && (
                <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => {
                  try { await remove({ data: { roleId: r.id } }); qc.invalidateQueries({ queryKey: ["staff"] }); } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
                }}>Remove</Button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
