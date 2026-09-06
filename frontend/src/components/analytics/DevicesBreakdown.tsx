"use client";

import { Monitor } from "lucide-react";
import { useAnalyticsRange } from "@/feature/analytics/range-context";
import { useDeviceBreakdown } from "@/feature/analytics/api/useAnalytics";
import type { NameCount } from "@/feature/analytics/api";
import ExportMenu from "./ExportMenu";

interface GroupDef {
  category: string;
  dot: string;
  key: "devices" | "browsers" | "os" | "countries";
}

const GROUPS: GroupDef[] = [
  { category: "Device", dot: "bg-indigo-500", key: "devices" },
  { category: "Browser", dot: "bg-sky-500", key: "browsers" },
  { category: "Operating System", dot: "bg-violet-500", key: "os" },
  { category: "Country", dot: "bg-emerald-500", key: "countries" },
];

export default function DevicesBreakdown() {
  const { range } = useAnalyticsRange();
  const { data, isLoading, error } = useDeviceBreakdown(range);

  if (isLoading && !data) {
    return <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white p-6" />;
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  }

  const summary = data ?? { totalUsers: 0, devices: [], browsers: [], os: [], countries: [] };

  const exportRows = GROUPS.flatMap((g) =>
    (summary[g.key] ?? []).map((d: NameCount) => ({ category: g.category, name: d.name, count: d.count }))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900">Visitor Breakdown</h3>
          <p className="truncate text-xs text-slate-500">
            Devices, browsers, operating systems and countries your visitors come from
          </p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
          <Monitor className="h-3.5 w-3.5" />
          Total Users · {summary.totalUsers.toLocaleString()}
        </span>
        <ExportMenu title="Visitor Breakdown" columns={["category", "name", "count"]} rows={exportRows} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {GROUPS.map((g) => {
          const items: NameCount[] = summary[g.key] ?? [];
          const total = items.reduce((s, c) => s + c.count, 0);
          return (
            <section key={g.category} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 px-4 pt-3 pb-2.5">
                <span className={`h-2 w-2 rounded-full ${g.dot}`} />
                <h3 className="text-sm font-bold text-slate-900">{g.category}</h3>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500">
                  {total.toLocaleString()}
                </span>
              </div>

              {items.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800 text-xs uppercase tracking-wider text-white">
                      <th className="rounded-tl-lg px-4 py-2 font-medium">Name</th>
                      <th className="rounded-tr-lg px-4 py-2 text-right font-medium">Visitors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it) => (
                      <tr key={it.name} className="transition-colors hover:bg-slate-50">
                        <td className="max-w-[12rem] truncate px-4 py-2.5 font-medium text-slate-800" title={it.name}>
                          {it.name || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold tabular-nums text-slate-700">
                          {it.count.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="py-6 text-center text-sm italic text-slate-400">No data yet.</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}