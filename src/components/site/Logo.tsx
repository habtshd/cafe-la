import brown from "@/assets/logo-brown.png.asset.json";
import white from "@/assets/logo-white.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ variant = "brown", className }: { variant?: "brown" | "white"; className?: string }) {
  return (
    <img
      src={variant === "white" ? white.url : brown.url}
      alt="La Nouvelle"
      width={1774}
      height={887}
      className={cn("h-10 w-auto", className)}
    />
  );
}
