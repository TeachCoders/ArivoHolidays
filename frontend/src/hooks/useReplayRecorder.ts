"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import apiClient, { getCsrfToken } from "@/lib/apiClient";
import {
  getSessionId,
  getVisitorId,
  getUserId,
  refreshIdentity,
} from "@/lib/analyticsIdentity";

const FLUSH_INTERVAL_MS = 5000;
const MAX_BATCH_BYTES = 400_000;
const MAX_RECORDING_MS = 30 * 60 * 1000; // cap a single recording at 30 minutes
const REPLAY_API_PATH = "/api/analytics/replay";

// Only record the public storefront – never admin/internal surfaces.
const NON_RECORDABLE_PREFIXES = ["/dashboard", "/profile", "/auth"];

function isRecordablePath(pathname: string | null): boolean {
  if (!pathname || typeof window === "undefined") return false;
  return !NON_RECORDABLE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function buildPayload(events: unknown[]) {
  return {
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    userId: getUserId(),
    userAgent: navigator.userAgent,
    events,
  };
}

async function postEvents(
  events: unknown[],
  useKeepalive: boolean
): Promise<void> {
  const payload = buildPayload(events);
  if (useKeepalive) {
    // Survives tab close / navigation unload.
    await fetch(REPLAY_API_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(getCsrfToken() ? { "X-CSRF-Token": getCsrfToken()! } : {}),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } else {
    await apiClient.post("/analytics/replay", payload);
  }
}

/** Sends the whole buffer, splitting into chunks under the size cap. */
async function drainAndSend(buffer: unknown[], useKeepalive: boolean) {
  while (buffer.length > 0) {
    let size = buffer.length;
    while (
      size > 1 &&
      JSON.stringify(buffer.slice(0, size)).length > MAX_BATCH_BYTES
    ) {
      size = Math.max(1, Math.floor(size / 2));
    }
    const chunk = buffer.splice(0, size);
    try {
      await postEvents(chunk, useKeepalive);
    } catch {
      // Analytics must never break browsing – swallow errors.
      break;
    }
  }
}

/**
 * Records DOM activity with rrweb on public storefront pages only
 * (/dashboard, /profile and /auth are never recorded) and periodically
 * ships batches to the backend so super-admins can replay a guest
 * visitor's session like a video. Logged-in users are NEVER recorded.
 */
export function useReplayRecorder() {
  const buffer = useRef<unknown[]>([]);
  const startedAt = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let stopFn: (() => void) | null = null;
    let flushTimer: ReturnType<typeof setInterval> | null = null;
    const eventBuffer = buffer.current;

    /** Guest-only: stops recording once the visitor logs in. */
    const haltIfLoggedIn = () => {
      if (cancelled || getUserId() === null) return false;
      stopFn?.();
      stopFn = null;
      if (flushTimer) clearInterval(flushTimer);
      flushTimer = null;
      void drainAndSend(eventBuffer, false); // flush what was captured while a guest
      return true;
    };

    async function start() {
      if (!isRecordablePath(pathname)) return;
      await refreshIdentity();
      if (cancelled) return;
      if (haltIfLoggedIn()) return; // logged-in users are never recorded

      const rrweb = await import("rrweb");
      if (cancelled || typeof rrweb.record !== "function") return;

      startedAt.current = Date.now();
      const maybeStop = rrweb.record({
        emit(event: unknown) {
          buffer.current.push(event);
          // Hard safety: never let the buffer grow unbounded.
          if (buffer.current.length > 20_000) buffer.current.splice(0, 10_000);
        },
        maskAllInputs: true, // privacy: typed values (e.g. passwords) are never captured
        blockSelector: "[data-replay-block]",
      });
      stopFn =
        typeof maybeStop === "function"
          ? () => {
              (maybeStop as () => void)();
            }
          : null;

      flushTimer = setInterval(() => {
        if (Date.now() - startedAt.current > MAX_RECORDING_MS) return; // recording stops at cap
        // Cheap login re-check (cached ≤5 min, no network spam).
        void refreshIdentity().then(() => haltIfLoggedIn());
        void drainAndSend(eventBuffer, false);
      }, FLUSH_INTERVAL_MS);
    }

    const handlePageHide = () => {
      void drainAndSend(buffer.current, true);
    };

    void start();
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      cancelled = true;
      if (flushTimer) clearInterval(flushTimer);
      window.removeEventListener("pagehide", handlePageHide);
      stopFn?.();
      stopFn = null;
      // Flush whatever was captured when leaving a recordable page.
      void drainAndSend(eventBuffer, false);
    };
  }, [pathname]);
}

export default useReplayRecorder;
