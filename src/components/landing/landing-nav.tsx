"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SiteMenu } from "./site-menu";

type LandingNavProps = {
  overHero?: boolean;
};

export function LandingNav({ overHero = false }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !overHero || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 lg:px-10",
        solid
          ? "border-b border-slate-100 bg-white/80 py-3 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <Link
        href="/"
        className={cn(
          "text-xl font-bold tracking-tight transition-colors",
          solid ? "text-slate-900" : "text-white",
        )}
      >
        AgencyFlow
      </Link>
      <SiteMenu tone={solid ? "solid" : "light"} />
    </header>
  );
}
