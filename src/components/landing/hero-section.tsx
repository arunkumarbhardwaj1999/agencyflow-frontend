import Link from "next/link";
import { LandingNav } from "./landing-nav";
import { StatsBar } from "./stats-bar";

export function HeroSection() {
  return (
    <section className="landing-gradient relative min-h-screen text-white">
      <div className="landing-texture pointer-events-none absolute inset-0 opacity-30" />
      <LandingNav variant="green" />

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 pb-48 pt-28 text-center lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/70">Hello there</p>
        <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          We Are AgencyFlow
        </h1>
        <div className="mx-auto mt-8 h-px w-16 bg-white/40" />
        <p className="landing-serif mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
          Your agency workspace is ready. Manage leads, clients, projects, GST invoices, and
          client portals — all from one beautiful dashboard built for Indian digital agencies.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="bg-white px-10 py-4 text-sm font-bold uppercase tracking-widest text-indigo-700 transition hover:bg-white/90"
          >
            Start a workspace
          </Link>
          <Link
            href="/login"
            className="border-2 border-white/40 px-10 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:border-white hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </div>

      <StatsBar />
    </section>
  );
}
