"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Check } from "lucide-react";
import { SITE, SOCIALS, FOOTER_COLUMNS } from "@/lib/site";

export function FooterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="border-t border-slate-100 bg-gradient-to-b from-indigo-50/60 to-white py-16 text-slate-900">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <Link href="/" className="text-2xl font-bold">
            AgencyFlow<span className="text-indigo-600">.</span>
          </Link>
          <p className="mt-6 max-w-md leading-relaxed text-slate-500">
            Secure multi-tenant CRM for Indian digital agencies. Leads, clients, projects, GST
            billing, and client portals — one workspace for your whole team.
          </p>
          <div className="mt-6 flex gap-3">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-indigo-600 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-900">{col.title}</p>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 transition hover:text-indigo-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-6xl px-6 lg:px-10">
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-bold">Get notified</p>
            <p className="mt-1 text-sm text-slate-500">
              Subscribe for product updates and agency growth tips.
            </p>
          </div>
          {subscribed ? (
            <p className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600 sm:mt-0">
              <Check className="h-4 w-4" /> Thanks! You&apos;re on the list.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSubscribed(true);
                setEmail("");
              }}
              className="mt-4 flex w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:mt-0"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-xs font-bold uppercase tracking-widest text-white transition hover:brightness-110"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 pt-8 text-sm text-slate-400 sm:flex-row lg:px-10">
        <p>© {new Date().getFullYear()} {SITE.name} — Secure multi-tenant CRM.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="transition hover:text-indigo-600">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-indigo-600">
            Terms
          </Link>
          <Link href="/login" className="transition hover:text-indigo-600">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
