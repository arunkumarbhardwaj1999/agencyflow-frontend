import { PortalProjectDetailView } from "@/components/portal/portal-project-detail";

export default async function PortalProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PortalProjectDetailView projectId={id} />;
}
