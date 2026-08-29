"use client";

/**
 * Reliable not-found signaling for analytics.
 *
 * The analytics tracker's listener is attached asynchronously (it first
 * resolves the current user via /auth/me before wiring up listeners), so a
 * one-shot window CustomEvent fired on page mount is easily lost to a race.
 * Instead, not-found pages write an intent here which the tracker consumes
 * once its listeners are ready.
 */
let pending: { path: string; at: number } | null = null;

export function queueNotFound(): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  const at = Date.now();
  // Keep the most recent intent; a newer landing wins over an older one.
  if (!pending || at >= pending.at) {
    pending = { path, at };
  }
}

export function consumeNotFound(): { path: string; at: number } | null {
  const p = pending;
  pending = null;
  return p;
}
