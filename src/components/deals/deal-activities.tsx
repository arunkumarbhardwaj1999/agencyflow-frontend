"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isPast, isToday } from "date-fns";
import { CalendarClock, CheckCircle2, FileText, Mail, MonitorPlay, Phone, Presentation, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { DEAL_ACTIVITY_TYPES, type DealActivitiesGrouped, type DealActivity, type Member } from "@/lib/types";
import { useMembers } from "@/lib/use-members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone, meeting: Users, email: Mail, follow_up: CalendarClock,
  task: CheckCircle2, demo: MonitorPlay, proposal: Presentation,
};

function scheduleLabel(iso: string | null) {
  if (!iso) return "No date set";
  const date = new Date(iso);
  if (isToday(date)) return `Today · ${format(date, "h:mm a")}`;
  if (isPast(date)) return `Overdue · ${format(date, "dd MMM yyyy, h:mm a")}`;
  return format(date, "dd MMM yyyy, h:mm a");
}

function ActivityCard({ activity }: { activity: DealActivity }) {
  const Icon = TYPE_ICONS[activity.activity_type] ?? FileText;
  const when = activity.is_completed && activity.completed_at
    ? format(new Date(activity.completed_at), "dd MMM yyyy, h:mm a")
    : scheduleLabel(activity.scheduled_at);
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{activity.title || activity.activity_label}</p>
        <p className="text-xs text-slate-500">{when}</p>
        {activity.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{activity.notes}</p>}
      </div>
    </div>
  );
}

export function DealActivities({ dealId, onChanged }: { dealId: string; onChanged?: () => void }) {
  const queryClient = useQueryClient();
  const { data: members = [] } = useMembers();
  const [modalOpen, setModalOpen] = useState(false);
  const [activityType, setActivityType] = useState("call");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [markCompleted, setMarkCompleted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["deal-activities", dealId],
    queryFn: () => apiFetch<DealActivitiesGrouped>(`/deals/${dealId}/activities`),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/deals/${dealId}/activities`, {
        method: "POST",
        body: JSON.stringify({
          activity_type: activityType,
          title: title.trim() || null,
          notes: notes.trim() || null,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          assigned_to_id: assignedTo || null,
          mark_completed: markCompleted,
        }),
      }),
    onSuccess: () => {
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["deal-activities", dealId] });
      queryClient.invalidateQueries({ queryKey: ["deal-timeline", dealId] });
      onChanged?.();
    },
  });

  const upcoming = data?.upcoming ?? [];
  const completed = data?.completed ?? [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {DEAL_ACTIVITY_TYPES.map((t) => (
          <Button key={t.id} size="sm" variant="outline" onClick={() => { setActivityType(t.id); setModalOpen(true); }}>
            {t.label}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming ({upcoming.length})</h3>
            {upcoming.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No upcoming activities.</p>
            ) : (
              <div className="space-y-2">{upcoming.map((a) => <ActivityCard key={a.id} activity={a} />)}</div>
            )}
          </div>
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Completed ({completed.length})</h3>
            {completed.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No completed activities.</p>
            ) : (
              <div className="space-y-2">{completed.map((a) => <ActivityCard key={a.id} activity={a} />)}</div>
            )}
          </div>
        </div>
      )}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log activity"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
              {DEAL_ACTIVITY_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </Select>
          </div>
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Scheduled for</Label><Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} /></div>
          <div>
            <Label>Assign to</Label>
            <Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">Me</option>
              {(members as Member[]).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
          </div>
          <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={markCompleted} onChange={(e) => setMarkCompleted(e.target.checked)} />
            Already completed
          </label>
        </div>
      </Modal>
    </div>
  );
}
