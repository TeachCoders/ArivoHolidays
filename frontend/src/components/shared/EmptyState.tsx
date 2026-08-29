import { type LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

/**
 * Centralized Empty/Not Found state.
 * Used across all dashboard pages — change here once, updates everywhere.
 */
export default function EmptyState({
  title = "No results found",
  description,
  icon: Icon = SearchX,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`bg-white border border-brand-neutral-border rounded-xl p-12 text-center ${className}`}>
      <Icon className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
      <p className="text-sm font-semibold text-brand-neutral-muted">{title}</p>
      {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
