"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { AnalyticsStats } from "@/feature/analytics/api";
import Panel from "./Panel";

const RANGES = [7, 14, 30] as const;
type Range = (typeof RANGES)[number];

export default function TrafficTrend({ stats }: { stats: AnalyticsStats }) {
  const [range, setRange] = useState<Range>(14);
  const trend = stats.trend ?? [];

  const data = useMemo(() => {
    if (trend.length === 0) return [];
    return trend.slice(-range).map((d) => ({
      date: formatShort(d.date),
      count: d.count,
    }));
  }, [trend, range]);

  const funnel = stats.funnel;

  return (
    <Panel
      title="Traffic Overview"
      subtitle="Daily page views and visitor → lead flow"
      actions={
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                range === r ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {r}D
            </button>
          ))}
        </div>
      }
    >
      {data.length > 0 ? (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                formatter={(value) => [`${value} views`, "Page Views"]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#4f46e5"
                strokeWidth={2}
                fill="url(#trafficFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-8 text-center text-sm italic text-gray-500">No page-view data yet.</p>
      )}

      {funnel && (
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="text-center">
            <div className="text-xl font-bold text-slate-900">{funnel.totalVisits.toLocaleString()}</div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Visits</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-emerald-600">{funnel.totalLeads.toLocaleString()}</div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Leads</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-600">{funnel.conversionRate}%</div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Conversion</div>
          </div>
        </div>
      )}
    </Panel>
  );
}

function formatShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
