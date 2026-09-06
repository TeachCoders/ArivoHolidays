"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Activity, BarChart3, Compass, MousePointerClick, Radio, Video } from "lucide-react";
import { AnalyticsRangeProvider } from "@/feature/analytics/range-context";
import PrivatePageHeading from "@/components/shared/PrivatePageHeading";
import { cn } from "@/lib/utils";
import DateRangeFilter from "./DateRangeFilter";

type Tab = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const TABS: Tab[] = [
  { href: "/dashboard/analytics", label: "Overview", icon: BarChart3, exact: true },
  { href: "/dashboard/analytics/audience", label: "Devices", icon: Activity },
  { href: "/dashboard/analytics/acquisition", label: "Traffic Sources", icon: Compass },
  { href: "/dashboard/analytics/behavior", label: "Engagement", icon: MousePointerClick },
  { href: "/dashboard/analytics/events", label: "Search Intent", icon: Radio },
  { href: "/dashboard/analytics/replays", label: "Visitor Activity (Video)", icon: Video },
];

interface AnalyticsLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  hideHeader?: boolean;
}

export default function AnalyticsLayout({ title, subtitle, actions, children, hideHeader = false }: AnalyticsLayoutProps) {
  const pathname = usePathname();

  const activeTab = TABS.find(
    (tab) => (tab.exact ? pathname === tab.href : pathname.startsWith(tab.href))
  ) ?? TABS[0];

  return (
    <AnalyticsRangeProvider>
      <div className="mx-auto max-w-autoc space-y-5">
        {!hideHeader && (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <PrivatePageHeading
              icon={activeTab.icon}
              title={title}
              description={subtitle || activeTab.label}
            />
            <div className="flex flex-wrap items-center gap-2">
              <DateRangeFilter />
              {actions}
            </div>
          </div>
        )}
        <nav className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
          {TABS.map((tab) => {
            const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all",
                  active
                    ? "border-[#D4561A] bg-[#D4561A] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800"
                )}
              >
                <tab.icon className="h-3.5 w-3.5 shrink-0" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
    </AnalyticsRangeProvider>
  );
}