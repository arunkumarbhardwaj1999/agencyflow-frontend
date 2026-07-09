import { LandingNav } from "@/components/landing/landing-nav";
import { FooterSection } from "@/components/landing/footer-section";

export function MarketingShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LandingNav />

      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-6 pb-16 pt-36 lg:px-10">
        <div className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-4xl">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-indigo-500">{eyebrow}</p>
          )}
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-500">{subtitle}</p>}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 lg:px-10">{children}</main>

      <FooterSection />
    </div>
  );
}
