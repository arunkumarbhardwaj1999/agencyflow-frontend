import Link from "next/link";
import { ArrowRight, Sparkles, Check } from "lucide-react";

const highlights = ["Leads → Won pipeline", "GST-ready invoices", "Client portals"];

export function IntroSection() {
  return (
    <section className="relative flex items-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-slate-900">
      <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-10 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] lg:block">
        <div className="landing-gradient absolute inset-y-0 right-0 w-full [clip-path:polygon(28%_0,100%_0,100%_100%,0_100%)]" />
        <div className="absolute inset-y-0 right-0 w-full opacity-40 [clip-path:polygon(28%_0,100%_0,100%_100%,0_100%)]">
          <div className="landing-texture h-full w-full" />
        </div>

        <div className="animate-float absolute right-20 top-1/2 w-72 -translate-y-1/2 rounded-2xl border border-white/25 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-white/15 px-3 py-2.5">
              <span className="text-xs font-semibold text-white">New leads</span>
              <span className="text-xs font-bold text-white">24</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-3/4 rounded-full bg-white/70" />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/15 px-3 py-2.5">
              <span className="text-xs font-semibold text-white">Invoices paid</span>
              <span className="text-xs font-bold text-white">₹4.2L</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-1/2 rounded-full bg-white/70" />
            </div>
          </div>
        </div>

        <div className="animate-float absolute right-40 top-24 h-20 w-20 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm" style={{ animationDelay: "1.2s" }} />
        <div className="animate-float absolute bottom-24 right-28 h-16 w-16 rounded-xl border border-white/30 bg-white/10" style={{ animationDelay: "2.2s" }} />
        <div className="absolute bottom-16 right-48 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />
      </div>

      <div className="relative w-full px-6 py-28 sm:px-10 lg:px-16 xl:px-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          Welcome to AgencyFlow
        </span>

        <h2 className="mt-7 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-6xl">
          We help agencies build brands and deliver work — with a CRM that keeps every{" "}
          <span className="gradient-text">client, project & invoice</span> in sync.
        </h2>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
          One calm workspace for your whole team. Stop juggling spreadsheets, chat threads, and
          five different tools.
        </p>

        <ul className="mt-8 flex flex-wrap gap-3">
          {highlights.map((h) => (
            <li
              key={h}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur"
            >
              <Check className="h-4 w-4 text-indigo-600" />
              {h}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
          >
            Start a project
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/#features"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
          >
            More about us
          </Link>
        </div>
      </div>
    </section>
  );
}
