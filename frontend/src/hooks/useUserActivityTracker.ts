"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getCsrfToken } from "@/lib/apiClient";
import { consumeNotFound } from "@/lib/analyticsNotFoundBuffer";
import {
  getSessionId,
  getVisitorId,
  getUserId,
  refreshIdentity,
} from "@/lib/analyticsIdentity";
import { type ActivityEvent } from "@/feature/analytics/api";
import { resolveNotFound } from "@/feature/analytics/api";
import { useFlushActivityEvents } from "@/feature/analytics/api/useAnalytics";
import { onSearchRefinement } from "@/lib/analyticsSearchEvents";

const BATCH_SIZE = 10;
const BATCH_INTERVAL_MS = 5000; // 5 seconds
const EVENTS_API_PATH = "/api/analytics/events";

export function useUserActivityTracker() {
  const pathname = usePathname();
  const flushMutation = useFlushActivityEvents();

  const eventsBatch = useRef<ActivityEvent[]>([]);
  const sectionEntryTimes = useRef<Record<string, number>>({});
  const lastClickTime = useRef<number>(0);
  const clickCount = useRef<number>(0);
  // Exact per-page dwell: accumulates VISIBLE time only (paused while tab hidden).
  const pageVisit = useRef<{ path: string; visibleMs: number; lastResume: number | null } | null>(null);
  // Context for broken-link attribution: last clicked anchor + previous page path.
  const lastLinkClick = useRef<{ href: string | null; text: string | null } | null>(null);
  const prevPathRef = useRef<string>("");
  const lastNotFound = useRef<{ path: string; at: number } | null>(null);

  // Guest-only tracking: logged-in users are never recorded.
  const isGuest = () => getUserId() === null;

  const flushBatch = useCallback(() => {
    if (eventsBatch.current.length === 0) return;
    if (!isGuest()) {
      eventsBatch.current = []; // logged-in: drop instead of send
      return;
    }
    const payload = {
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      userId: null,
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined,
      events: [...eventsBatch.current],
    };
    eventsBatch.current = [];
    flushMutation.mutate(payload);
  }, [flushMutation]);

  const trackEvent = useCallback(
    (eventData: Omit<ActivityEvent, "id" | "createdAt">) => {
      if (typeof window === "undefined") return;
      if (!isGuest()) return;
      eventsBatch.current.push({
        ...eventData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      });

      if (eventsBatch.current.length >= BATCH_SIZE) {
        flushBatch();
      }
    },
    [flushBatch]
  );

  // Emit the accumulated visible time for the current page as a PAGE_DWELL event.
  // <1s visits are ignored as noise.
  const finalizePageDwell = useCallback(() => {
    const v = pageVisit.current;
    if (!v) return;
    const totalMs = v.visibleMs + (v.lastResume != null ? Date.now() - v.lastResume : 0);
    if (totalMs >= 1000) {
      trackEvent({
        type: "DWELL",
        eventName: "PAGE_DWELL",
        pagePath: v.path,
        dwellTimeMs: totalMs,
      });
    }
    pageVisit.current = null;
  }, [trackEvent]);

  // Final flush when the tab is closed/hidden – keepalive fetch so it survives unload.
  const flushOnUnload = useCallback(() => {
    if (eventsBatch.current.length === 0) return;
    if (!isGuest()) {
      eventsBatch.current = []; // logged-in: drop instead of send
      return;
    }
    const payload = JSON.stringify({
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      userId: null,
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined,
      events: [...eventsBatch.current],
    });
    eventsBatch.current = [];
    fetch(EVENTS_API_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(getCsrfToken() ? { "X-CSRF-Token": getCsrfToken()! } : {}),
      },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, []);

  // Page view + exact dwell on every route change, after reconciling identity.
  // Guests only – logged-in users are never tracked.
  useEffect(() => {
    let cancelled = false;
    refreshIdentity().then(() => {
      if (cancelled || !isGuest()) return;
      trackEvent({
        type: "PAGE_VIEW",
        eventName: "PAGE_VIEW",
        pagePath: pathname,
      });
      // Real-time resolution: if this page loads successfully it is no longer
      // a broken/404 URL. Auto-resolve any recorded BROKEN_LINK for this path.
      // Idempotent – no-op when there are none on record.
      resolveNotFound(pathname).catch(() => {});
    });
    // Start a fresh visible-time visit for this page.
    pageVisit.current = { path: pathname, visibleMs: 0, lastResume: Date.now() };
    return () => {
      cancelled = true;
      finalizePageDwell(); // emit DWELL for the page we're leaving
      prevPathRef.current = pathname; // remember as "from" page for attribution
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Global listeners: batch interval, rage/dead/click tracking, unload flush.
  // Attached only for guest visitors – logged-in users are never tracked.
  useEffect(() => {
    let cancelled = false;
    let detach: (() => void) | null = null;

    const attach = () => {
      const interval = setInterval(flushBatch, BATCH_INTERVAL_MS);

      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const isInteractive = target.closest(
          'button, a, input, select, textarea, [role="button"]'
        );

        const now = Date.now();
        if (now - lastClickTime.current < 400) {
          clickCount.current += 1;
        } else {
          clickCount.current = 1;
        }
        lastClickTime.current = now;

        const text =
          target instanceof HTMLElement
            ? target.innerText?.substring(0, 50)
            : undefined;

        // Prefer an explicit analytics label if the element declares one
        const analyticsId =
          target.closest("[data-analytics-id]")?.getAttribute("data-analytics-id") ??
          undefined;

        const interactiveEl = isInteractive as HTMLElement | null;
        const elementLabel =
          analyticsId ??
          (interactiveEl === null
            ? target.tagName.toLowerCase()
            : interactiveEl instanceof HTMLInputElement
              ? `input[type=${interactiveEl.type || "text"}]`
              : `${interactiveEl.tagName.toLowerCase()}${
                  interactiveEl instanceof HTMLButtonElement && interactiveEl.type !== "button"
                    ? `[type=${interactiveEl.type}]`
                    : ""
                }`);

        // Remember the anchor so a resulting 404 can be attributed to this link.
        const anchor = target.closest("a") as HTMLAnchorElement | null;
        if (anchor) {
          lastLinkClick.current = {
            href: anchor.getAttribute("href"),
            text: anchor.innerText?.substring(0, 80) ?? null,
          };
        }

        if (clickCount.current >= 3) {
          trackEvent({
            type: "RAGE_CLICK",
            eventName: "RAGE_CLICK",
            pagePath: window.location.pathname,
            element: elementLabel,
            metadata: { text, x: e.clientX, y: e.clientY },
          });
          clickCount.current = 0; // reset
        } else if (isInteractive) {
          // Normal click on a button/link/form control
          trackEvent({
            type: "CLICK",
            eventName: "CLICK",
            pagePath: window.location.pathname,
            element: elementLabel,
            metadata: { text, x: e.clientX, y: e.clientY },
          });
        } else {
          trackEvent({
            type: "DEAD_CLICK",
            eventName: "DEAD_CLICK",
            pagePath: window.location.pathname,
            element: target.tagName.toLowerCase(),
            metadata: { text, x: e.clientX, y: e.clientY },
          });
        }
      };

      const handleVisibilityChange = () => {
        const v = pageVisit.current;
        if (document.visibilityState === "hidden") {
          if (v && v.lastResume != null) {
            v.visibleMs += Date.now() - v.lastResume;
            v.lastResume = null; // pause the dwell clock while tab is hidden
          }
          flushOnUnload();
        } else if (v && v.lastResume == null) {
          v.lastResume = Date.now(); // resume when tab becomes visible again
        }
      };

      const handlePageHide = () => {
        finalizePageDwell();
        flushOnUnload();
      };

      // 404 / broken URL landed on – attribute to last clicked link + previous page.
      const recordNotFound = (path: string) => {
        const now = Date.now();
        // Dedupe: same broken path within 10s (dev StrictMode double-fires).
        if (lastNotFound.current && lastNotFound.current.path === path && now - lastNotFound.current.at < 10000) return;
        lastNotFound.current = { path, at: now };
        trackEvent({
          type: "BROKEN_LINK",
          eventName: "BROKEN_LINK",
          pagePath: path,
          element: lastLinkClick.current?.href ?? undefined,
          metadata: {
            from: prevPathRef.current || null,
            clickedText: lastLinkClick.current?.text ?? null,
            referrer: document.referrer || null,
          },
        });
        flushOnUnload(); // ship immediately with the page context intact
      };

      const handleNotFound = () => recordNotFound(window.location.pathname);

      // Not-found pages queue their intent during mount, which can happen
      // before this async listener is attached – pick up any pending one now.
      const consumePendingNotFound = () => {
        const pending = consumeNotFound();
        // Only honour it if it still matches the page we're actually on,
        // so a stale buffer from a previous SPA navigation can't misfire.
        if (pending && pending.path === window.location.pathname) {
          recordNotFound(pending.path);
        }
      };

      document.addEventListener("click", handleClick);
      window.addEventListener("pagehide", handlePageHide);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("analytics:notfound", handleNotFound);

      consumePendingNotFound();

      detach = () => {
        clearInterval(interval);
        document.removeEventListener("click", handleClick);
        window.removeEventListener("pagehide", handlePageHide);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("analytics:notfound", handleNotFound);
      };
    };

    refreshIdentity().then(() => {
      if (!cancelled && isGuest()) attach();
    });

    return () => {
      cancelled = true;
      detach?.();
    };
  }, [trackEvent, flushOnUnload, flushBatch, finalizePageDwell]);

  // Section Tracking Methods
  const enterSection = useCallback((sectionId: string) => {
    sectionEntryTimes.current[sectionId] = Date.now();
  }, []);

  const leaveSection = useCallback(
    (sectionId: string) => {
      const entryTime = sectionEntryTimes.current[sectionId];
      if (entryTime) {
        const dwellTimeMs = Date.now() - entryTime;
        trackEvent({
          type: "SECTION_DWELL",
          eventName: "SECTION_DWELL",
          pagePath: window.location.pathname,
          sectionId,
          dwellTimeMs,
        });
        delete sectionEntryTimes.current[sectionId];
      }
    },
    [trackEvent]
  );

  const trackSearchRefinement = useCallback(
    (searchQuery: string, destination: string, filters: unknown) => {
      trackEvent({
        type: "SEARCH_INTENT",
        eventName: "SEARCH_REFINE",
        pagePath: window.location.pathname,
        metadata: { searchQuery, destination, filtersApplied: filters },
      });
    },
    [trackEvent]
  );

  // Subscribe to the search bar event bus so the site's search bar can report
  // SEARCH_INTENT events without mounting a second (duplicate) tracker.
  useEffect(() => onSearchRefinement((p) => trackSearchRefinement(p.searchQuery, p.destination, p.filtersApplied)), [trackSearchRefinement]);

  return { enterSection, leaveSection, trackSearchRefinement, trackEvent };
}
