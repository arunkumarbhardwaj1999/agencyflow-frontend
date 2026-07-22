import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { HomeJsonLd } from "@/components/seo/home-json-ld";
import { buildPageMetadata, SEO } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: `${SEO.name} — CRM for Indian Digital Agencies`,
  description:
    "Manage leads, deals, clients, projects, GST invoices, HR, automations, and client portals in one AgencyFlow workspace built for Indian agencies.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <LandingPage />
    </>
  );
}
