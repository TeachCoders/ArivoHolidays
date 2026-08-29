import apiClient from "@/lib/apiClient";

export type ActivityEventType =
  | "PAGE_VIEW"
  | "SECTION_DWELL"
  | "DWELL"
  | "RAGE_CLICK"
  | "DEAD_CLICK"
  | "CLICK"
  | "BROKEN_LINK"
  | "SEARCH_INTENT";

/** Human-friendly names shown in dashboards instead of raw event codes. */
export const EVENT_LABELS: Record<string, string> = {
  PAGE_VIEW: "Page Visit",
  PAGE_DWELL: "Time on Page",
  SECTION_DWELL: "Section Time",
  CLICK: "Click",
  RAGE_CLICK: "Rage Click",
  DEAD_CLICK: "Dead Click",
  BROKEN_LINK: "Broken Link",
  SEARCH_INTENT: "Search",
};

export const eventLabel = (name: string | null | undefined): string =>
  name ? (EVENT_LABELS[name] ?? name) : "";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  eventName: string;
  pagePath: string;
  sectionId?: string;
  dwellTimeMs?: number;
  element?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityBatchPayload {
  sessionId: string;
  visitorId: string;
  userId?: number | null;
  userAgent?: string;
  deviceType?: string;
  country?: string;
  totalTimeSpent?: number;
  events: Omit<ActivityEvent, "id">[];
}

/**
 * Sends a batch of user-activity events to the backend analytics ingestion API.
 */
export async function sendActivityBatch(
  payload: ActivityBatchPayload
): Promise<void> {
  await apiClient.post("/analytics/events", payload);
}

/* ───────────── Dashboard stats ───────────── */

export interface FlowPageStat {
  pagePath: string;
  entries: number;
  /** Visits with ≥10s on the page (sub-10s bounces excluded) */
  qualified: number;
  /** Avg seconds among qualified visits only */
  avgSeconds: number | null;
}

export interface AnalyticsStats {
  totalSessions: number;
  topPages: {
    pagePath: string;
    avgTimeSeconds: number;
    totalVisits: number;
  }[];
  notFound: {
    pagePath: string;
    hits: number;
    visitors: number;
    fromPages: {
      source: string;
      count: number;
      lastAt: string | null;
    }[];
    issues: {
      source: string;
      clickedLink: string | null;
      clickedText: string | null;
      referrer: string | null;
      sessionId: string;
      createdAt: string;
    }[];
  }[];
  topElements?: {
    pagePath: string;
    element: string;
    clicks: number;
    sampleText?: string | null;
  }[];
  leadsByPage?: {
    pagePath: string;
    leads: number;
  }[];
  recent?: {
    eventName: string;
    pagePath: string | null;
    element: string | null;
    sectionId: string | null;
    dwellTimeMs: number | null;
    createdAt: string;
  }[];
  entryPages?: FlowPageStat[];
  exitPages?: FlowPageStat[];
}

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const res = await apiClient.get<AnalyticsStats>("/analytics/stats");
  return res.data;
}

/* ───────────── Session replay ───────────── */

export interface ReplaySessionInfo {
  sessionId: string;
  visitorId: string | null;
  country: string | null;
  deviceType: string | null;
  user: { id: number; name: string; email: string } | null;
  batchCount: number;
  startedAt: string;
  lastEventAt: string;
}

export interface ReplayData {
  sessionId: string;
  count: number;
  events: Record<string, unknown>[];
}

export async function getReplaySessions(): Promise<ReplaySessionInfo[]> {
  const res = await apiClient.get<ReplaySessionInfo[]>(
    "/analytics/replay-sessions"
  );
  return res.data ?? [];
}

export async function getReplay(sessionId: string): Promise<ReplayData> {
  const res = await apiClient.get<ReplayData>(
    `/analytics/replay/${encodeURIComponent(sessionId)}`
  );
  return res.data;
}

export async function deleteReplay(sessionId: string): Promise<void> {
  await apiClient.delete(`/analytics/replay/${encodeURIComponent(sessionId)}`);
}

export interface SessionAnalysis {
  session: {
    id: string;
    visitorId: string | null;
    startedAt: string | null;
    endedAt: string | null;
    totalTimeSpent: number | null;
    country: string | null;
    deviceType: string | null;
    user: { id: number; name: string; email: string } | null;
  };
  totals: {
    totalEvents: number;
    pageViews: number;
    clicks: number;
    rageClicks: number;
    deadClicks: number;
    brokenLinks: number;
    dwells: number;
    searches: number;
  };
  pages: { pagePath: string; visits: number; avgDwellSeconds: number | null }[];
  elements: { element: string; clicks: number }[];
  friction: { at: string; eventName: string; pagePath: string | null; element: string | null; metadata?: Record<string, unknown> | null }[];
  timeline: {
    at: string;
    eventName: string;
    pagePath: string | null;
    element: string | null;
    sectionId: string | null;
    dwellTimeMs: number | null;
  }[];
}

export async function getSessionAnalysis(sessionId: string): Promise<SessionAnalysis> {
  const res = await apiClient.get<SessionAnalysis>(
    `/analytics/session/${encodeURIComponent(sessionId)}/analysis`
  );
  return res.data;
}

/* ───────────── Data retention ───────────── */

export async function getRetentionDays(): Promise<number> {
  const res = await apiClient.get<{ retentionDays: number }>(
    "/analytics/retention-days"
  );
  return res.data?.retentionDays ?? 30;
}

export async function setRetentionDays(days: number): Promise<void> {
  await apiClient.put("/analytics/retention-days", { retentionDays: days });
}
