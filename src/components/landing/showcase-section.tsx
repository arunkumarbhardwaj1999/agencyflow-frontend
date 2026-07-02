import { Reveal } from "@/components/ui/reveal";

const panels = [
  {
    title: "Sales Dashboard",
    subtitle: "Pipeline at a glance",
    gradient: "from-indigo-600 via-violet-600 to-indigo-800",
  },
  {
    title: "GST Invoices",
    subtitle: "Billing made simple",
    gradient: "from-violet-600 via-purple-600 to-indigo-800",
  },
  {
    title: "Project Board",
    subtitle: "Tasks & milestones",
    gradient: "from-indigo-700 via-indigo-800 to-slate-900",
  },
  {
    title: "Client Portal",
    subtitle: "Branded for your clients",
    gradient: "from-sky-500 via-indigo-500 to-violet-700",
  },
];

export function ShowcaseSection() {
  return (
    <section id="showcase" className="bg-slate-50 py-24 text-slate-900 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <Reveal>
          <p className="text-center text-xs font-bold uppercase tracking-[0.35em] text-indigo-500">
            Recent works
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-center text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            We love what we do — explore the modules your team will use every day
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          {panels.map((panel, i) => (
            <Reveal key={panel.title} delay={i * 100}>
              <div
                className={`card-hover group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-sm ${panel.gradient}`}
              >
                <div className="landing-texture absolute inset-0 opacity-30" />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                    {panel.subtitle}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">{panel.title}</h3>
                </div>
                <div className="absolute inset-0 bg-white/0 transition group-hover:bg-white/10" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
