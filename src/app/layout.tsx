import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAuthProvider } from "@/providers/google-auth-provider";
import { QueryProvider } from "@/providers/query-provider";

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
  title: "AgencyFlow CRM",
  description: "Multi-tenant CRM for digital agencies — leads, projects, GST billing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${appSans.variable} ${appMono.variable} antialiased`}>
        <QueryProvider>
          <GoogleAuthProvider>{children}</GoogleAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
