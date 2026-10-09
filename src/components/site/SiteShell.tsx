import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu as MenuIcon, ShoppingBag, X, Instagram } from "lucide-react";
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

      <footer className="relative overflow-hidden border-t border-[#D6C49C] dark:border-white/10 bg-gradient-to-b from-[#EFE3C8] via-[#E8DCBD] to-[#DFD0AC] dark:from-[#16120E] dark:via-[#100D0A] dark:to-[#080605] text-[#241A12] dark:text-[#F5EFEA] transition-colors duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-none">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-14 pb-10 md:grid-cols-3">
          <div>
            <Logo variant={isDark ? "white" : "brown"} className="h-12" />
            {s?.tagline && <p className="mt-4 max-w-xs text-sm text-[#4D3929] dark:text-[#D4C3B4]">{s.tagline}</p>}
          </div>
          <div className="text-sm">
            <p className="eyebrow mb-3 text-[#826349] dark:text-[#A89078] font-bold uppercase tracking-wider text-xs">Visit</p>
            {s?.address ? (
              <a
                href={s?.map_url || "https://maps.app.goo.gl/vjYRA27pJZs3yK377"}
                target="_blank"
                rel="noreferrer"
                className="whitespace-pre-line text-[#33251A] dark:text-[#E8DDD2] hover:text-accent transition-colors block"
              >
                {s.address}
              </a>
            ) : null}
            {s?.opening_hours ? <p className="mt-2 whitespace-pre-line text-[#5C4533] dark:text-[#BFAF9F]">{s.opening_hours}</p> : null}
            {s?.phone && <a href={`tel:${s.phone}`} className="mt-2 block text-[#33251A] dark:text-[#E8DDD2] hover:text-accent">{s.phone}</a>}
          </div>
          <div className="text-sm">
            <p className="eyebrow mb-3 text-[#826349] dark:text-[#A89078] font-bold uppercase tracking-wider text-xs">Follow</p>
            <div className="flex flex-col gap-2 text-[#33251A] dark:text-[#E8DDD2]">
              <a
                href={s?.instagram_url || "https://www.instagram.com/la_nouvelle_addis?utm_source=ig_web_button_share_sheet&xtok=ZDNlZDc0MzIxNw=="}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-accent transition-colors"
              >
                <Instagram className="size-4 text-accent" />
                <span>Instagram (@la_nouvelle_addis)</span>
              </a>
              {s?.facebook_url && <a href={s.facebook_url} target="_blank" rel="noreferrer" className="hover:text-accent">Facebook</a>}
              {s?.telegram_url && <a href={s.telegram_url} target="_blank" rel="noreferrer" className="hover:text-accent">Telegram</a>}
              {s?.tiktok_url && <a href={s.tiktok_url} target="_blank" rel="noreferrer" className="hover:text-accent">TikTok</a>}
            </div>
          </div>
        </div>

        {/* Massive Brand Name at the Bottom of Footer (Like Discord, Laravel, Antigravity) */}
        <div className="relative w-full overflow-hidden my-8 sm:my-14 py-4 sm:py-8 text-center select-none pointer-events-none">
          <span className="block w-full font-display font-black uppercase tracking-tighter text-[16vw] sm:text-[17.5vw] leading-[0.78] text-center whitespace-nowrap bg-gradient-to-b from-[#241A12]/45 via-[#241A12]/20 to-[#241A12]/5 bg-clip-text text-transparent dark:from-white/45 dark:via-white/20 dark:to-white/5">
            La Nouvelle
          </span>
        </div>

        <div className="pb-8 pt-2 text-center text-xs text-[#6B533E] dark:text-[#9E8B7B]">
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
