"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, ChevronRight, Link2Off, AlertTriangle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useAnalyticsStats, useRetentionDays } from "@/feature/analytics/api/useAnalytics";
import { SITE_URL } from "@/lib/apiClient";
import SessionExplorer from "@/components/analytics/SessionExplorer";

export default function AnalyticsClient() {
  const { stats, isLoading, error } = useAnalyticsStats();
  const { retentionDays, save: saveRetention } = useRetentionDays();
  const [engageTab, setEngageTab] = useState<"dwell" | "recent">("dwell");
  const [flowTab, setFlowTab] = useState<"entry" | "exit">("entry");
  const [calOpen, setCalOpen] = useState(false);
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  // Retention is stored as days on the backend; the calendar picks the
  // cutoff date instead – data older than the chosen date gets deleted.
  const cutoffFromDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };
  const daysFromDate = (date: Date) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const picked = new Date(date); picked.setHours(0, 0, 0, 0);
    return Math.max(1, Math.round((today.getTime() - picked.getTime()) / 86_400_000));
  };

  // pageReference may be a full URL or just a path – normalise for display/link.
  const leadUrl = (p: string) => (p.startsWith("http") ? p : `${SITE_URL}${p}`);

  return (
    <>
      <Head><title>UX Analytics Dashboard – Arivo Holidays</title></Head>
      <main className="min-h-screen bg-gray-50 p-6 font-sans lg:p-8">
        <div className="mx-auto space-y-6">
          {/* Header */}
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">UX Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Sessions, replays, friction and user intent — all in one place.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Delete data older than
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Popover open={calOpen} onOpenChange={setCalOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex w-44 items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-left transition-colors hover:border-indigo-400 focus:border-indigo-500 focus:outline-none"
                      >
                        <CalendarIcon className="h-4 w-4 shrink-0 text-indigo-400" />
                        <span className={`text-sm font-medium ${retentionDays != null ? "text-gray-800" : "text-slate-400"}`}>
                          {retentionDays != null ? format(cutoffFromDays(retentionDays), "MMM d, yyyy") : "Select date"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={retentionDays != null ? cutoffFromDays(retentionDays) : undefined}
                        onSelect={(d) => {
                          if (!d) return;
                          saveRetention.mutate(daysFromDate(d as Date));
                          setCalOpen(false);
                        }}
                        initialFocus
                        disabled={(date) => {
                          const today = new Date(); today.setHours(0, 0, 0, 0);
                          return date >= today; // only past dates make sense as a cutoff
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {saveRetention.isPending && <span className="text-xs text-gray-500">Saving…</span>}
                </div>
                <p className="mt-1 text-[10px] text-gray-400">Older sessions, replays & activity are auto-deleted daily at 3 AM.</p>
                {saveRetention.isSuccess && !saveRetention.isPending && <p className="mt-1 text-[11px] text-emerald-600">Saved ✓</p>}
                {saveRetention.isError && <p className="mt-1 text-[11px] text-red-600">Save failed</p>}
              </div>
              <Link
                href="/dashboard/analytics/replays"
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Full Replays View
              </Link>
            </div>
          </header>

          {isLoading && <div className="animate-pulse text-gray-600">Loading analytics data…</div>}
          {error && (
            <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm text-red-600 shadow-sm">{error.message}</div>
          )}

          {!isLoading && !error && stats && (
            <>
              {/* Session-wise videos + analysis */}
              <SessionExplorer />

              {/* Aggregate panels */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 border-b pb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Leads by Page
                  </h3>
                  {stats.leadsByPage && stats.leadsByPage.length > 0 ? (
                    <ul className="space-y-3">
                      {stats.leadsByPage.map((l, i) => (
                        <li key={i} className="flex items-center justify-between rounded-md bg-indigo-50 p-3">
                          <a
                            href={leadUrl(l.pagePath)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 break-all pr-4 text-sm font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
                          >
                            {l.pagePath}
                          </a>
                          <span className="whitespace-nowrap rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">{l.leads} leads</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-500">No leads captured yet.</p>
                  )}
                </section>

                <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 border-b pb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    404 Page Tracking
                  </h3>
                  <p className="mb-3 text-xs text-gray-400">
                    Missing URLs visitors landed on, and which page led them there.
                  </p>
                  {stats.notFound && stats.notFound.length > 0 ? (
                    <ul className="space-y-3">
                      {stats.notFound.map((f, i) => {
                        const expanded = expandedPage === f.pagePath;
                        return (
                          <li key={i} className="overflow-hidden rounded-md bg-red-50">
                            <button
                              type="button"
                              onClick={() => setExpandedPage(expanded ? null : f.pagePath)}
                              className="flex w-full items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-red-100/70"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                {expanded ? (
                                  <ChevronDown className="h-4 w-4 shrink-0 text-red-400" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 shrink-0 text-red-400" />
                                )}
                                <span className="truncate font-medium text-gray-800">{f.pagePath}</span>
                              </span>
                              <span className="flex shrink-0 items-center gap-2">
                                <span className="whitespace-nowrap rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                  {f.visitors} visitor{f.visitors !== 1 ? "s" : ""}
                                </span>
                                <span className="whitespace-nowrap rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">{f.hits} hits</span>
                              </span>
                            </button>
                            {expanded && (
                              <div className="border-t border-red-100 bg-white/60 p-3 pl-7">
                                {f.fromPages.length > 0 && (
                                  <div className="mb-3">
                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-red-500">Redirected from</p>
                                    <ul className="space-y-1">
                                      {f.fromPages.map((s, k) => (
                                        <li key={k} className="flex items-center justify-between gap-2 text-xs">
                                          <span className="min-w-0 flex-1 break-all text-gray-700">{s.source}</span>
                                          <span className="whitespace-nowrap rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">{s.count}×</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                <ul className="divide-y divide-red-100">
                                  {f.issues.map((iss, j) => (
                                    <li key={j} className="flex flex-wrap items-center gap-2 py-1.5 text-xs">
                                      {iss.clickedLink ? (
                                        <Link2Off className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                      ) : (
                                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                                      )}
                                      <span className="min-w-0 flex-1">
                                        <span className="break-all text-gray-700">from {iss.source}</span>
                                        {iss.clickedText ? <span className="text-gray-400"> · clicked "{iss.clickedText}"</span> : null}
                                        {iss.clickedLink ? <span className="block break-all text-gray-400">link: {iss.clickedLink}</span> : null}
                                      </span>
                                      <span className="whitespace-nowrap text-gray-400">
                                        {new Date(iss.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                                      </span>
                                    </li>
                                  ))}
                                  {f.issues.length === 0 && (
                                    <li className="py-1.5 text-xs italic text-gray-500">No individual not-found logs captured for this URL yet.</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="italic text-gray-500">No 404 page hits tracked yet.</p>
                  )}
                </section>
              </div>

              <div className="grid grid-cols-2 gap-6 flex-1">
              {/* Entry / Exit pages with quality threshold */}
              <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Entry & Exit Pages</h3>
                  <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                    {(["entry", "exit"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setFlowTab(tab)}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${flowTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                          }`}
                      >
                        {tab === "entry" ? "Entry Pages" : "Exit Pages"}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mb-3 text-xs text-gray-400">
                  Visits <span className="font-semibold text-gray-600">below 10 seconds</span> are not counted as valid.
                </p>
                {(flowTab === "entry" ? stats.entryPages : stats.exitPages)?.length ? (
                  <ul className="space-y-3">
                    {(flowTab === "entry" ? stats.entryPages : stats.exitPages)!.map((p) => (
                      <li key={p.pagePath} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-blue-50 p-3">
                        <a
                          href={leadUrl(p.pagePath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-0 break-all text-sm font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
                        >
                          {p.pagePath.startsWith("http") ? p.pagePath : `${SITE_URL}${p.pagePath}`}
                        </a>
                        <span className="flex shrink-0 items-center gap-2 text-xs font-semibold">
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">{p.entries} visits</span>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">{p.qualified} valid above 10s</span>
                          {p.avgSeconds != null && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">avg {p.avgSeconds}s</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-gray-500">Not enough data yet – time-on-page tracking just started.</p>
                )}
              </section>

              {/* Dwell time table + recent activity */}
              <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Where Users Spend Time
                  </h3>
                  <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                    {(["dwell", "recent"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setEngageTab(tab)}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${engageTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                          }`}
                      >
                        {tab === "dwell" ? "Time on Page" : "Recent"}
                      </button>
                    ))}
                  </div>
                </div>

                {engageTab === "dwell" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                          <th className="rounded-tl-lg px-4 py-2.5 font-medium">Page / Section Path</th>
                          <th className="px-4 py-2.5 font-medium">Avg Time on Page</th>
                          <th className="rounded-tr-lg px-4 py-2.5 font-medium">Total Views</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {stats.topPages.length > 0 ? (
                          stats.topPages.map((p, i) => (
                            <tr key={i} className="transition-colors hover:bg-gray-50">
                              <td className="px-4 py-2.5 font-medium text-gray-800">
                                <Link href={p.pagePath} target="_blank" className="break-all text-indigo-600 hover:text-indigo-800 hover:underline">
                                  {`${SITE_URL}${p.pagePath}`}
                                </Link>
                              </td>
                              <td className="px-4 py-2.5">
                                <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${p.avgTimeSeconds ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600"}`}>
                                  {p.avgTimeSeconds ? `${Number(p.avgTimeSeconds).toFixed(1)}s` : "below 1 second"}
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="whitespace-nowrap rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{p.totalVisits} visits</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={3} className="py-6 text-center text-gray-500">Not enough data to calculate time on page.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {engageTab === "recent" && (
                  <ul className="max-h-96 space-y-2 overflow-y-auto pr-1">
                    {(stats.recent ?? []).map((ev, i) => (
                      <li key={i} className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-xs">
                        <span className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold ${ev.eventName.includes("RAGE") || ev.eventName.includes("DEAD")
                            ? "bg-red-100 text-red-700"
                            : ev.eventName === "CLICK"
                              ? "bg-emerald-100 text-emerald-700"
                              : ev.eventName === "PAGE_VIEW"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-violet-100 text-violet-700"
                          }`}>
                          {ev.eventName.replace("_CLICK", "").replace("_", " ")}
                        </span>
                        <span className="min-w-0 flex-1 break-all text-xs text-gray-700">
                          {ev.pagePath ? (
                            <Link href={ev.pagePath} target="_blank" className="text-indigo-600 hover:text-indigo-800 hover:underline">
                              {`${SITE_URL}${ev.pagePath}`}
                            </Link>
                          ) : "—"}
                          {ev.element ? ` · ${ev.element}` : ""}{ev.sectionId ? ` · #${ev.sectionId}` : ""}
                        </span>
                        {ev.dwellTimeMs != null && <span className="whitespace-nowrap text-violet-600">{(ev.dwellTimeMs / 1000).toFixed(1)}s</span>}
                        <span className="whitespace-nowrap text-gray-400">
                          {new Date(ev.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </li>
                    ))}
                    {(stats.recent ?? []).length === 0 && (
                      <li className="py-6 text-center italic text-gray-500">No activity tracked yet.</li>
                    )}
                  </ul>
                )}
              </section>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
