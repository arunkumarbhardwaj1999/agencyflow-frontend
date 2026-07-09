"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Send, Sparkles } from "lucide-react";
import { apiFetch, apiStreamAI } from "@/lib/api";
import type { AIResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type AIResultModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** REST endpoint fallback when streamAction is not set */
  endpoint?: string;
  /** SSE stream action — preferred when set */
  streamAction?: string;
  body: Record<string, string>;
  /** When set, shows a "Send email" button that POSTs { content } to this endpoint. */
  sendEndpoint?: string;
  /** Label for who the email goes to (e.g. the client name/email). */
  sendLabel?: string;
  onSentSuccess?: () => void;
};

export function AIResultModal({
  open,
  onClose,
  title,
  description,
  endpoint,
  streamAction,
  body,
  sendEndpoint,
  sendLabel,
  onSentSuccess,
}: AIResultModalProps) {
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<string>("mock");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setContent("");
      setMode("mock");
      setError(null);
      setCopied(false);
      setLoading(false);
      setSending(false);
      setSentMsg(null);
    }
  }, [open]);

  async function run() {
    setLoading(true);
    setError(null);
    setContent("");
    setCopied(false);

    try {
      if (streamAction) {
        const result = await apiStreamAI(streamAction, body, (chunk, chunkMode) => {
          setMode(chunkMode);
          setContent((prev) => prev + chunk);
        });
        if (result.error) setError(result.error);
        else setMode(result.mode);
      } else if (endpoint) {
        const data = await apiFetch<AIResponse>(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        });
        setContent(data.content);
        setMode(data.mode);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function copyContent() {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendEmail() {
    if (!content || !sendEndpoint) return;
    setSending(true);
    setError(null);
    setSentMsg(null);
    try {
      const res = await apiFetch<{ message: string }>(sendEndpoint, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setSentMsg(res.message);
      onSentSuccess?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      icon={Sparkles}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {content && (
            <Button variant="outline" onClick={copyContent} className="gap-2">
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
          <Button onClick={run} disabled={loading || sending} variant={sendEndpoint ? "outline" : "default"} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </>
            ) : content ? (
              "Regenerate"
            ) : (
              "Generate"
            )}
          </Button>
          {sendEndpoint && content && (
            <Button onClick={sendEmail} disabled={sending || loading} className="gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending…" : "Send email"}
            </Button>
          )}
        </>
      }
    >
      <div className="py-2">
        {!content && !loading && !error && (
          <p className="text-sm text-slate-500">
            Click Generate to draft with AI. Streams live when Claude is connected; mock mode works without a key.
          </p>
        )}
        {loading && !content && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            Generating…
          </div>
        )}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {sentMsg && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {sentMsg}
          </p>
        )}
        {sendEndpoint && sendLabel && !sentMsg && (
          <p className="text-xs text-slate-400">Sends to: {sendLabel}</p>
        )}
        {(content || loading) && (
          <div className="space-y-3">
            <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
              {mode === "live" ? "Claude AI" : "Mock preview"}
              {loading && " · streaming"}
            </span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder={loading ? "Waiting for AI…" : "Generated content appears here — edit before copying"}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
