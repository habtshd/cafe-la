import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { useIsTelegram, useTelegramMainButton } from "@/hooks/use-telegram";
import { Logo } from "./Logo";
import { CartSheet } from "./CartSheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { settingsQuery } from "@/lib/queries";
import { formatBirr } from "@/lib/format";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const cart = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: s } = useQuery(settingsQuery);
  const isTg = useIsTelegram();
  const openCart = useCallback(() => cart.setOpen(true), [cart]);
  useTelegramMainButton(isTg && cart.count > 0 && !cart.open ? `View cart · ${formatBirr(cart.subtotal)}` : null, openCart);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="La Nouvelle home">
            <Logo className="h-14 -my-2" />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground font-semibold" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            {s?.offers_reservations && (
              <Link to="/reserve" className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-semibold" }}>
                Reserve
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => cart.setOpen(true)}
              className="relative rounded-md p-2 text-foreground hover:bg-secondary"
              aria-label="Open cart"
            >
              <ShoppingBag className="size-5" />
              {cart.count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {cart.count}
                </span>
              )}
            </button>
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link to="/menu">Order now</Link>
            </Button>
            <button className="rounded-md p-2 md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
              {mobileOpen ? <X className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="border-t px-5 py-3 md:hidden">
            {[...NAV, ...(s?.offers_reservations ? [{ to: "/reserve", label: "Reserve" } as const] : [])].map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMobileOpen(false)} className="block py-2.5 text-base">
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-espresso text-espresso-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
          <div>
            <Logo variant="white" className="h-12" />
            {s?.tagline && <p className="mt-4 max-w-xs text-sm opacity-70">{s.tagline}</p>}
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
          © {new Date().getFullYear()} La Nouvelle Cafe ·{" "}
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
