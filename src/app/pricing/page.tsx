import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Pricing — AgencyFlow",
  description: "Simple, transparent pricing for agencies of every size.",
};

const plans = [
  {
    name: "Starter",
    price: "₹0",
    period: "/mo",
    tagline: "For solo founders getting started",
    features: ["Up to 3 team members", "Leads & clients", "5 projects", "GST invoices", "Community support"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "₹1,499",
    period: "/mo",
    tagline: "For growing agencies",
    features: [
      "Up to 15 team members",
      "Unlimited projects",
      "Payment links & reminders",
      "WhatsApp + email automation",
      "Client portal",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    tagline: "For large teams & custom needs",
    features: ["Unlimited members", "AI features", "Dedicated success manager", "SSO & custom roles", "SLA"],
    cta: "Contact sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <MarketingShell
      eyebrow="Pricing"
      title="Simple pricing that grows with you"
      subtitle="Start free. Upgrade when your agency scales. No hidden fees, cancel anytime."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-8 transition ${
              plan.highlighted
                ? "border-indigo-300 bg-gradient-to-b from-indigo-50 to-white shadow-lg shadow-indigo-100"
                : "border-slate-200 bg-white"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Popular
              </span>
            )}
            <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
            <p className="mt-6">
              <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
              <span className="text-slate-500">{plan.period}</span>
            </p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.name === "Scale" ? "/#contact" : "/register"}
              className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition ${
                plan.highlighted
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110"
                  : "border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </MarketingShell>
  );
}
