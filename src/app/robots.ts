import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/leads",
          "/deals",
          "/clients",
          "/projects",
          "/tasks",
          "/calendar",
          "/documents",
          "/finance",
          "/hr",
          "/automations",
          "/reports",
          "/team",
          "/settings",
          "/inbox",
          "/time",
          "/proposals",
          "/contracts",
          "/portal",
          "/api/",
          "/pay/",
          "/accept-invite",
          "/join",
          "/confirm-account",
          "/change-password",
          "/reset-password",
          "/forgot-password",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
