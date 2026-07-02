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
    <div className="absolute inset-x-0 bottom-0 border-t border-white/25">
      <div className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`px-6 py-10 text-center lg:px-8 ${
              i < stats.length - 1 ? "lg:border-r lg:border-white/25" : ""
            } ${i % 2 === 0 ? "border-r border-white/25 lg:border-r" : ""} ${
              i < 2 ? "border-b border-white/25 lg:border-b-0" : ""
            }`}
          >
            <p className="text-4xl font-bold text-white sm:text-5xl">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/70">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
