"use client";

import { AnimatedCounter } from "@/components/ui/animated-counter";

const stats = [
  { value: 500, suffix: "+", label: "Agencies onboarded" },
  { value: 12000, suffix: "+", label: "Invoices generated" },
  { value: 8500, suffix: "+", label: "Projects delivered" },
  { value: 98, suffix: "%", label: "Client satisfaction" },
];

export function StatsBar() {
  return (
    <div className="relative z-0 mt-auto w-full shrink-0 border-t border-white/25">
      <div className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`px-4 py-8 text-center sm:px-6 sm:py-10 lg:px-8 ${
              i < stats.length - 1 ? "lg:border-r lg:border-white/25" : ""
            } ${i % 2 === 0 ? "border-r border-white/25 lg:border-r" : ""} ${
              i < 2 ? "border-b border-white/25 lg:border-b-0" : ""
            }`}
          >
            <p className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-white/70 sm:text-xs">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
