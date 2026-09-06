"use client";

import { Globe2, MonitorSmartphone, Radio } from "lucide-react";
import { useLiveNow } from "@/feature/analytics/api/useAnalytics";
import Panel from "./Panel";

const EVENT_STYLES: Record<string, string> = {
  PAGE_VIEW: "bg-blue-100 text-blue-700",
  PAGE_DWELL: "bg-violet-100 text-violet-700",
  CLICK: "bg-emerald-100 text-emerald-700",
  RAGE_CLICK: "bg-red-100 text-red-700",
  DEAD_CLICK: "bg-orange-100 text-orange-700",
  BROKEN_LINK: "bg-rose-100 text-rose-700",
  SECTION_DWELL: "bg-violet-100 text-violet-700",
};

export default function LiveView() {
  const { data, isLoading } = useLiveNow();

  if (isLoading && !data) {
    return (
      <Panel title="Live Now" actions={<span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-500"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />Live</span>}>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </Panel>
    );
  }

  const activeNow = data?.activeNow ?? 0;
  const byCountry = data?.byCountry ?? [];
  const byDevice = data?.byDevice ?? [];
  const recent = data?.recentEvents ?? [];

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800">Live Now</h3>
            <p className="text-xs text-emerald-600">Visitors active in the last {data?.windowMinutes ?? 15} minutes</p>
          </div>
        </div>
        <div className="text-3xl font-bold tabular-nums text-emerald-700">{activeNow}</div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <Globe2 className="h-3.5 w-3.5 text-emerald-600" /> Countries
          </div>
          {byCountry.length === 0 ? (
            <p className="text-sm text-slate-400">No live activity.</p>
          ) : (
            <ul className="space-y-1.5">
              {byCountry.slice(0, 6).map((c, i) => (
                <li key={`${c.name}-${i}`} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{c.name}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <MonitorSmartphone className="h-3.5 w-3.5 text-emerald-600" /> Devices
          </div>
          {byDevice.length === 0 ? (
            <p className="text-sm text-slate-400">No live activity.</p>
          ) : (
            <ul className="space-y-1.5">
              {byDevice.map((d, i) => (
                <li key={`${d.name}-${i}`} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{d.name}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">{d.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <Radio className="h-3.5 w-3.5 text-emerald-600" /> Recent Events
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-400">No events in the last few minutes.</p>
          ) : (
            <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
              {recent.slice(0, 8).map((ev, i) => (
                <li key={i} className="flex items-center gap-1.5 text-[11px]">
                  <span className={`whitespace-nowrap rounded px-1.5 py-0.5 font-bold ${EVENT_STYLES[ev.eventName] || "bg-slate-100 text-slate-600"}`}>
                    {ev.eventName.replace("_CLICK", "").replace("_", " ")}
                  </span>
                  <span className="min-w-0 truncate text-slate-600">{ev.pagePath}</span>
                  <span className="ml-auto shrink-0 whitespace-nowrap text-slate-400">
                    {new Date(ev.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}