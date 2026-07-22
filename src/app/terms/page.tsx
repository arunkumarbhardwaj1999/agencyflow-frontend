import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "Terms for using AgencyFlow CRM workspaces, including account responsibility and acceptable use.",
  path: "/terms",
});

const sections = [
  {
    h: "1. Acceptance of terms",
    p: "By creating a workspace on AgencyFlow, you agree to these terms. If you're using AgencyFlow on behalf of an organization, you accept these terms for that organization.",
  },
  {
    h: "2. Using the service",
    p: "You're responsible for your account, your team members' access, and the accuracy of the data you enter. Don't use AgencyFlow for unlawful purposes or to store unlawful content.",
  },
  {
    h: "3. Billing",
    p: "Paid plans are billed in advance. You can upgrade, downgrade, or cancel at any time. Fees already paid are non-refundable except where required by law.",
  },
  {
    h: "4. Availability",
    p: "We work hard to keep AgencyFlow available and fast, but the service is provided 'as is' without warranties. We may perform maintenance with reasonable notice.",
  },
  {
    h: "5. Termination",
    p: "You may close your workspace at any time. We may suspend accounts that violate these terms. On termination you can export your data for a limited period.",
  },
  {
    h: "6. Contact",
    p: "Questions about these terms? Email us at hello@agencyflow.in.",
  },
];

export default function TermsPage() {
  return (
    <MarketingShell
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="The rules for using AgencyFlow. Last updated July 2026."
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
