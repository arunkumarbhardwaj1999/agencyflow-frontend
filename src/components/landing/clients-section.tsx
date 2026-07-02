import { Reveal } from "@/components/ui/reveal";

const clients = [
  "PixelCraft",
  "BrandHive",
  "WebNova",
  "SEOmatic",
  "DesignLab",
  "GrowthAxis",
  "MediaPulse",
  "StudioNine",
];

export function ClientsSection() {
  return (
    <section id="clients" className="bg-slate-100 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 text-center lg:px-10">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--landing-green)]">
            Our clients
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            AgencyFlow has been honored to partner with agencies like these
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {clients.map((name) => (
              <span
                key={name}
                className="text-lg font-bold tracking-tight text-slate-400 transition hover:text-slate-600"
              >
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
