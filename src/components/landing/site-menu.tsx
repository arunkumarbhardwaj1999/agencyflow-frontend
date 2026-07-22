"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SOCIALS } from "@/lib/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#showcase", label: "Product" },
  { href: "/#clients", label: "Clients" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export function SiteMenu({
  tone = "solid",
  className,
  showRegister = true,
}: {
  tone?: "solid" | "light";
  className?: string;
  showRegister?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const overlay = (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-[100] flex h-full w-[300px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out sm:w-[360px]",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-600">
            Navigation
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col px-8 py-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-slate-100 py-4 text-lg font-semibold text-slate-800 transition hover:pl-2 hover:text-indigo-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="px-8">
          <p className="text-sm leading-relaxed text-slate-400">
            One workspace for leads, clients, projects, GST billing, and client portals — built for
            Indian digital agencies.
          </p>
        </div>

        <div className="mt-auto space-y-5 px-8 py-8">
          <div className="flex gap-3">
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
          <div className="flex flex-col gap-3">
            {showRegister && (
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-center text-sm font-semibold text-white transition hover:brightness-110"
              >
                Start Free
              </Link>
            )}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              Sign In
            </Link>
          </div>
        </div>
      </aside>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] shadow-sm transition",
          tone === "solid"
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-white text-indigo-700 hover:bg-white/90",
          className,
        )}
        aria-label="Open menu"
      >
        Menu
        <Menu className="h-4 w-4" />
      </button>

      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
