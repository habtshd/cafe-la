import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff sign in — La Nouvelle Café" },
      { name: "description", content: "Sign in to the La Nouvelle Café staff area." },
      { property: "og:title", content: "Staff sign in — La Nouvelle Café" },
      { property: "og:description", content: "Staff area for La Nouvelle Café." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem("ln-staff-user");
    if (existing) {
      navigate({ to: "/admin" });
    }
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      localStorage.setItem("ln-staff-user", JSON.stringify({ email, role: "admin" }));
      toast.success("Welcome back to staff portal!");
      navigate({ to: "/admin" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/50 px-5">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-8 shadow-soft">
        <Link to="/"><Logo className="mx-auto h-12" /></Link>
        <h1 className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground">Staff Portal</h1>
        <p className="mt-1 text-center text-xs text-muted-foreground">Sign in to manage orders, reservations & menu</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" required placeholder="admin@lanouvellecafe.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" required minLength={4} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={busy}>Sign in to Portal</Button>
        </form>
      </div>
    </div>
  );
}
