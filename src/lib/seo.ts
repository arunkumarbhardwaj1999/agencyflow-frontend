import type { Metadata } from "next";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "https://agencyflow-frontend-lac.vercel.app";
  return raw.replace(/\/$/, "");
}

export const SEO = {
  name: "AgencyFlow",
  legalName: "AgencyFlow CRM",
  tagline: "CRM for Indian digital agencies",
  description:
    "AgencyFlow is a multi-tenant CRM for Indian digital agencies — manage leads, deals, clients, projects, GST invoices, team HR, automations, and client portals in one workspace.",
  keywords: [
    "agency CRM",
    "CRM for digital agencies",
    "GST invoicing software India",
    "lead management CRM",
    "client portal for agencies",
    "project management for agencies",
    "Indian agency software",
    "AgencyFlow",
  ],
  email: "hello@agencyflow.in",
  supportEmail: "support@agencyflow.in",
  phone: "+91-98765-43210",
  address: {
    street: "WeWork Galaxy, Residency Road",
    locality: "Bengaluru",
    region: "KA",
    postalCode: "560025",
    country: "IN",
  },
} as const;

export const LANDING_FAQS: { question: string; answer: string }[] = [
  {
    question: "What is AgencyFlow CRM?",
    answer:
      "AgencyFlow is a multi-tenant CRM workspace built for Indian digital agencies. It helps teams manage leads, deals, clients, projects, GST-compliant invoices, HR attendance and leaves, automations, reports, and a branded client portal from one place.",
  },
  {
    question: "Who is AgencyFlow for?",
    answer:
      "AgencyFlow is designed for digital agencies, design studios, marketing agencies, and web development firms in India that need sales, delivery, billing, and client communication in a single product.",
  },
  {
    question: "Does AgencyFlow support GST invoicing?",
    answer:
      "Yes. AgencyFlow includes India-first GST billing with CGST, SGST, and IGST based on place of supply, line items, invoice totals, and payment tracking so agencies can bill clients without a separate invoicing tool.",
  },
  {
    question: "What is the difference between Leads, Deals, and Projects in AgencyFlow?",
    answer:
      "Leads capture new enquiries. Deals track the sales process and deal value through stages like qualification, proposal, and negotiation. Projects manage delivery after a sale — tasks, documents, time, and project expenses.",
  },
  {
    question: "Does AgencyFlow include a client portal?",
    answer:
      "Yes. Clients can log into a portal to view their projects, tasks, files, invoices, approvals, and messages without seeing your internal agency workspace.",
  },
  {
    question: "Is AgencyFlow free to start?",
    answer:
      "AgencyFlow offers a free Starter plan for small teams, plus paid Growth and custom Scale plans for larger agencies. You can create a workspace and explore core CRM features without a long setup.",
  },
];

export const PUBLIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/login", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/register", priority: 0.8, changeFrequency: "monthly" as const },
];

type PageMetaInput = {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
}: PageMetaInput): Metadata {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path === "/" ? "" : path}`;
  const fullTitle = title.includes("AgencyFlow") ? title : `${title} | AgencyFlow`;

  return {
    title: fullTitle,
    description,
    keywords: [...SEO.keywords],
    authors: [{ name: SEO.name }],
    creator: SEO.name,
    publisher: SEO.name,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: SEO.legalName,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
