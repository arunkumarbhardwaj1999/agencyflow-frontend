"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export function FooterSection() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-slate-100 bg-gradient-to-b from-indigo-50/60 to-white py-16 text-slate-900">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:px-10">
        <div>
          <p className="text-2xl font-bold">
            AgencyFlow<span className="text-indigo-600">.</span>
          </p>
          <p className="mt-6 max-w-md leading-relaxed text-slate-500">
            Secure multi-tenant CRM for Indian digital agencies. Leads, clients, projects, GST
            billing, and client portals — one workspace for your whole team.
          </p>
        </div>

        <div>
          <p className="text-lg font-bold">Get notified</p>
          <p className="mt-2 text-sm text-slate-500">
            Subscribe for product updates and agency growth tips.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setEmail("");
            }}
            className="mt-6 flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-transparent py-4 pl-11 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-xs font-bold uppercase tracking-widest text-white transition hover:brightness-110"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 pt-8 text-sm text-slate-400 sm:flex-row lg:px-10">
        <p>© {new Date().getFullYear()} AgencyFlow — Secure multi-tenant CRM.</p>
        <div className="flex gap-6">
          <Link href="/login" className="transition hover:text-indigo-600">
            Sign in
          </Link>
          <Link href="/register" className="transition hover:text-indigo-600">
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}
