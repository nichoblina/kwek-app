"use client";

import { useRef, useEffect } from "react";
import type { SimpleCard } from "@/lib/types";
import { RichTextArea, type RichTextAreaRef } from "@/components/ui/RichTextArea";

interface Props {
  card: SimpleCard;
  onSave: (front: string, back: string, isHtml: boolean) => void;
  onCancel: () => void;
}

export function InlineCardEditor({ card, onSave, onCancel }: Props) {
  const frontRef = useRef<RichTextAreaRef>(null);
  const backRef = useRef<RichTextAreaRef>(null);

  useEffect(() => {
    frontRef.current?.setContent(card.front);
    backRef.current?.setContent(card.back);
    frontRef.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    const { text: front, isHtml: frontIsHtml } = frontRef.current?.getContent() ?? { text: "", isHtml: false };
    const { text: back, isHtml: backIsHtml } = backRef.current?.getContent() ?? { text: "", isHtml: false };
    onSave(front, back, frontIsHtml || backIsHtml);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onCancel();
  }

  return (
    <div
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-3 bg-card border-[1.5px] border-primary rounded-xl px-4 py-3"
    >
      {/* Front */}
      <div className="flex flex-col gap-1">
        <label className="font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-muted">
          Front
        </label>
        <RichTextArea ref={frontRef} placeholder="What is…?" minHeight="56px" />
      </div>

      {/* Back */}
      <div className="flex flex-col gap-1">
        <label className="font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-muted">
          Back
        </label>
        <RichTextArea ref={backRef} placeholder="The answer is…" minHeight="56px" />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-4 py-1.5 rounded-lg font-semibold text-sm text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-1.5 rounded-lg font-bold text-sm transition-colors cursor-pointer"
          style={{ background: "var(--color-text-primary)", color: "var(--color-bg)" }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
