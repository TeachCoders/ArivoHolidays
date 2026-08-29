// analytics utilities for the frontend
export type AnalyticsPayload = {
  country?: string;
  keyword?: string;
  page: string;
  referrer?: string;
  eventType: 'PAGE_VIEW' | 'CLICK' | 'SEARCH';
  durationMs?: number;
  element?: string;
  details?: any;
};

/**
 * Sends a single analytics event to the backend.
 * Errors are caught and logged silently – analytics must never break the UI.
 */
export async function sendAnalytics(event: AnalyticsPayload) {
  try {
    await fetch('/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch (e) {
    console.warn('[Analytics] failed to send event', e);
  }
}

/**
 * Resolve the visitor's country using the backend helper.
 * Returns undefined on error (e.g., localhost).
 */
export async function resolveCountry(): Promise<string | undefined> {
  try {
    const res = await fetch('/utils/ip-country');
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.country;
  } catch {
    return undefined;
  }
}
