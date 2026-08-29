"use client";

import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useReplaySessions,
  useReplay,
  useSessionAnalysis,
  useAnalyticsStats,
} from "@/feature/analytics/api/useAnalytics";
import { type SessionAnalysis, eventLabel } from "@/feature/analytics/api";
import ReplayPlayer from "./ReplayPlayer";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

const EVENT_STYLES: Record<string, string> = {
  PAGE_VIEW: "bg-blue-100 text-blue-700",
  PAGE_DWELL: "bg-violet-100 text-violet-700",
  CLICK: "bg-emerald-100 text-emerald-700",
  RAGE_CLICK: "bg-red-100 text-red-700",
  DEAD_CLICK: "bg-orange-100 text-orange-700",
  BROKEN_LINK: "bg-rose-100 text-rose-700",
  SECTION_DWELL: "bg-violet-100 text-violet-700",
  SEARCH_INTENT: "bg-amber-100 text-amber-700",
};

/** Translates technical CSS selectors into plain-language labels. */
function friendlyElement(el: string | null | undefined): string {
  if (!el) return "";
  const rules: [RegExp, string][] = [
    [/^input\[type=number\]$/i, "Number field"],
    [/^input\[type=email\]$/i, "Email field"],
    [/^input\[type=tel\]$/i, "Phone field"],
    [/^input\[type=password\]$/i, "Password field"],
    [/^input\[type=date\]$/i, "Date picker"],
    [/^input\[type=checkbox\]$/i, "Checkbox"],
    [/^input\[type=radio\]$/i, "Radio option"],
    [/^input\[type=file\]$/i, "File upload"],
    [/^input$/i, "Input field"],
    [/^select$/i, "Dropdown"],
    [/^textarea$/i, "Message box"],
    [/^button\[type=submit\]$/i, "Submit button"],
    [/^button$/i, "Button"],
    [/^a$/i, "Link"],
    [/^form$/i, "Form"],
  ];
  for (const [pattern, label] of rules) {
    if (pattern.test(el)) return label;
  }
  return el;
}

function Badge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-center">
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
    </div>
  );
}

/** Per-session behavioural breakdown shown beside the replay video. */
function AnalysisPanel({ sessionId }: { sessionId: string }) {
  const { analysis, isLoading } = useSessionAnalysis(sessionId);
  if (isLoading) return <div className="animate-pulse text-sm text-gray-500">Loading analysis…</div>;
  if (!analysis) return <p className="text-sm text-gray-400">No activity data for this session.</p>;

  const a = analysis as SessionAnalysis;
  const t = a.totals;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Badge label="Page Views" value={t.pageViews} />
        <Badge label="Clicks" value={t.clicks} />
        <Badge label="Events" value={t.totalEvents} />
      </div>
      <div className="flex flex-wrap gap-2 text-xs font-medium">
        <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-600">Rage: {t.rageClicks}</span>
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-600">Dead: {t.deadClicks}</span>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-600">Broken Links: {t.brokenLinks}</span>
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-violet-600">Time Records: {t.dwells}</span>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-600">Searches: {t.searches}</span>
      </div>

      <div>
        <h5 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Pages Visited</h5>
        <ul className="space-y-1">
          {a.pages.slice(0, 6).map((p) => (
            <li key={p.pagePath} className="flex justify-between gap-2 rounded bg-gray-50 px-2 py-1 text-xs">
              <span className="truncate text-gray-700">{p.pagePath}</span>
              <span className="whitespace-nowrap text-gray-500">
                {p.visits}×{p.avgDwellSeconds != null ? ` · ${p.avgDwellSeconds}s` : ""}
              </span>
            </li>
          ))}
          {a.pages.length === 0 && <li className="text-xs text-gray-400">—</li>}
        </ul>
      </div>

      {a.elements.length > 0 && (
        <div>
          <h5 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Clicked Elements</h5>
          <ul className="space-y-1">
            {a.elements.slice(0, 6).map((el) => (
              <li key={el.element} className="flex justify-between rounded bg-gray-50 px-2 py-1 text-xs">
                <span className="truncate text-gray-700" title={el.element}>{friendlyElement(el.element)}</span>
                <span className="text-gray-500">{el.clicks}×</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h5 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Recent Timeline</h5>
        <ul className="max-h-44 space-y-1 overflow-y-auto pr-1">
          {a.timeline.map((ev, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[11px] leading-snug">
              <span className={`whitespace-nowrap rounded px-1.5 py-0.5 font-semibold ${EVENT_STYLES[ev.eventName] || "bg-gray-100 text-gray-600"}`}>
                {eventLabel(ev.eventName)}
              </span>
              <span className="truncate text-gray-600" title={ev.pagePath || ""}>{ev.pagePath}{ev.element ? ` · ${friendlyElement(ev.element)}` : ""}</span>
              <span className="ml-auto whitespace-nowrap text-gray-400">{new Date(ev.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </li>
          ))}
          {a.timeline.length === 0 && <li className="text-xs text-gray-400">—</li>}
        </ul>
      </div>
    </div>
  );
}

export default function SessionExplorer() {
  const { sessions, isLoading, error } = useReplaySessions();
  const { stats } = useAnalyticsStats();
  const [openId, setOpenId] = useState<string | null>(null);
  const { replay, isLoading: replayLoading } = useReplay(openId);

  return (
    <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <header className="border-b px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Session-wise Replays & Analysis</h3>
          {stats && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {sessions.length} recorded / {stats.totalSessions} total tracked
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-400">Guest visitors only (logged-in users are never recorded) · public pages · inputs masked</p>
      </header>

      {isLoading && <div className="p-6 text-gray-500 animate-pulse">Loading sessions…</div>}
      {error && <div className="m-6 rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">Failed to load sessions.</div>}
      {!isLoading && !error && sessions.length === 0 && (
        <div className="p-8 text-center text-sm text-gray-500">
          No recordings yet. Browse the public site while logged out — batches arrive every ~5 seconds.
        </div>
      )}

      {sessions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50/70 text-xs uppercase text-gray-500">
                <th className="px-4 py-2.5 font-medium">Started</th>
                <th className="px-4 py-2.5 font-medium">User</th>
                <th className="px-4 py-2.5 font-medium">Country</th>
                <th className="px-4 py-2.5 font-medium">Device</th>
                <th className="px-4 py-2.5 font-medium">Visitor</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((s) => {
                const isOpen = openId === s.sessionId;
                return (
                  <Fragment key={s.sessionId}>
                    <tr className={`transition-colors hover:bg-gray-50 ${isOpen ? "bg-indigo-50/60" : ""}`}>
                      <td className="whitespace-nowrap px-4 py-2.5">{fmtDate(s.startedAt)}</td>
                      <td className="px-4 py-2.5">
                        {s.user ? (
                          <span title={s.user.email}>{s.user.name} <span className="text-xs text-emerald-600">(user)</span></span>
                        ) : (
                          <span className="text-xs text-gray-400">guest</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">{s.country || "—"}</td>
                      <td className="px-4 py-2.5">{s.deviceType || "—"}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{(s.visitorId || s.sessionId).slice(0, 8)}…</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">
                        <Button size="sm" variant={isOpen ? "outline" : "default"} onClick={() => setOpenId(isOpen ? null : s.sessionId)}>
                          {isOpen ? "✕ Close" : "▶ Play"}
                        </Button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={6} className="border-b border-indigo-100 p-0">
                          <div className="bg-slate-50/80 px-4 py-4">
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                              <div className="lg:col-span-2">
                                {replayLoading || !replay ? (
                                  <div className="flex h-[360px] items-center justify-center animate-pulse rounded-lg border bg-white text-sm text-gray-500">
                                    Loading recording…
                                  </div>
                                ) : replay.count === 0 ? (
                                  <div className="flex h-[360px] items-center justify-center rounded-lg border bg-white text-sm text-gray-500">
                                    No events recorded for this session.
                                  </div>
                                ) : (
                                  <ReplayPlayer replay={replay} />
                                )}
                              </div>
                              <aside className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm" key={s.sessionId}>
                                <h4 className="mb-3 text-sm font-semibold text-gray-800">Session Analysis</h4>
                                <AnalysisPanel sessionId={s.sessionId} />
                              </aside>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
