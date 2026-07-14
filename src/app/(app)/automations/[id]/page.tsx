import { AutomationBuilder } from "@/components/automations/automation-builder";

export default async function AutomationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AutomationBuilder automationId={id} />;
}
