"use client";

import { useUserActivityTracker } from "@/hooks/useUserActivityTracker";
import { useReplayRecorder } from "@/hooks/useReplayRecorder";

/**
 * Global, invisible tracker mounted once in the root layout.
 * Records page views, rage/dead/click tracking and rrweb session replay
 * (public storefront pages only).
 */
export default function UserActivityTracker() {
  useUserActivityTracker();
  useReplayRecorder();
  return null;
}
