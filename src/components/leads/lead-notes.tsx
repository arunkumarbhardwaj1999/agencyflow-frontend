"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { LeadNote } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { NoteContent, RichTextEditor } from "@/components/ui/rich-text-editor";

export function LeadNotes({ leadId, onChanged }: { leadId: string; onChanged?: () => void }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LeadNote | null>(null);
  const [content, setContent] = useState("");

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["lead-notes", leadId],
    queryFn: () => apiFetch<LeadNote[]>(`/leads/${leadId}/notes`),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["lead-notes", leadId] });
    queryClient.invalidateQueries({ queryKey: ["lead-timeline", leadId] });
    onChanged?.();
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { content: content.trim() };
      if (editing) {
        return apiFetch<LeadNote>(`/leads/${leadId}/notes/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      return apiFetch<LeadNote>(`/leads/${leadId}/notes`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      setOpen(false);
      setEditing(null);
      setContent("");
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) =>
      apiFetch(`/leads/${leadId}/notes/${noteId}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  function openCreate() {
    setEditing(null);
    setContent("");
    setOpen(true);
  }

  function openEdit(note: LeadNote) {
    setEditing(note);
    setContent(note.content);
    setOpen(true);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-slate-500">Client requirements, budget, decisions — keep context here.</p>
        <Button size="sm" variant="outline" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Add note
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading notes…</p>
      ) : notes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No notes yet. Example: budget ₹2 lakh, React website, decision next week.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
              <NoteContent content={note.content} />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-2">
                <p className="text-xs text-slate-400">
                  {note.created_by_name ?? "Team"} · {format(new Date(note.created_at), "dd MMM yyyy, h:mm a")}
                  {note.updated_at !== note.created_at && " (edited)"}
                </p>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(note)} aria-label="Edit note">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(note.id)}
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit note" : "Add note"}
        description="Use bold, lists, and line breaks. Saved with your name and timestamp."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              disabled={saveMutation.isPending || !content.replace(/<[^>]+>/g, "").trim()}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving…" : editing ? "Save changes" : "Add note"}
            </Button>
          </>
        }
      >
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Client wants website in React. Budget around ₹2 lakh. Decision next week."
        />
        {saveMutation.isError && (
          <p className="mt-2 text-sm text-red-600">{(saveMutation.error as Error).message}</p>
        )}
      </Modal>
    </div>
  );
}
