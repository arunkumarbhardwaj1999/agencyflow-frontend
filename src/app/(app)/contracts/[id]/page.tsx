import { ContractDetailView } from "@/components/contracts/contract-detail-view";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContractDetailView contractId={id} />;
}
