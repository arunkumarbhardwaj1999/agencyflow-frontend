import { getSiteUrl, LANDING_FAQS, SEO } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export function HomeJsonLd() {
  const siteUrl = getSiteUrl();

  const organization = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: SEO.legalName,
    alternateName: SEO.name,
    url: siteUrl,
    email: SEO.email,
    telephone: SEO.phone,
    description: SEO.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: SEO.address.street,
      addressLocality: SEO.address.locality,
      addressRegion: SEO.address.region,
      postalCode: SEO.address.postalCode,
      addressCountry: SEO.address.country,
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };

  const software = {
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/#software`,
    name: SEO.legalName,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "CRM",
    operatingSystem: "Web",
    description: SEO.description,
    url: siteUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: "Free Starter plan available",
      url: `${siteUrl}/pricing`,
    },
    featureList: [
      "Lead and deal pipeline",
      "GST invoicing for India",
      "Project and task management",
      "Client portal",
      "HR attendance and leaves",
      "Automations and reports",
    ],
    provider: { "@id": `${siteUrl}/#organization` },
  };

  const website = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: SEO.legalName,
    url: siteUrl,
    description: SEO.description,
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: "en-IN",
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    mainEntity: LANDING_FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [organization, software, website, faqPage],
      }}
    />
  );
}
