"use client";

import type { ReactNode } from "react";
import { Users, MousePointerClick, Star, PhoneCall, Link2Off } from "lucide-react";
import type { AnalyticsStats } from "@/feature/analytics/api";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  accent: string;
}

function KpiCard({ label, value, hint, icon, accent }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-slate-400">{hint}</div>}
    </div>
  );
}

export default function KpiRow({ stats }: { stats: AnalyticsStats }) {
  const pageViews = (stats.trend ?? []).reduce((sum, d) => sum + d.count, 0);
  const funnel = stats.funnel;
  const totalLeads = funnel?.totalLeads ?? 0;
  const conversion = funnel?.conversionRate ?? 0;
  const brokenCount = stats.notFound?.length ?? 0;
  const topPage = stats.topPages[0];
  const topPageLabel = topPage?.pagePath ? (topPage.pagePath || "—").replace(/^\//, "") || "Home" : "—";
  const topPageSub = topPage ? `${topPage.totalVisits} visits · ${topPage.avgTimeSeconds ? `${Number(topPage.avgTimeSeconds).toFixed(1)}s` : "—"}` : "no data yet";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <KpiCard
        label="Sessions"
        value={stats.totalSessions.toLocaleString()}
        hint="total tracked visits"
        icon={<Users className="h-4 w-4 text-indigo-600" />}
        accent="bg-indigo-50"
      />
      <KpiCard
        label="Page Views"
        value={pageViews.toLocaleString()}
        hint="pages loaded (30d)"
        icon={<MousePointerClick className="h-4 w-4 text-blue-600" />}
        accent="bg-blue-50"
      />
      <KpiCard
        label="Top Page"
        value={topPageLabel}
        hint={topPageSub}
        icon={<Star className="h-4 w-4 text-violet-600" />}
        accent="bg-violet-50"
      />
      <KpiCard
        label="Leads"
        value={totalLeads.toLocaleString()}
        hint={`${conversion}% conversion`}
        icon={<PhoneCall className="h-4 w-4 text-emerald-600" />}
        accent="bg-emerald-50"
      />
      <KpiCard
        label="Broken Pages"
        value={String(brokenCount)}
        hint={brokenCount ? "open 404 issues" : "no open issues"}
        icon={<Link2Off className="h-4 w-4 text-rose-600" />}
        accent="bg-rose-50"
      />
    </div>
  );
}
