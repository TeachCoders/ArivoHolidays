import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface SeoMeta {
  title?: string;
  seoTitle?: string;
  seoKeyword?: string;
  seoDescription?: string;
}

export function hasMissingSeo(item: SeoMeta): boolean {
  const seoTitle = (item.seoTitle || item.title || "").trim();
  const seoKeyword = (item.seoKeyword ?? "").trim();
  const seoDescription = (item.seoDescription ?? "").trim();
  return !seoTitle || !seoKeyword || !seoDescription;
}

export function seoPendingRowClass(item: SeoMeta): string {
  return hasMissingSeo(item)
    ? "bg-amber-50/60 hover:bg-amber-50 transition-colors"
    : "hover:bg-brand-neutral-light/50 transition-colors";
}

export default function SeoPendingBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap">
      <AlertTriangle size={11} /> SEO Pending
    </span>
  );
}

export function SeoCompleteBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
      <CheckCircle2 size={11} /> SEO Complete
    </span>
  );
}

