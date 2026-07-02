import Link from "next/link";
import { LandingNav } from "./landing-nav";

export function IntroSection() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-slate-900">
      <LandingNav variant="light" />

      {/* Soft accent glows */}
      <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />

      {/* Purple decorative panel on the right */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] lg:block">
        <div className="landing-gradient absolute inset-y-0 right-0 w-full [clip-path:polygon(28%_0,100%_0,100%_100%,0_100%)]" />
        <div className="absolute inset-y-0 right-0 w-full opacity-40 [clip-path:polygon(28%_0,100%_0,100%_100%,0_100%)]">
          <div className="landing-texture h-full w-full" />
        </div>
        {/* Floating accent shapes */}
        <div className="animate-float absolute right-24 top-24 h-24 w-24 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm" />
        <div className="animate-float absolute right-40 top-1/2 h-32 w-32 rounded-full border border-white/25 bg-white/5" style={{ animationDelay: "1.2s" }} />
        <div className="animate-float absolute bottom-28 right-28 h-20 w-20 rounded-xl border border-white/30 bg-white/10" style={{ animationDelay: "2.2s" }} />
        <div className="absolute right-16 top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-16 right-48 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[85vh] max-w-5xl flex-col justify-center px-6 py-32 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-indigo-500">
          Welcome to AgencyFlow
        </p>
        <h2 className="mt-6 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          We help agencies design influential brands and deliver digital experiences — with a CRM
          that keeps every <span className="gradient-text">client, project, and invoice</span> in
          sync.
        </h2>
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-white shadow-sm shadow-indigo-600/20 transition hover:brightness-110"
          >
            Start a project
          </Link>
          <Link
            href="#features"
            className="rounded-lg border border-slate-200 bg-white px-8 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
          >
            More about us
          </Link>
        </div>
      </div>
    </section>
  );
}
