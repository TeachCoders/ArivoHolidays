"use client";

import Link from "next/link";
import { useAnalyticsStats, useDismissHighFriction } from "@/feature/analytics/api/useAnalytics";
import { SITE_URL } from "@/lib/apiClient";
import TrafficTrend from "@/components/analytics/TrafficTrend";
import LiveView from "@/components/analytics/LiveView";

export default function AnalyticsClient() {
  const { stats, isLoading, error } = useAnalyticsStats();
  const dismissHighFriction = useDismissHighFriction();

  // pageReference may be a full URL or just a path – normalise for display/link.
  const leadUrl = (p: string) => (p.startsWith("http") ? p : `${SITE_URL}${p}`);

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 h-4 w-32 rounded bg-slate-200" />
              <div className="space-y-3">
                <div className="h-14 rounded-lg bg-slate-100" />
                <div className="h-14 rounded-lg bg-slate-100" />
                <div className="h-14 rounded-lg bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">{error.message}</div>
      )}

      {!isLoading && !error && stats && (
        <>
          {/* Traffic trend chart + live visitors */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TrafficTrend stats={stats} />
            </div>
            <div>
              <LiveView />
            </div>
          </div>

          {/* Aggregate stat cards */}
          {(stats.funnel || stats.totalSessions > 0) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Sessions</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalSessions ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Visits</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats.funnel?.totalVisits ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Leads</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.funnel?.totalLeads ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Conversion Rate</p>
                <p className="mt-2 text-3xl font-bold text-indigo-600">{stats.funnel ? `${stats.funnel.conversionRate}%` : "—"}</p>
              </div>
            </div>
          )}

          {/* Aggregate panels */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Leads by Page */}
            <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Leads by Page</h3>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-100">
                  {stats.leadsByPage?.length ?? 0} pages
                </span>
              </div>
              {stats.leadsByPage && stats.leadsByPage.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {stats.leadsByPage.map((l, i) => (
                    <div key={i} className="group flex items-center justify-between gap-3 rounded-lg border border-transparent p-2.5 transition-colors hover:border-indigo-100 hover:bg-indigo-50/40">
                      <a
                        href={leadUrl(l.pagePath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 break-all text-sm font-medium text-slate-700 hover:text-indigo-700 hover:underline"
                      >
                        {l.pagePath}
                      </a>
                      <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">{l.leads} leads</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-10 text-center">
                  <p className="text-sm font-medium text-slate-500">No leads captured yet.</p>
                  <p className="mt-0.5 text-xs text-slate-400">When visitors submit the enquiry form, their pages will appear here.</p>
                </div>
              )}
            </section>

            {/* High Friction Pages */}
            <section className="flex flex-col rounded-2xl border border-red-100/70 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">High Friction Pages</h3>
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-200">
                  {stats.highFriction?.length ?? 0} pages
                </span>
              </div>
              {stats.highFriction && stats.highFriction.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {stats.highFriction.map((f, i) => (
                    <div
                      key={i}
                      className="group flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50/50 p-3 transition-colors hover:border-red-200 hover:bg-red-50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="min-w-0 truncate font-medium text-slate-800">{f.pagePath}</span>
                          <span className="shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white" title="Total friction events">
                            {f.frictionEvents} issues
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {f.rageClicks > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-100 px-2 py-1 text-[11px] font-medium text-red-700">
                              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M10 2a6 6 0 00-4.24 10.24A2 2 0 005 14v1h10v-1a2 2 0 00-1.76-1.76A6 6 0 0010 2zM7 6a3 3 0 016 0" />
                              </svg>
                              Rage clicks · {f.rageClicks}
                            </span>
                          )}
                          {f.deadClicks > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100/90 px-2 py-1 text-[11px] font-medium text-amber-700">
                              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              Dead clicks · {f.deadClicks}
                            </span>
                          )}
                          {f.brokenLinks > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100/90 px-2 py-1 text-[11px] font-medium text-blue-700">
                              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5.172 10.828a2 2 0 01-2.828-2.828l3-3a2 2 0 012.828 0 1 1 0 001.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 005.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5z" clipRule="evenodd" />
                              </svg>
                              Broken links · {f.brokenLinks}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => dismissHighFriction.mutate(f.pagePath)}
                        disabled={dismissHighFriction.isPending}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Mark this page as resolved so it leaves the High Friction list"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        Resolved
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-red-200/70 bg-red-50/30 py-10 text-center">
                  <svg className="mb-2 h-8 w-8 text-red-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-slate-500">No friction events tracked yet</p>
                  <p className="mt-0.5 text-xs text-slate-400">Rage, dead or broken clicks on a page will show up here.</p>
                </div>
              )}
            </section>
          </div>

          {/* Recent activity */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Recent Activity
              </h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                Last {(stats.recent ?? []).length} events
              </span>
            </div>

            <ul className="max-h-96 space-y-2 overflow-y-auto pr-1">
              {(stats.recent ?? []).map((ev, i) => (
                <li key={i} className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs">
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
                  <span className="min-w-0 flex-1 break-all text-xs text-slate-700">
                    {ev.pagePath ? (
                      <Link href={ev.pagePath} target="_blank" className="text-indigo-600 hover:text-indigo-800 hover:underline">
                        {`${SITE_URL}${ev.pagePath}`}
                      </Link>
                    ) : "—"}
                    {ev.element ? ` · ${ev.element}` : ""}{ev.sectionId ? ` · #${ev.sectionId}` : ""}
                  </span>
                  {ev.dwellTimeMs != null && <span className="whitespace-nowrap text-violet-600">{(ev.dwellTimeMs / 1000).toFixed(1)}s</span>}
                  <span className="whitespace-nowrap text-slate-400">
                    {new Date(ev.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </li>
              ))}
              {(stats.recent ?? []).length === 0 && (
                <li className="py-6 text-center italic text-slate-500">No activity tracked yet.</li>
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}