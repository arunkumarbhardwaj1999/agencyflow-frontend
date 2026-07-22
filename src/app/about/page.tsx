import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About AgencyFlow",
  description:
    "Learn why AgencyFlow was built for Indian digital agencies — GST billing, lead-to-project workflows, and one calm multi-tenant CRM workspace.",
  path: "/about",
});

const values = [
  {
    title: "India-first",
    body: "GST-compliant billing, INR everywhere, and workflows designed for how Indian agencies actually operate.",
  },
  {
    title: "One workspace",
    body: "Leads, clients, projects, invoices, and client portals live together — no more juggling five tools.",
  },
  {
    title: "Built to scale",
    body: "Multi-tenant architecture, real-time updates, and automation so your agency grows without the busywork.",
  },
];

export default function AboutPage() {
  return (
    <MarketingShell
      eyebrow="About us"
      title="We help agencies run on one calm workspace"
      subtitle="AgencyFlow started with a simple belief: agency teams deserve software that keeps every client, project, and invoice in sync — without the chaos."
    >
      <div className="grid gap-8 sm:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="surface-card p-6">
            <h3 className="text-lg font-bold text-slate-900">{v.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-10 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to see it in action?</h2>
        <p className="mt-3 text-white/80">Create your workspace in under a minute — free to start.</p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-lg bg-white px-8 py-3 text-sm font-bold uppercase tracking-widest text-indigo-700 transition hover:bg-white/90"
        >
          Start free
        </Link>
      </div>
    </MarketingShell>
  );
}
