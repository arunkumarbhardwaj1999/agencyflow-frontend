import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinancePage() {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>Invoices & billing</CardTitle>
        <CardDescription>
          GST-compliant invoicing, payment links, and PDF export will be available in the next release.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">
          Track pending and paid invoices from this section once billing is enabled for your workspace.
        </p>
      </CardContent>
    </Card>
  );
}
