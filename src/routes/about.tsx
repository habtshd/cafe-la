import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Coffee, Sun, Sparkles, MapPin, Clock, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { settingsQuery } from "@/lib/queries";
import outdoorCafeImg from "@/assets/charming-vector-illustration-cozy-cafe-with-outdoor-seating-vector-illustration_1176913-47425.jpg";
import indoorLoungeImg from "@/assets/istockphoto-2037359827-612x612.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us & Ambiance — La Nouvelle Cafe" },
      { name: "description", content: "Discover the culinary philosophy and dining spaces of La Nouvelle Cafe in Bole." },
      { property: "og:title", content: "About Us & Ambiance — La Nouvelle Cafe" },
      { property: "og:description", content: "Get to know La Nouvelle Cafe and our welcoming indoor & outdoor dining spaces." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: About,
});

function About() {
  const { data: s } = useSuspenseQuery(settingsQuery);

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-5 pt-28 pb-24">
        {/* Story Header */}
        <div className="max-w-2xl">
          <p className="eyebrow text-accent font-semibold">Our Story & Heritage</p>
          <h1 className="mt-2 text-4xl sm:text-6xl font-display text-foreground">{s.cafe_name}</h1>
          <p className="mt-4 font-display text-xl sm:text-2xl italic text-primary">{s.tagline}</p>
          {s.about ? (
            <div className="mt-6 whitespace-pre-line text-base sm:text-lg leading-relaxed text-muted-foreground">
              {s.about}
            </div>
          ) : (
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Founded on the traditions of French culinary excellence and warm Ethiopian hospitality,
              La Nouvelle is a welcoming haven in the heart of Bole. From artisan morning pastries to evening
              fine dining, every dish is an invitation to pause, savor, and connect.
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" variant="accent">
              <Link to="/menu">View Our Menu</Link>
            </Button>
            {s.offers_reservations && (
              <Button asChild size="lg" variant="outline">
                <Link to="/reserve">Reserve a Table</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Atmosphere & Spaces Section */}
        <div className="mt-24 border-t border-border pt-16">
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
              <Sparkles className="size-3.5" />
              <span>The Ambiance</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display text-foreground">
              Two unique spaces to enjoy
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Whether you prefer morning sunlight under the terrace awning or the intimate glow of our indoor espresso bar.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Outdoor Seating Card */}
            <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-xl hover:border-primary/30 flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
                <img
                  src={outdoorCafeImg}
                  alt="Outdoor Parisian Terrace at La Nouvelle"
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md shadow-sm flex items-center gap-1.5">
                  <Sun className="size-3.5 text-amber-500" />
                  <span>Open-Air Terrace</span>
                </div>
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-2xl text-foreground">The Parisian Terrace</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Bathed in gentle morning light and shaded by golden awnings, our outdoor terrace is the ideal spot
                    for fresh pour-over coffee, buttery brioche toast, and breezy midday lunches with friends.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-medium text-accent">
                  <span>Al Fresco Seating · Garden Breeze</span>
                  {s.offers_reservations && (
                    <Link to="/reserve" className="inline-flex items-center gap-1 hover:underline">
                      Reserve outdoor <ArrowRight className="size-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Indoor Lounge Card */}
            <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-xl hover:border-primary/30 flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
                <img
                  src={indoorLoungeImg}
                  alt="Indoor Espresso Bar & Bistro Lounge at La Nouvelle"
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md shadow-sm flex items-center gap-1.5">
                  <Coffee className="size-3.5 text-accent" />
                  <span>Bar & Dining Lounge</span>
                </div>
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-2xl text-foreground">The Espresso Bar & Lounge</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Warm pendant lighting, rich wooden counter bar, and cozy dining booths. Perfect for craft espresso drinks,
                    wood-fired Diavola pizza, and candlelit evening dinners with prime filet mignon.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-medium text-accent">
                  <span>Bar Counter · Plush Banquettes</span>
                  {s.offers_reservations && (
                    <Link to="/reserve" className="inline-flex items-center gap-1 hover:underline">
                      Reserve indoor <ArrowRight className="size-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visit Details Footer Card */}
        <div className="mt-16 rounded-2xl border border-border bg-secondary/30 p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h4 className="font-display text-xl text-foreground">Join us in Bole, Addis Ababa</h4>
            {s.address && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="size-4 text-accent shrink-0" />
                <a
                  href={s.map_url || "https://maps.app.goo.gl/vjYRA27pJZs3yK377"}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary hover:underline transition-colors"
                >
                  {s.address}
                </a>
              </p>
            )}
            {s.opening_hours && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="size-4 text-accent shrink-0" />
                <span>{s.opening_hours}</span>
              </p>
            )}
          </div>
          <Button asChild variant="accent" size="lg" className="shrink-0">
            <Link to="/menu">View Full Menu</Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
