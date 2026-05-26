import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Sales Pipeline",
    description: "Kanban boards with drag-and-drop stages from New to Won.",
  },
  {
    title: "Projects & Tasks",
    description: "Track delivery from planning through completion with team assignments.",
  },
  {
    title: "India-First Billing",
    description: "GST-aware invoicing with CGST/SGST and IGST — coming in Phase 2.",
  },
  {
    title: "Client Portal",
    description: "White-labeled read-only access for your clients — Phase 2.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold tracking-tight">AgencyFlow</span>
        <nav className="flex gap-3">
          <Link href="/login">
            <Button variant="outline" className="border-slate-600 bg-transparent text-white hover:bg-slate-800">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button>Start Free</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Run your agency from one workspace
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Leads, clients, projects, GST billing, and WhatsApp alerts — built for Indian digital agencies.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/register">
            <Button size="lg">Create Workspace</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-slate-600 bg-transparent text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <Card key={f.title} className="border-slate-800 bg-slate-900/50 text-white">
            <CardHeader>
              <CardTitle className="text-base">{f.title}</CardTitle>
              <CardDescription className="text-slate-400">{f.description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>
    </div>
  );
}
