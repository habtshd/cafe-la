import { cn } from "@/lib/utils";
import logoWhite from "@/assets/1cc0608d-2c6d-4df8-93dd-380a3a308fa7.png";
import logoBrown from "@/assets/f50c8de3-1151-43e5-9b7d-de423b2e83f4.png";

export interface LogoProps {
  variant?: "brown" | "white" | "auto";
  className?: string;
  alt?: string;
}

export function Logo({
  variant = "auto",
  className,
  alt = "La Nouvelle Café & Restaurant",
}: LogoProps) {
  if (variant === "white") {
    return (
      <img
        src={logoWhite}
        alt={alt}
        loading="eager"
        decoding="async"
        draggable={false}
        className={cn("h-11 sm:h-12 w-auto object-contain select-none", className)}
      />
    );
  }

  if (variant === "brown") {
    return (
      <img
        src={logoBrown}
        alt={alt}
        loading="eager"
        decoding="async"
        draggable={false}
        className={cn("h-11 sm:h-12 w-auto object-contain select-none", className)}
      />
    );
  }

  // Automatic adaptive theme: brown in light mode, white in dark mode
  return (
    <div className={cn("inline-flex items-center select-none", className)}>
      <img
        src={logoBrown}
        alt={alt}
        loading="eager"
        decoding="async"
        draggable={false}
        className={cn("h-11 sm:h-12 w-auto object-contain dark:hidden", className)}
      />
      <img
        src={logoWhite}
        alt={alt}
        loading="eager"
        decoding="async"
        draggable={false}
        className={cn("hidden h-11 sm:h-12 w-auto object-contain dark:block", className)}
      />
    </div>
  );
}

export { logoWhite, logoBrown };
