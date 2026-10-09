import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useIsTelegram, useTelegramMainButton } from "@/hooks/use-telegram";
import { useTheme } from "@/lib/theme";
import { Logo } from "./Logo";
import { CartSheet } from "./CartSheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { settingsQuery } from "@/lib/queries";
import { formatBirr } from "@/lib/format";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const cart = useCart();
  const { isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: s } = useQuery(settingsQuery);
  const isTg = useIsTelegram();
  const openCart = useCallback(() => cart.setOpen(true), [cart]);
  useTelegramMainButton(isTg && cart.count > 0 && !cart.open ? `View cart · ${formatBirr(cart.subtotal)}` : null, openCart);

  // Track scroll position to clip scrolling content when user scrolls while staying 100% transparent at top
  const [isClipped, setIsClipped] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsClipped(window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col">
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 transition-all duration-300",
          !isClipped
            ? "bg-transparent border-b border-transparent"
            : isDark
            ? "bg-[#282828]/92 backdrop-blur-md border-b border-white/10 shadow-sm"
            : "bg-background/92 backdrop-blur-md border-b border-border/80 shadow-sm"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="La Nouvelle home">
            <Logo variant={isDark ? "white" : "brown"} className="h-14 -my-2" />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isDark
                    ? "text-white/80 hover:text-white drop-shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                activeProps={{ className: isDark ? "text-white font-semibold drop-shadow-sm" : "text-foreground font-semibold" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            {s?.offers_reservations && (
              <Link
                to="/reserve"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isDark
                    ? "text-white/80 hover:text-white drop-shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                activeProps={{ className: isDark ? "text-white font-semibold drop-shadow-sm" : "text-foreground font-semibold" }}
              >
                Reserve
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-6">
            <Link
              to="/menu"
              className={cn(
                "hidden text-sm font-semibold transition-colors hover:text-accent md:inline-flex",
                isDark ? "text-white drop-shadow-sm" : "text-foreground"
              )}
            >
              Order now
            </Link>
            <button
              onClick={() => cart.setOpen(true)}
              className={cn(
                "relative p-1.5 transition-colors hover:text-accent",
                isDark ? "text-white drop-shadow-sm" : "text-foreground"
              )}
              aria-label="Open cart"
            >
              <ShoppingBag className="size-5" />
              {cart.count > 0 && (
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                  {cart.count}
                </span>
              )}
            </button>

            <button className={cn("p-1.5 md:hidden", isDark ? "text-white" : "text-foreground")} onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
              {mobileOpen ? <X className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="bg-background/95 px-5 py-3 shadow-md backdrop-blur md:hidden">
            {[...NAV, ...(s?.offers_reservations ? [{ to: "/reserve", label: "Reserve" } as const] : [])].map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMobileOpen(false)} className="block py-2.5 text-base">
                {n.label}
              </Link>
            ))}
            <Link to="/menu" onClick={() => setMobileOpen(false)} className="block py-2.5 text-base font-semibold">
              Order now
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-espresso text-espresso-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
          <div>
            <Logo variant="white" className="h-12" />
            {s?.tagline && <p className="mt-4 max-w-xs text-sm opacity-90">{s.tagline}</p>}
          </div>
          <div className="text-sm">
            <p className="eyebrow mb-3 opacity-60">Visit</p>
            {s?.address ? <p className="whitespace-pre-line opacity-90">{s.address}</p> : null}
            {s?.opening_hours ? <p className="mt-2 whitespace-pre-line opacity-70">{s.opening_hours}</p> : null}
            {s?.phone && <a href={`tel:${s.phone}`} className="mt-2 block opacity-90 hover:opacity-100">{s.phone}</a>}
          </div>
          <div className="text-sm">
            <p className="eyebrow mb-3 opacity-60">Follow</p>
            <div className="flex flex-col gap-1.5 opacity-90">
              {s?.instagram_url && <a href={s.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}
              {s?.facebook_url && <a href={s.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}
              {s?.telegram_url && <a href={s.telegram_url} target="_blank" rel="noreferrer">Telegram</a>}
              {s?.tiktok_url && <a href={s.tiktok_url} target="_blank" rel="noreferrer">TikTok</a>}
            </div>
          </div>
        </div>
        <div className="border-t border-espresso-foreground/10 py-5 text-center text-xs opacity-50">
          © {new Date().getFullYear()} La Nouvelle Café & Restaurant ·{" "}
          <Link to="/auth" className="hover:underline">Staff</Link>
        </div>
      </footer>

      {cart.count > 0 && !isTg && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background p-3 md:hidden">
          <Button className="w-full justify-between" size="lg" onClick={() => cart.setOpen(true)}>
            <span>View cart · {cart.count}</span>
            <span>{formatBirr(cart.subtotal)}</span>
          </Button>
        </div>
      )}
      <CartSheet />
    </div>
  );
}
