"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useReplaySessions,
  useReplay,
  useDeleteReplay,
} from "@/feature/analytics/api/useAnalytics";
import ReplayPlayer from "@/components/analytics/ReplayPlayer";
import type { ReplaySessionInfo } from "@/feature/analytics/api";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function ReplaysBrowser() {
  const { sessions, isLoading, error } = useReplaySessions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { replay, isLoading: replayLoading } = useReplay(selectedId);
  const deleteReplay = useDeleteReplay();

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <Link
          href="/dashboard/analytics"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Analytics
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Session Replays</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Watch recorded visitor sessions from the public website, like a video.
            Guest visitors only – logged-in users are never recorded.
            Public storefront pages, inputs masked.
          </p>
        </div>
      </header>

      {isLoading && (
        <div className="text-gray-500 animate-pulse">Loading replays…</div>
      )}
      {error && (
        <div className="rounded-md border border-red-100 bg-red-50 p-4 text-red-600">
          Failed to load replay sessions.
        </div>
      )}

      {!isLoading && !error && sessions.length === 0 && (
        <div className="rounded-md border bg-white p-8 text-center text-gray-500 shadow-sm">
          No recordings yet. Browse the public site in another tab — batches
          arrive every ~5 seconds and appear here.
        </div>
      )}

      {sessions.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Started</th>
                <th className="px-4 py-3 font-medium">Last Activity</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Country</th>
                <th className="px-4 py-3 font-medium">Device</th>
                <th className="px-4 py-3 font-medium">Visitor</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(sessions as ReplaySessionInfo[]).map((s) => {
                const isOpen = selectedId === s.sessionId;
                return (
                  <Fragment key={s.sessionId}>
                    <tr
                      className={`transition-colors hover:bg-gray-50 ${
                        isOpen ? "bg-indigo-50/70" : ""
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-3">{fmtDate(s.startedAt)}</td>
                      <td className="whitespace-nowrap px-4 py-3">{fmtDate(s.lastEventAt)}</td>
                      <td className="px-4 py-3">
                        {s.user ? (
                          <span title={s.user.email}>
                            {s.user.name}{" "}
                            <span className="text-xs text-emerald-600">(user)</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">guest</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{s.country || "—"}</td>
                      <td className="px-4 py-3">{s.deviceType || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">
                        {(s.visitorId || s.sessionId).slice(0, 8)}…
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant={isOpen ? "outline" : "default"}
                          onClick={() => setSelectedId(isOpen ? null : s.sessionId)}
                        >
                          {isOpen ? "✕ Close" : "▶ Play"}
                        </Button>{" "}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deleteReplay.isPending}
                          onClick={() => deleteReplay.mutate(s.sessionId)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-white">
                        <td colSpan={7} className="border-b border-indigo-100 p-0">
                          <div className="border-t border-indigo-100 bg-gray-50">
                            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                              <span className="text-sm font-medium text-gray-700">
                                Session Replay ·{" "}
                                {s.user ? `${s.user.name} (user)` : "guest"} ·{" "}
                                {fmtDate(s.startedAt)}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedId(null)}
                              >
                                ✕ Close
                              </Button>
                            </div>
                            <div className="px-4 pb-4" key={s.sessionId}>
                              {replayLoading || !replay ? (
                                <div className="flex h-[420px] items-center justify-center text-gray-500 animate-pulse">
                                  Loading recording…
                                </div>
                              ) : replay.count === 0 ? (
                                <p className="py-10 text-center text-gray-500">
                                  No events recorded for this session.
                                </p>
                              ) : (
                                <ReplayPlayer replay={replay} />
                              )}
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
    </div>
  );
}
