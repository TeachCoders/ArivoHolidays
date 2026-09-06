"use client";

import { useAnalyticsRange } from "@/feature/analytics/range-context";
import { useSearchIntents } from "@/feature/analytics/api/useAnalytics";
import ExportMenu from "./ExportMenu";
import { percentOf } from "./chartUtils";

interface KeywordStat {
  query?: string;
  destination?: string;
  filter?: string;
  count: number;
}

function LevelBadge({ count, max }: { count: number; max: number }) {
  if (max <= 0) return null;
  const ratio = count / max;
  if (ratio >= 0.6) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        High
      </span>
    );
  }
  if (ratio >= 0.3) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Low
    </span>
  );
}

const TYPE_STYLES: Record<string, { badge: string; dot: string }> = {
  Query: { badge: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  Destination: { badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  Filter: { badge: "bg-sky-100 text-sky-700", dot: "bg-sky-500" },
};

export default function SearchIntentPanel() {
  const { range } = useAnalyticsRange();
  const { data, isLoading, error } = useSearchIntents(range);

  if (isLoading && !data) {
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white p-6" />
    );
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  }

  const intents = data ?? { totalIntents: 0, modifiedCount: 0, topQueries: [], topDestinations: [], topFilters: [] };

  const queries: KeywordStat[] = intents.topQueries.map((q) => ({ query: q.query, count: q.count }));
  const destinations: KeywordStat[] = intents.topDestinations.map((d) => ({ destination: d.destination, count: d.count }));
  const filters: KeywordStat[] = intents.topFilters.map((f) => ({ filter: f.filter, count: f.count }));

  const rows = [
    ...queries.map((q) => ({ type: "Query" as const, label: q.query, count: q.count })),
    ...destinations.map((d) => ({ type: "Destination" as const, label: d.destination, count: d.count })),
    ...filters.map((f) => ({ type: "Filter" as const, label: f.filter, count: f.count })),
  ];

  const total = intents.totalIntents || rows.reduce((s, r) => s + r.count, 0);
  const maxCount = rows.reduce((m, r) => Math.max(m, r.count), 0);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900">Search Intent</h3>
            <p className="truncate text-xs text-slate-500">
              What visitors are looking for when they search on your website
            </p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-100">
            {total.toLocaleString()} searches
          </span>
          <ExportMenu
            title="Search Intent"
            columns={["type", "label", "count"]}
            rows={rows}
          />
        </div>

        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800 text-xs uppercase tracking-wider text-white">
                  <th className="rounded-tl-lg px-5 py-2.5 font-medium">Type</th>
                  <th className="px-5 py-2.5 font-medium">Search Term</th>
                  <th className="px-5 py-2.5 text-right font-medium">Searches</th>
                  <th className="px-5 py-2.5 text-right font-medium">Level</th>
                  <th className="rounded-tr-lg px-5 py-2.5 text-right font-medium">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => {
                  const style = TYPE_STYLES[r.type];
                  const pct = percentOf(r.count, total);
                  return (
                    <tr key={i} className="transition-colors hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {r.type}
                        </span>
                      </td>
                      <td className="max-w-[20rem] break-words px-5 py-2.5 font-medium text-slate-800" title={r.label}>
                        {r.label || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-2.5 text-right tabular-nums text-slate-600">
                        {r.count.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-5 py-2.5 text-right">
                        <LevelBadge count={r.count} max={maxCount} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-2.5 text-right tabular-nums text-slate-600">
                        <span className="inline-flex min-w-[3.5rem] justify-end font-semibold text-slate-700">{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-6 text-center text-sm italic text-slate-400">No search data yet.</p>
        )}
      </section>
    </div>
  );
}