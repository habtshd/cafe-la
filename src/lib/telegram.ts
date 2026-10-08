// Telegram Mini App helpers. Safe in normal browsers: everything no-ops outside Telegram.
type TgWebApp = {
  initData: string;
  ready: () => void;
  expand: () => void;
  colorScheme?: "light" | "dark";
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
  HapticFeedback?: { impactOccurred: (s: "light" | "medium" | "heavy") => void; notificationOccurred: (t: "success" | "error" | "warning") => void };
  MainButton: { setText: (t: string) => void; show: () => void; hide: () => void; onClick: (f: () => void) => void; offClick: (f: () => void) => void };
  BackButton?: { show: () => void; hide: () => void; onClick: (f: () => void) => void; offClick: (f: () => void) => void };
};

export function getTelegram(): TgWebApp | null {
  if (typeof window === "undefined") return null;
  const wa = (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp;
  return wa && wa.initData ? wa : null; // initData is empty outside Telegram
}

export function initTelegram() {
  const wa = getTelegram();
  if (!wa) return false;
  wa.ready();
  wa.expand();
  wa.setHeaderColor?.("#f6efe4");
  wa.setBackgroundColor?.("#f6efe4");
  document.documentElement.classList.add("tg-app");
  return true;
}

export function haptic(kind: "light" | "success" = "light") {
  const h = getTelegram()?.HapticFeedback;
  if (!h) return;
  if (kind === "success") h.notificationOccurred("success");
  else h.impactOccurred("light");
}
