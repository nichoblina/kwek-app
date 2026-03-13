"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDecks } from "@/hooks/useDecks";
import { DeckEditor } from "@/components/deck/DeckEditor";
import { parseDeckFile } from "@/lib/importExport";
import { ArrowUpCircle, AlertTriangle } from "lucide-react";
import type { Deck } from "@/lib/types";
import type { ParsedDeckFile } from "@/lib/importExport";

export default function NewDeckPage() {
  const router = useRouter();
  const { createDeck } = useDecks();

  useEffect(() => { document.title = "New Deck · kwek"; }, []);

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<ParsedDeckFile["deck"] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Counter ref prevents flickering when cursor moves over child elements
  const dragCounter = useRef(0);

  function showError(msg: string) {
    setImportError(msg);
    setTimeout(() => setImportError(null), 4000);
  }

  function commitImport(deckData: ParsedDeckFile["deck"]) {
    const created = createDeck(deckData);
    router.push(`/decks/${created.id}`);
  }

  function processFile(file: File) {
    if (!file.name.endsWith(".json")) {
      showError("Wrong file type — drop a .kwek.json file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const { deck, versionMismatch } = parseDeckFile(json);
        if (versionMismatch) {
          setPendingImport(deck);
        } else {
          commitImport(deck);
        }
      } catch (err) {
        showError(err instanceof Error ? err.message : "Invalid file");
      }
    };
    reader.readAsText(file);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = "";
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const { files } = e.dataTransfer;
    if (!files?.length) return;
    if (files.length > 1) {
      showError("Drop one file at a time");
      return;
    }
    processFile(files[0]);
  }

  function handleSave(deck: Deck) {
    const created = createDeck({
      name: deck.name,
      description: deck.description,
      cards: deck.cards,
    });
    router.push(`/decks/${created.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 pb-16">
      <div className="mb-8">
        <Link
          href="/"
          className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted hover:text-text-primary transition-colors"
        >
          ← Home
        </Link>
      </div>

      {/* Import from file */}
      <div className="max-w-2xl mx-auto mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportFile}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl border-[1.5px] border-dashed transition-all cursor-pointer text-left group ${
            isDragging
              ? "border-primary bg-surface scale-[1.01]"
              : "border-border hover:border-primary hover:bg-surface"
          }`}
        >
          <ArrowUpCircle
            size={24}
            strokeWidth={2}
            className={`transition-colors shrink-0 ${
              isDragging ? "text-primary" : "text-muted group-hover:text-primary"
            }`}
          />
          <div>
            <p className="font-bold text-base text-text-primary">Import from file</p>
            <p className="text-sm text-muted mt-0.5">
              {isDragging
                ? "Drop to import deck"
                : "Drag & drop or click to upload a .kwek.json file"}
            </p>
          </div>
        </button>
        {importError && (
          <p className="mt-2 text-sm font-medium text-primary fade-in-up">✗ {importError}</p>
        )}
        {pendingImport && (
          <div className="mt-3 flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-500/40 bg-amber-500/10 fade-in-up">
            <AlertTriangle size={16} strokeWidth={2} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-500">Version mismatch</p>
              <p className="text-xs text-muted mt-0.5">
                This file was made with a newer version of kwek. Some content may not display correctly.
              </p>
              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={() => commitImport(pendingImport)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Import anyway
                </button>
                <button
                  onClick={() => setPendingImport(null)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-border text-muted hover:text-text-primary hover:border-text-primary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="max-w-2xl mx-auto flex items-center gap-4 mb-8">
        <div className="flex-1 border-t border-border" />
        <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-muted">
          or create from scratch
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      <DeckEditor deck={null} onSave={handleSave} onCancel={() => router.push("/")} />
    </div>
  );
}
