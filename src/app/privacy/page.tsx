import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Privacy Policy — AgencyFlow",
};

const sections = [
  {
    h: "1. Information we collect",
    p: "We collect the information you provide when you create a workspace — your name, email, company details — and the data you enter about your leads, clients, projects, and invoices.",
  },
  {
    h: "2. How we use it",
    p: "Your data is used solely to provide the AgencyFlow service: authentication, storing your CRM records, generating invoices, and sending notifications you enable.",
  },
  {
    h: "3. Data security",
    p: "Passwords are hashed, all traffic is encrypted in transit, and each workspace's data is isolated in a multi-tenant architecture. We never sell your data.",
  },
  {
    h: "4. Third-party services",
    p: "We use trusted providers for email (Resend), payments (Razorpay/Stripe), messaging (Meta WhatsApp), and file storage (Cloudflare R2). Each processes data only to deliver its feature.",
  },
  {
    h: "5. Your rights",
    p: "You can export or delete your workspace data at any time. Contact us to request a full export or account deletion.",
  },
  {
    h: "6. Contact",
    p: "Questions about privacy? Email us at hello@agencyflow.in.",
  },
];

export default function PrivacyPage() {
  return (
    <MarketingShell
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your data. Last updated July 2026."
    >
      <div className="space-y-8">
        {sections.map((s) => (
          <div key={s.h}>
            <h2 className="text-lg font-bold text-slate-900">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-slate-500">{s.p}</p>
          </div>
        ))}
      </div>
    </MarketingShell>
  );
}
