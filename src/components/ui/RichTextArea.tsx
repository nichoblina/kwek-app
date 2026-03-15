"use client";

import { forwardRef, useRef, useState, useImperativeHandle } from "react";
import { Bold, Italic, Code } from "lucide-react";

export interface RichTextAreaRef {
  getContent: () => { text: string; isHtml: boolean };
  setContent: (html: string) => void;
  focus: () => void;
}

interface RichTextAreaProps {
  placeholder?: string;
  minHeight?: string;
}

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  code: boolean;
}

/** Normalise contentEditable innerHTML into clean storable content. */
export function extractContent(html: string): { text: string; isHtml: boolean } {
  const hasFormatting = /<(strong|em|code)\b/i.test(html);
  if (hasFormatting) {
    const cleaned = html
      .replace(/<div>/gi, "<br>")
      .replace(/<\/div>/gi, "")
      .replace(/^<br>/, "")
      .trim();
    return { text: cleaned, isHtml: true };
  }
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<div>/gi, "\n")
    .replace(/<\/div>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
  return { text, isHtml: false };
}

export const RichTextArea = forwardRef<RichTextAreaRef, RichTextAreaProps>(
  function RichTextArea({ placeholder, minHeight = "60px" }, ref) {
    const innerRef = useRef<HTMLDivElement>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [active, setActive] = useState<ActiveFormats>({ bold: false, italic: false, code: false });

    useImperativeHandle(ref, () => ({
      getContent: () => extractContent(innerRef.current?.innerHTML ?? ""),
      setContent: (html: string) => {
        if (innerRef.current) {
          innerRef.current.innerHTML = html;
          setIsEmpty(!html || html === "<br>");
        }
      },
      focus: () => innerRef.current?.focus(),
    }));

    /** Walk up from the current selection to find an ancestor <code> element within our editor. */
    function getEnclosingCode(): HTMLElement | null {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;
      let node: Node | null = selection.getRangeAt(0).commonAncestorContainer;
      while (node && node !== innerRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "CODE") {
          return node as HTMLElement;
        }
        node = node.parentNode;
      }
      return null;
    }

    /** Refresh active-format indicators after selection changes. */
    function updateActive() {
      setActive({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        code: !!getEnclosingCode(),
      });
    }

    function handleInput() {
      const html = innerRef.current?.innerHTML ?? "";
      setIsEmpty(!html || html === "<br>");
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      if (e.key === "Enter") {
        e.preventDefault();
        document.execCommand("insertLineBreak");
      }
    }

    function applyBold(e: React.MouseEvent) {
      e.preventDefault();
      document.execCommand("bold");
      updateActive();
    }

    function applyItalic(e: React.MouseEvent) {
      e.preventDefault();
      document.execCommand("italic");
      updateActive();
    }

    function applyBlank(e: React.MouseEvent) {
      e.preventDefault();
      const selectedText = window.getSelection()?.toString() ?? "";
      const text = selectedText ? `{{${selectedText}}}` : `{{blank}}`;
      document.execCommand("insertText", false, text);
      handleInput();
    }

    function applyCode(e: React.MouseEvent) {
      e.preventDefault();
      const enclosing = getEnclosingCode();

      // Toggle off: unwrap the <code> element in place
      if (enclosing) {
        const parent = enclosing.parentNode;
        if (parent) {
          while (enclosing.firstChild) {
            parent.insertBefore(enclosing.firstChild, enclosing);
          }
          parent.removeChild(enclosing);
        }
        updateActive();
        return;
      }

      // Toggle on: wrap selection in <code>
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (range.collapsed) return;
      const selectedText = range.toString();
      const codeEl = document.createElement("code");
      codeEl.textContent = selectedText;
      range.deleteContents();
      range.insertNode(codeEl);
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStartAfter(codeEl);
      newRange.collapse(true);
      selection.addRange(newRange);
      updateActive();
    }

    function handleBlur() {
      setActive({ bold: false, italic: false, code: false });
    }

    function toolbarBtnClass(isActive: boolean) {
      return `w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer ${
        isActive
          ? "bg-text-primary text-bg"
          : "text-muted hover:text-text-primary hover:bg-border"
      }`;
    }

    return (
      <div className="flex flex-col gap-0 [&_code]:bg-surface [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_strong]:font-bold [&_em]:italic">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1 border-[1.5px] border-b-0 border-border rounded-t-xl bg-surface">
          <button onMouseDown={applyBold} className={toolbarBtnClass(active.bold)} title="Bold">
            <Bold size={12} strokeWidth={2.5} />
          </button>
          <button onMouseDown={applyItalic} className={toolbarBtnClass(active.italic)} title="Italic">
            <Italic size={12} strokeWidth={2.5} />
          </button>
          <button onMouseDown={applyCode} className={toolbarBtnClass(active.code)} title="Code">
            <Code size={12} strokeWidth={2.5} />
          </button>
          <button onMouseDown={applyBlank} className={toolbarBtnClass(false)} title="Insert blank (cloze)">
            <span className="font-mono text-[0.6rem] font-bold leading-none">[_]</span>
          </button>
        </div>
        {/* Editable area */}
        <div className="relative">
          {isEmpty && placeholder && (
            <span className="absolute top-0 left-3 pt-2.5 text-sm text-muted pointer-events-none select-none">
              {placeholder}
            </span>
          )}
          <div
            ref={innerRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onMouseUp={updateActive}
            onKeyUp={updateActive}
            onBlur={handleBlur}
            className="w-full px-3 py-2.5 rounded-b-xl border-[1.5px] border-border bg-bg text-sm text-text-primary leading-relaxed focus:outline-none focus:border-primary transition-colors"
            style={{ minHeight }}
          />
        </div>
      </div>
    );
  }
);
