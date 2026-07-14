"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle } from "lucide-react";
import type { DuplicateLeadMatch } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  company_name: "Company",
};

export function DuplicateLeadDialog({
  open,
  duplicates,
  isEdit,
  onClose,
  onIgnore,
  onMerge,
}: {
  open: boolean;
  duplicates: DuplicateLeadMatch[];
  isEdit: boolean;
  onClose: () => void;
  onIgnore: () => void;
  onMerge: (sourceLeadId: string) => void;
}) {
  const primary = duplicates[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Possible duplicate found"
      description="A lead with matching details already exists in your workspace."
      icon={AlertTriangle}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="outline" onClick={onIgnore}>
            {isEdit ? "Save anyway" : "Create anyway"}
          </Button>
          {primary && (
            <Button onClick={() => onMerge(primary.lead_id)}>Merge</Button>
          )}
        </>
      }
    >
      <div className="space-y-3">
        {duplicates.map((dup) => (
          <div
            key={dup.lead_id}
            className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{dup.name}</p>
                {dup.email && <p className="text-sm text-slate-600">{dup.email}</p>}
                {dup.phone && <p className="text-sm text-slate-600">{dup.phone}</p>}
                {dup.company_name && <p className="text-sm text-slate-500">{dup.company_name}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">
                  Created {formatDistanceToNow(new Date(dup.created_at), { addSuffix: true })}
                </p>
                <Button size="sm" variant="outline" className="mt-2" asChild>
                  <Link href={`/leads/${dup.lead_id}`} onClick={onClose}>
                    Open existing lead
                  </Link>
                </Button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {dup.match_fields.map((field) => (
                <Badge key={field} variant="secondary" className="text-xs">
                  Matched on {FIELD_LABELS[field] ?? field}
                </Badge>
              ))}
            </div>
          </div>
        ))}
        {!isEdit && primary && (
          <p className="text-xs text-slate-500">
            Merge will combine this lead&apos;s details into the existing record and remove the duplicate.
          </p>
        )}
      </div>
    </Modal>
  );
}
