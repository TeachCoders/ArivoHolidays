import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  title?: string;
  subtitle?: string;
  className?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function Panel({ title, subtitle, className, actions, children }: PanelProps) {
  return (
    <section className={cn("rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
          <div>
            {title && (
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
            )}
            {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
