import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, LayoutGrid, LogOut, Receipt, Settings, UtensilsCrossed, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Staff — La Nouvelle Cafe" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

export function useMyRoles() {
  return useQuery({
    queryKey: ["my-roles"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user!.id);
      const roles = (data ?? []).map((r) => r.role);
      return { isAdmin: roles.includes("admin"), isStaff: roles.length > 0, email: u.user?.email ?? "" };
    },
  });
}

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, exact: true },
  { to: "/admin/orders", label: "Orders", icon: Receipt },
  { to: "/admin/reservations", label: "Reservations", icon: CalendarDays },
  { to: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/settings", label: "Cafe settings", icon: Settings, admin: true },
  { to: "/admin/staff", label: "Staff", icon: Users, admin: true },
] as const;

function AdminLayout() {
  const { data: me, isLoading } = useMyRoles();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  if (!me?.isStaff)
    return (
      <div className="grid min-h-screen place-items-center px-5 text-center">
        <div>
          <h1 className="text-2xl">No staff access yet</h1>
          <p className="mt-2 text-muted-foreground">Signed in as {me?.email}. Ask an admin to add you on the Staff page.</p>
          <Button variant="outline" className="mt-6" onClick={signOut}>Sign out</Button>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <Link to="/"><Logo variant="white" className="h-9" /></Link>
          <button onClick={signOut} className="md:hidden" aria-label="Sign out"><LogOut className="size-5" /></button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {NAV.filter((n) => !("admin" in n) || me.isAdmin).map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: "exact" in n }}
              className="flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm opacity-80 hover:bg-sidebar-accent hover:opacity-100"
              activeProps={{ className: "bg-sidebar-accent !opacity-100 font-semibold" }}
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 hidden w-60 border-t border-sidebar-border p-4 text-xs md:block">
          <p className="truncate opacity-60">{me.email}</p>
          <button onClick={signOut} className="mt-2 flex items-center gap-2 opacity-80 hover:opacity-100"><LogOut className="size-3.5" /> Sign out</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-8"><Outlet /></main>
    </div>
  );
}
