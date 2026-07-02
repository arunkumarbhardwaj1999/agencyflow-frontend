import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "AgencyFlow — CRM for Indian Digital Agencies",
  description:
    "Leads, clients, projects, GST billing, and client portals — one workspace for your agency.",
};

export default function HomePage() {
  return <LandingPage />;
}
