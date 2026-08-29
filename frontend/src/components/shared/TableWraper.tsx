import React from "react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

export interface TableWraperProps {
  title?: React.ReactNode;
  icon?: LucideIcon;
  subtitle?: string;
  count?: number;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  variant?: "default" | "brand" | "slate";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: "border-gray-100",
  brand: "border-brand-neutral-border",
  slate: "border-slate-100",
};

export default function TableWraper({
  title,
  icon: Icon,
  subtitle,
  count,
  centerContent,
  rightContent,
  variant = "default",
  children,
  className,
}: TableWraperProps) {
  return (
    <div className={clsx("bg-white rounded-2xl border", variantStyles[variant], className)} style={{ boxShadow: "0 4px 12px 0 rgb(0 0 0 / 0.08)" }}>
      {(title || rightContent || centerContent) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-inherit relative">
          <div className="flex items-center gap-2 relative z-10">
            {Icon && <Icon size={16} className="text-brand-600 shrink-0" />}
            {title && (
              typeof title === "string" ? (
                <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
              ) : (
                title
              )
            )}
            {count !== undefined && (
              <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          {subtitle && !centerContent && (
            <p className="text-xs text-gray-400 relative z-10">{subtitle}</p>
          )}
          {centerContent && (
            <div className="absolute left-1/2 -translate-x-1/2 z-0 hidden lg:block">
              {centerContent}
            </div>
          )}
          {rightContent && (
            <div className="flex items-center gap-2 relative z-10">{rightContent}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
