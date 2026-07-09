import { Star, Quote } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const clients = [
  { name: "PixelCraft", tag: "Design studio" },
  { name: "BrandHive", tag: "Branding" },
  { name: "WebNova", tag: "Web dev" },
  { name: "SEOmatic", tag: "SEO agency" },
  { name: "DesignLab", tag: "Creative" },
  { name: "GrowthAxis", tag: "Performance" },
  { name: "MediaPulse", tag: "Social media" },
  { name: "StudioNine", tag: "Production" },
];

const stats = [
  { value: "500+", label: "Agencies" },
  { value: "4.9/5", label: "Avg. rating" },
  { value: "98%", label: "Retention" },
];

function monogram(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function ClientsSection() {
  return (
    <section id="clients" className="flex min-h-screen items-center bg-slate-100 py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-indigo-500">
              Our clients
            </p>
            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Trusted by agencies that ship great work
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {clients.map((client, i) => (
            <Reveal key={client.name} delay={i * 60}>
              <div className="card-hover group flex items-center gap-3 rounded-2xl border border-white bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-sm">
                  {monogram(client.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800 transition group-hover:text-indigo-600">
                    {client.name}
                  </p>
                  <p className="truncate text-xs text-slate-400">{client.tag}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            {/* Testimonial */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 p-8 text-white shadow-lg">
              <div className="landing-texture absolute inset-0 opacity-30" />
              <Quote className="relative h-8 w-8 text-white/40" />
              <p className="relative mt-4 text-lg font-medium leading-relaxed sm:text-xl">
                &ldquo;AgencyFlow replaced three tools for us. Leads, GST invoices, and client
                updates finally live in one place — our team saves hours every week.&rdquo;
              </p>
              <div className="relative mt-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                  RS
                </div>
                <div>
                  <p className="text-sm font-bold">Riya Sharma</p>
                  <p className="text-xs text-white/70">Founder, PixelCraft</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-300 text-amber-300" />
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 lg:grid-cols-1">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center rounded-2xl border border-white bg-white p-5 text-center shadow-sm lg:flex-row lg:justify-start lg:gap-4 lg:text-left"
                >
                  <p className="text-2xl font-bold text-indigo-600 sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400 lg:mt-0">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
