import Link from "next/link";
import { StatsBar } from "./stats-bar";

export function HeroSection() {
  return (
    <section className="landing-gradient relative flex min-h-screen flex-col text-white">
      <div className="landing-texture pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 pb-10 pt-24 text-center sm:px-6 sm:pb-12 sm:pt-28 lg:px-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 sm:text-xs sm:tracking-[0.35em]">
          CRM for Indian digital agencies
        </p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:mt-6 sm:text-6xl lg:text-7xl">
          AgencyFlow
        </h1>
        <div className="mx-auto mt-6 h-px w-16 bg-white/40 sm:mt-8" />
        <p className="landing-serif mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:mt-8 sm:text-xl">
          One workspace for leads, deals, clients, projects, GST invoices, team HR, and client
          portals — built for how Indian agencies actually work.
        </p>
        <div className="relative z-20 mt-8 flex w-full max-w-sm flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-indigo-700 transition hover:bg-white/90 sm:px-10 sm:py-4"
          >
            Start a workspace
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center border-2 border-white bg-transparent px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10 sm:px-10 sm:py-4"
          >
            Sign in
          </Link>
        </div>
      </div>

      <StatsBar />
    </section>
  );
}
