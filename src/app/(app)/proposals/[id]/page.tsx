import { ProposalBuilder } from "@/components/proposals/proposal-builder";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProposalBuilder proposalId={id} />;
}
