"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.innerHTML === value) return;
    el.innerHTML = value || "";
  }, [value]);

  function emit() {
    const html = ref.current?.innerHTML ?? "";
    onChange(html === "<br>" ? "" : html);
  }

  function exec(cmd: string) {
    document.execCommand(cmd, false);
    ref.current?.focus();
    emit();
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-slate-200", className)}>
      <div className="flex gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => exec("bold")} aria-label="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => exec("italic")} aria-label="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => exec("insertUnorderedList")} aria-label="Bullet list">
          <List className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        data-placeholder={placeholder}
        className="min-h-[120px] px-3 py-2 text-sm text-slate-800 outline-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] [&_ul]:list-disc [&_ul]:pl-5"
      />
    </div>
  );
}

export function NoteContent({ content }: { content: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  if (isHtml) {
    return (
      <div
        className="prose prose-sm max-w-none text-slate-700 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return <p className="whitespace-pre-wrap text-sm text-slate-700">{content}</p>;
}
