import { Kanban, Receipt, Globe, Users } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const features = [
  {
    icon: Kanban,
    title: "Lead Pipeline",
    description:
      "Kanban boards from New to Won. Drag-and-drop stages, assign owners, and never lose a hot lead again.",
  },
  {
    icon: Receipt,
    title: "GST Billing",
    description:
      "India-first invoicing with CGST, SGST, and IGST. Line items, PDF export, and payment links built in.",
  },
  {
    icon: Globe,
    title: "Client Portal",
    description:
      "White-labeled portal where clients view projects, invoices, and progress — without seeing your internal chaos.",
  },
  {
    icon: Users,
    title: "Team & Projects",
    description:
      "Assign tasks, track delivery milestones, and keep your whole agency aligned on every client engagement.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            We&apos;ve got everything you need to launch and grow your agency
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-16 sm:grid-cols-2">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 80}>
              <div className="flex gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center text-[var(--landing-green)]">
                  <feature.icon className="h-10 w-10 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 leading-relaxed text-slate-500">{feature.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
