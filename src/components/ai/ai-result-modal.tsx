"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
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
};

export function AIResultModal({
  open,
  onClose,
  title,
  description,
  endpoint,
  streamAction,
  body,
}: AIResultModalProps) {
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<string>("mock");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setContent("");
      setMode("mock");
      setError(null);
      setCopied(false);
      setLoading(false);
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
          <Button onClick={run} disabled={loading} className="gap-2">
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
