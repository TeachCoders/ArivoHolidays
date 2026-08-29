"use client";

import { getCurrentUser } from "@/feature/auth/api";

/**
 * Shared browser-identity store for analytics tracking & replay recording.
 * IDs are bound to the logged-in user: whenever the user changes
 * (login / logout / switch), session and visitor IDs are regenerated so
 * different users' data never mixes under one visitor profile.
 */

const SESSION_KEY = "analytics_session_id";
const VISITOR_KEY = "analytics_visitor_id";
const USER_KEY = "analytics_user_key";
const ME_CACHE_MS = 5 * 60 * 1000;

let sessionId = "";
let visitorId = "";
let currentUserId: number | null = null;

let meIdCache: { at: number; promise: Promise<number | null> } | null = null;

/** Cached current-user lookup so frequent calls don't spam /auth/me. */
export function resolveCurrentUserId(): Promise<number | null> {
  if (!meIdCache || Date.now() - meIdCache.at > ME_CACHE_MS) {
    meIdCache = {
      at: Date.now(),
      promise: getCurrentUser()
        .then((u) => (typeof u?.id === "number" ? u.id : null))
        .catch(() => null),
    };
  }
  return meIdCache.promise;
}

export function getSessionId() {
  ensureIds();
  return sessionId;
}

export function getVisitorId() {
  ensureIds();
  return visitorId;
}

export function getUserId() {
  return currentUserId;
}

function ensureIds() {
  if (!sessionId) {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
      s = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, s);
    }
    sessionId = s;
  }
  if (!visitorId) {
    let v = localStorage.getItem(VISITOR_KEY);
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, v);
    }
    visitorId = v;
  }
}

/** Regenerates IDs when the logged-in user has changed. */
export function reconcileIdentity(userId: number | null) {
  const key = String(userId ?? "guest");
  if (localStorage.getItem(USER_KEY) !== key) {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(VISITOR_KEY);
    localStorage.setItem(USER_KEY, key);
    sessionId = "";
    visitorId = "";
  }
  currentUserId = userId;
  ensureIds();
}

/** Resolve the current user and sync stored identities to them. */
export async function refreshIdentity(): Promise<void> {
  const userId = await resolveCurrentUserId();
  reconcileIdentity(userId);
}
