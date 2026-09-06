"use client";

import { useAnalyticsRange } from "@/feature/analytics/range-context";
import { useAnalyticsStats } from "@/feature/analytics/api/useAnalytics";
import Panel from "./Panel";
import ExportMenu from "./ExportMenu";
import { formatDuration } from "./chartUtils";

// Minimum acceptable average dwell (seconds) per page type.
function minSecondsForPage(pagePath: string): number {
  if (pagePath === "/" || pagePath === "" || pagePath === "/home") return 20;
  if (/\/tour-packages\/[^/]+\/[^/]+/.test(pagePath)) return 45;
  if (/tour-packages|travel-experience|\/packages|holiday/.test(pagePath)) return 60;
  if (/contact|enquiry|booking|quote|thank|form/.test(pagePath)) return 30;
  if (/destinations|\/(india|state|city|country|category|destination)/.test(pagePath)) return 45;
  if (/about|blog|story|team|faq|policy|terms|privacy/.test(pagePath)) return 45;
  return 30;
}

function StatusBadge({ pagePath, seconds }: { pagePath: string; seconds: number | null | undefined }) {
  if (seconds == null || isNaN(seconds)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
        No Data
      </span>
    );
  }
  const min = minSecondsForPage(pagePath);
  if (seconds >= 45) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Good
      </span>
    );
  }
  if (seconds >= min) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Fair
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Poor
    </span>
  );
}

export default function EngagementPanel() {
  const { range } = useAnalyticsRange();
  const { stats, isLoading, error } = useAnalyticsStats(range);

  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white p-6" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  }

  if (!stats) return null;

  const topPages = stats.topPages ?? [];

  return (
    <div className="space-y-6">
      <Panel
        title="Time Spent on Pages"
        subtitle="Average time visitors spend on each page"
        actions={
          <ExportMenu
            title="Time Spent on Pages"
            columns={["pagePath", "avgTimeSeconds", "totalVisits"]}
            rows={topPages.map((p) => ({
              pagePath: p.pagePath,
              avgTimeSeconds: p.avgTimeSeconds != null ? Number(p.avgTimeSeconds).toFixed(1) : "—",
              totalVisits: p.totalVisits,
            }))}
          />
        }
      >
        {topPages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800 text-xs uppercase text-white">
                  <th className="rounded-tl-lg px-4 py-2.5 font-medium">Page</th>
                  <th className="px-4 py-2.5 font-medium">Time Spent</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="rounded-tr-lg px-4 py-2.5 font-medium">Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topPages.map((p, i) => (
                  <tr key={i} className="transition-colors hover:bg-slate-50">
                    <td className="break-all px-4 py-2.5 font-medium text-slate-800">{p.pagePath}</td>
                    <td
                      className="whitespace-nowrap px-4 py-2.5 text-sm font-semibold text-amber-600"
                      title={p.avgTimeSeconds != null ? `Avg ${Number(p.avgTimeSeconds).toFixed(1)} seconds per visit` : undefined}
                    >
                      {formatDuration(p.avgTimeSeconds)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <StatusBadge pagePath={p.pagePath} seconds={p.avgTimeSeconds} />
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-600">{p.totalVisits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-6 text-center text-sm italic text-slate-400">Not enough data yet.</p>
        )}
      </Panel>
    </div>
  );
}
