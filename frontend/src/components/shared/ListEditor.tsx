"use client";
import { useState, useRef, useEffect } from "react";
import RichTextEditor from "@/components/shared/RichTextEditor";

interface ListEditorProps {
  value: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  minHeight?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function listToHtml(items: string[]): string {
  const cleaned = items.map((i) => i.trim()).filter(Boolean);
  if (cleaned.length === 0) return "";
  return `<ul>${cleaned.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
}

function htmlToItems(html: string): string[] {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const lis = Array.from(doc.querySelectorAll("li"))
    .map((li) => li.textContent?.trim() || "")
    .filter(Boolean);
  if (lis.length > 0) return lis;
  return Array.from(doc.querySelectorAll("p"))
    .map((p) => p.textContent?.trim() || "")
    .filter(Boolean);
}

export default function ListEditor({
  value,
  onChange,
  placeholder = "Write one item per line and press Enter (creates a bullet list).",
  minHeight = "min-h-[120px]",
}: ListEditorProps) {
  const [html, setHtml] = useState(() => listToHtml(value));
  const htmlRef = useRef(html);
  htmlRef.current = html;

  useEffect(() => {
    const parsed = htmlToItems(htmlRef.current);
    if (JSON.stringify(parsed) !== JSON.stringify(value)) {
      setHtml(listToHtml(value));
    }
  }, [value]);

  return (
    <RichTextEditor
      content={html}
      onChange={(h) => {
        setHtml(h);
        onChange(htmlToItems(h));
      }}
      placeholder={placeholder}
      minHeight={minHeight}
    />
  );
}
