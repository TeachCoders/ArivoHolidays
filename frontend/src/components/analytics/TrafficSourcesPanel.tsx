"use client";

import { useMemo, useRef } from "react";
import { Pie, Bar } from "react-chartjs-2";
import type { Chart } from "chart.js";
import { Download, Link2, Search } from "lucide-react";
import { useAnalyticsRange } from "@/feature/analytics/range-context";
import { useTrafficSources } from "@/feature/analytics/api/useAnalytics";
import Panel from "./Panel";
import ExportMenu from "./ExportMenu";
import { CHART_COLORS, downloadChartPng, percentOf } from "./chartUtils";

const CHANNEL_HINTS: Record<string, string> = {
  Direct: "Came straight in without any referrer",
  "Organic Search": "Found via a search engine like Google / Bing",
  Social: "Came from Facebook / Instagram / WhatsApp",
  Referral: "Came from a link on another website",
};

export default function TrafficSourcesPanel() {
  const { range } = useAnalyticsRange();
  const { data, isLoading, error } = useTrafficSources(range);

  const pieRef = useRef<Chart<"pie"> | undefined | null>(null);
  const barRef = useRef<Chart<"bar"> | undefined | null>(null);

  const channels = useMemo(() => data?.channels ?? [], [data]);
  const keywords = useMemo(() => data?.keywords ?? [], [data]);
  const totalSessions = data?.totalSessions ?? 0;

  const pieData = useMemo(
    () => ({
      labels: channels.map((c) => c.channel),
      datasets: [
        {
          data: channels.map((c) => c.sessions),
          backgroundColor: CHART_COLORS.slice(0, channels.length),
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    }),
    [channels]
  );

  const barData = useMemo(
    () => ({
      labels: keywords.map((k) => (k.keyword.length > 28 ? `${k.keyword.slice(0, 27)}…` : k.keyword)),
      datasets: [
        {
          label: "Search Count",
          data: keywords.map((k) => k.count),
          backgroundColor: "#10b981",
          borderRadius: 6,
        },
      ],
    }),
    [keywords]
  );

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white p-6" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900">Traffic Sources</h2>
          </div>
          <p className="mt-0.5 text-sm text-slate-500">How and where visitors found your website</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
          {totalSessions.toLocaleString()} sessions
        </span>
        <ExportMenu
          title="Traffic Sources"
          columns={["channel", "sessions"]}
          rows={channels.map((c) => ({ channel: c.channel, sessions: c.sessions }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel
          title="Channels"
          subtitle="Which routes visitors came through"
          actions={
            <button
              type="button"
              onClick={() => downloadChartPng(pieRef.current, "channels-chart.png")}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" /> Chart
            </button>
          }
        >
          {channels.length > 0 ? (
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="h-52 w-52 shrink-0">
                <Pie
                  ref={pieRef}
                  data={pieData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
              <ul className="min-w-0 flex-1 space-y-3">
                {channels.map((c) => {
                  const pct = percentOf(c.sessions, totalSessions);
                  return (
                    <li key={c.channel}>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-800">{c.channel}</span>
                        <span className="tabular-nums text-slate-500">
                          {c.sessions.toLocaleString()} · {pct}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {CHANNEL_HINTS[c.channel] && (
                        <p className="mt-1 text-[11px] text-slate-400">{CHANNEL_HINTS[c.channel]}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="py-6 text-center text-sm italic text-slate-400">No traffic data yet.</p>
          )}
        </Panel>

        <Panel
          title="Organic Search Keywords"
          subtitle="What visitors searched on Google / Bing to find you"
          actions={
            <button
              type="button"
              onClick={() => downloadChartPng(barRef.current, "keywords-chart.png")}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" /> Chart
            </button>
          }
        >
          {keywords.length > 0 ? (
            <>
              <div className="h-56">
                <Bar
                  ref={barRef}
                  data={barData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { font: { size: 10 } }, grid: { display: false } },
                      y: { ticks: { precision: 0, font: { size: 11 } }, grid: { display: false } },
                    },
                  }}
                />
              </div>
              <ul className="mt-4 max-h-44 space-y-1.5 overflow-y-auto pr-1">
                {keywords.map((k) => (
                  <li key={k.keyword} className="flex items-center gap-2 text-xs">
                    <Search className="h-3 w-3 shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1 truncate font-medium text-slate-700">{k.keyword}</span>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                      {k.count}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="py-6 text-center text-sm italic text-slate-400">
              No organic keywords yet. Google keywords will appear here after Google Search Console integration.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}