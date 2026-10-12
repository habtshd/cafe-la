import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, ArrowRight, Utensils, Receipt } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderJourneyVisualizer } from "@/components/site/OrderJourneyVisualizer";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Live Orders — La Nouvelle Café & Restaurant" },
      {
        name: "description",
        content:
          "Track your live order journey at La Nouvelle from order taken, chef station, prep, wood-fired cooking to delivery.",
      },
    ],
  }),
  component: OrdersPage,
});

interface RecentOrder {
  orderNumber: string;
  token: string;
  createdAt: string;
}

function OrdersPage() {
  const navigate = useNavigate();
  const [tokenInput, setTokenInput] = useState("");
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ln-recent-orders");
      if (stored) {
        setRecentOrders(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = tokenInput.trim();
    if (!query) return;

    // Navigate to the order token route
    navigate({
      to: "/order/$token",
      params: { token: query },
    });
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6 space-y-12">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Orders
          </h1>

          {/* Quick Token Lookup Bar */}
          <form onSubmit={handleLookup} className="mt-8 flex items-center max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter your Order Tracking Token or ID..."
              className="h-12 pl-10 pr-24 rounded-full border-border/80 bg-card/80 backdrop-blur-md text-xs sm:text-sm shadow-md"
            />
            <Button
              type="submit"
              size="sm"
              variant="accent"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-4 h-9 font-semibold"
            >
              Track
            </Button>
          </form>
        </div>

        {/* Recent Orders Pill Bar if any exist */}
        {recentOrders.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-xs font-semibold text-muted-foreground">Your Recent Orders:</span>
            {recentOrders.slice(0, 4).map((rec) => (
              <Link
                key={rec.token}
                to="/order/$token"
                params={{ token: rec.token }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 hover:bg-secondary px-3 py-1 text-xs font-mono font-medium text-foreground transition-colors shadow-xs"
              >
                <Receipt className="size-3 text-accent" />
                <span>{rec.orderNumber}</span>
                <ArrowRight className="size-3 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}

        {/* The Animated Order Journey Visualizer Component */}
        <OrderJourneyVisualizer currentStage="cooking" orderNumber="LN-84210" interactive={true} />

        {/* Quick Menu & Reservation Links */}
        <div className="mt-12 rounded-3xl border border-border/60 bg-secondary/30 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="font-display text-xl font-bold text-foreground">Want to add something more?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Explore our wood-fired pizza, prime steaks, seafood, or handcrafted drinks.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button asChild variant="accent">
              <Link to="/menu" className="flex items-center gap-1.5">
                <Utensils className="size-4" />
                <span>View Menu</span>
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/reserve">
                <span>Reserve a Table</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
