import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAuthProvider } from "@/providers/google-auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { buildPageMetadata, getSiteUrl, SEO } from "@/lib/seo";

const appSans = Plus_Jakarta_Sans({
  variable: "--font-app-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const appMono = JetBrains_Mono({
  variable: "--font-app-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  ...buildPageMetadata({
    title: `${SEO.legalName} — ${SEO.tagline}`,
    description: SEO.description,
    path: "/",
  }),
  applicationName: SEO.legalName,
  category: "business",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body className={`${appSans.variable} ${appMono.variable} antialiased`}>
        <QueryProvider>
          <GoogleAuthProvider>{children}</GoogleAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
