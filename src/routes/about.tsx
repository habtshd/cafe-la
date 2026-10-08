import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — La Nouvelle Cafe" },
      { name: "description", content: "About La Nouvelle Cafe." },
      { property: "og:title", content: "About — La Nouvelle Cafe" },
      { property: "og:description", content: "Get to know La Nouvelle Cafe." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: About,
});

function About() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-5 py-20">
        <p className="eyebrow text-muted-foreground">About</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">{s.cafe_name}</h1>
        <p className="mt-4 font-display text-xl italic text-primary">{s.tagline}</p>
        {s.about ? (
          <div className="mt-8 whitespace-pre-line text-lg leading-relaxed">{s.about}</div>
        ) : (
          <p className="mt-8 text-muted-foreground">Our story is coming soon.</p>
        )}
        <Button asChild className="mt-10"><Link to="/menu">See the menu</Link></Button>
      </div>
    </SiteShell>
  );
}
