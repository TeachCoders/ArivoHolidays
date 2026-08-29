import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";

function sanitizeHtml(html: string): string {
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "script", "iframe", "form", "input", "button"],
    ADD_ATTR: ["target", "rel"],
  });
  return clean.replace(/<h1\b[^>]*>/gi, (match) => match.replace(/<h1/i, "<h2")).replace(/<\/h1>/gi, "</h2>");
}

export default function RichContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn("rich-text", className)}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
