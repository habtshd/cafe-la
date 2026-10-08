import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("app-theme") as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  return "light";
}

export function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  try {
    localStorage.setItem("app-theme", theme);
  } catch {
    // Ignore storage errors in private mode
  }
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", theme === "dark" ? "#282828" : "#FCF7E9");
  }
  window.dispatchEvent(new CustomEvent("app-theme-change", { detail: theme }));
}

export function useTheme() {
  const [theme, setLocalTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = getTheme();
    applyTheme(current);
    setLocalTheme(current);

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>;
      if (customEvent.detail) {
        setLocalTheme(customEvent.detail);
      }
    };

    window.addEventListener("app-theme-change", handleThemeChange);
    return () => window.removeEventListener("app-theme-change", handleThemeChange);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setLocalTheme(next);
  };

  return { theme, isDark: theme === "dark", toggle, setTheme: applyTheme };
}
