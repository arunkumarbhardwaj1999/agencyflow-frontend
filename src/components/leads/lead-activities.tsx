"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isPast, isToday } from "date-fns";
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  Mail,
  MonitorPlay,
  Phone,
  Presentation,
  Trash2,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  LEAD_ACTIVITY_TYPES,
  type LeadActivitiesGrouped,
  type LeadActivity,
  type Member,
} from "@/lib/types";
import { useMembers } from "@/lib/use-members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  meeting: Users,
  email: Mail,
  follow_up: CalendarClock,
  task: CheckCircle2,
  demo: MonitorPlay,
  proposal: Presentation,
};

function scheduleLabel(iso: string | null) {
  if (!iso) return "No date set";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "No date set";
  if (isToday(date)) return `Today · ${format(date, "h:mm a")}`;
  if (isPast(date)) return `Overdue · ${format(date, "dd MMM yyyy, h:mm a")}`;
  return format(date, "dd MMM yyyy, h:mm a");
}

function ActivityCard({
  activity,
  onComplete,
  onDelete,
  completing,
  deleting,
}: {
  activity: LeadActivity;
  onComplete?: () => void;
  onDelete?: () => void;
  completing?: boolean;
  deleting?: boolean;
}) {
  const Icon = TYPE_ICONS[activity.activity_type] ?? FileText;
  const when = activity.is_completed
    ? activity.completed_at
      ? format(new Date(activity.completed_at), "dd MMM yyyy, h:mm a")
      : ""
    : scheduleLabel(activity.scheduled_at);

  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-slate-900">
              {activity.title || activity.activity_label}
            </p>
            <p className="text-xs text-slate-500">{when}</p>
          </div>
          <div className="flex gap-1">
            {!activity.is_completed && onComplete && (
              <Button size="sm" variant="outline" disabled={completing} onClick={onComplete}>
                {completing ? "…" : "Mark done"}
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="ghost" disabled={deleting} onClick={onDelete} aria-label="Delete">
                <Trash2 className="h-4 w-4 text-slate-400" />
              </Button>
            )}
          </div>
        </div>
        {activity.notes && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{activity.notes}</p>
        )}
        {(activity.assigned_to_name || activity.created_by_name) && (
          <p className="mt-1 text-xs text-slate-400">
            {activity.assigned_to_name && <>Assigned: {activity.assigned_to_name}</>}
            {activity.assigned_to_name && activity.created_by_name && " · "}
            {activity.created_by_name && <>Logged by {activity.created_by_name}</>}
          </p>
        )}
      </div>
    </div>
  );
}

export function LeadActivities({ leadId, onChanged }: { leadId: string; onChanged?: () => void }) {
  const queryClient = useQueryClient();
  const { data: members = [] } = useMembers();
  const [modalOpen, setModalOpen] = useState(false);
  const [activityType, setActivityType] = useState<string>("call");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [markCompleted, setMarkCompleted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["lead-activities", leadId],
    queryFn: () => apiFetch<LeadActivitiesGrouped>(`/leads/${leadId}/activities`),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["lead-activities", leadId] });
    queryClient.invalidateQueries({ queryKey: ["lead-timeline", leadId] });
    queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    onChanged?.();
  };

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<LeadActivity>(`/leads/${leadId}/activities`, {
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
      setTitle("");
      setNotes("");
      setScheduledAt("");
      setMarkCompleted(false);
      invalidate();
    },
  });

  const completeMutation = useMutation({
    mutationFn: (activityId: string) =>
      apiFetch(`/leads/${leadId}/activities/${activityId}`, {
        method: "PATCH",
        body: JSON.stringify({ mark_completed: true }),
      }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (activityId: string) =>
      apiFetch(`/leads/${leadId}/activities/${activityId}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  function openCreate(type: string, completed = false) {
    setActivityType(type);
    setMarkCompleted(completed);
    setTitle("");
    setNotes("");
    setScheduledAt("");
    setModalOpen(true);
  }

  const upcoming = data?.upcoming ?? [];
  const completed = data?.completed ?? [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {LEAD_ACTIVITY_TYPES.map((t) => (
          <Button key={t.id} size="sm" variant="outline" onClick={() => openCreate(t.id)}>
            {t.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading activities…</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Upcoming follow-ups & activities ({upcoming.length})
            </h3>
            {upcoming.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No upcoming activities. Log a call, meeting, or follow-up above.
              </p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    completing={completeMutation.isPending}
                    deleting={deleteMutation.isPending}
                    onComplete={() => completeMutation.mutate(activity.id)}
                    onDelete={() => deleteMutation.mutate(activity.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Completed ({completed.length})
            </h3>
            {completed.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Completed calls, demos, and meetings will appear here.
              </p>
            ) : (
              <div className="space-y-2">
                {completed.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    deleting={deleteMutation.isPending}
                    onDelete={() => deleteMutation.mutate(activity.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Log ${LEAD_ACTIVITY_TYPES.find((t) => t.id === activityType)?.label ?? "activity"}`}
        description={
          markCompleted
            ? "Record something you already completed."
            : "Schedule an upcoming activity for this lead."
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
              {createMutation.isPending ? "Saving…" : markCompleted ? "Log completed" : "Schedule"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Activity type</Label>
            <Select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
              {LEAD_ACTIVITY_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Title (optional)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Discovery call with decision maker"
            />
          </div>
          {!markCompleted && (
            <div>
              <Label>Scheduled for</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          )}
          <div>
            <Label>Assign to</Label>
            <Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">Me (default)</option>
              {(members as Member[]).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="What was discussed? Next steps?"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={markCompleted}
              onChange={(e) => setMarkCompleted(e.target.checked)}
            />
            Already completed (log now, no schedule)
          </label>
          {createMutation.isError && (
            <p className="text-sm text-red-600">{(createMutation.error as Error).message}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
