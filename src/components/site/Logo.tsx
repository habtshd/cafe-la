import { cn } from "@/lib/utils";

export function Logo({ variant = "brown", className }: { variant?: "brown" | "white"; className?: string }) {
  return (
    <div className={cn("font-display text-xl sm:text-2xl font-semibold tracking-tight inline-flex items-center gap-2", variant === "white" ? "text-white" : "text-primary dark:text-white", className)}>
      <span className="font-display italic">La Nouvelle</span>
      <span className="text-xs uppercase tracking-widest opacity-75 font-sans font-medium">Café & Restaurant</span>
    </div>
  );
}
