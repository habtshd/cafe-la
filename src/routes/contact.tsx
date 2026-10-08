import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & location — La Nouvelle Cafe" },
      { name: "description", content: "Address, phone, opening hours and directions for La Nouvelle Cafe." },
      { property: "og:title", content: "Contact — La Nouvelle Cafe" },
      { property: "og:description", content: "Find La Nouvelle Cafe: address, hours and contact." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: Contact,
});

function Contact() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  const rows = [
    s.address && { icon: MapPin, label: "Address", value: s.address, href: s.map_url || undefined },
    s.phone && { icon: Phone, label: "Phone", value: s.phone, href: `tel:${s.phone}` },
    s.email && { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    s.opening_hours && { icon: Clock, label: "Opening hours", value: s.opening_hours },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string; href?: string }[];

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-5 pt-28 pb-20">
        <h1 className="text-4xl sm:text-5xl">Contact</h1>
        {rows.length === 0 ? (
          <p className="mt-8 text-muted-foreground">Contact details are coming soon.</p>
        ) : (
          <dl className="mt-10 divide-y border-y">
            {rows.map((r) => (
              <div key={r.label} className="flex gap-4 py-5">
                <r.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <dt className="eyebrow text-muted-foreground">{r.label}</dt>
                  <dd className="mt-1 whitespace-pre-line text-lg">
                    {r.href ? <a href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="hover:text-primary">{r.value}</a> : r.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        )}
        {s.map_url && (
          <a href={s.map_url} target="_blank" rel="noreferrer" className="mt-6 inline-block font-semibold text-primary hover:underline">
            Open in Google Maps →
          </a>
        )}
      </div>
    </SiteShell>
  );
}
