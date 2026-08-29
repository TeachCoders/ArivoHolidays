"use client";

import { useEffect } from "react";
import { queueNotFound } from "@/lib/analyticsNotFoundBuffer";

/**
 * Renders on pages with missing or empty content (e.g. a CMS record with no
 * data). Queues/delivers the not-found intent so the analytics tracker records
 * it as a 404 hit, attributed to the page the visitor came from.
 */
export default function TrackMissingContent() {
  useEffect(() => {
    queueNotFound();
    window.dispatchEvent(new CustomEvent("analytics:notfound"));
  }, []);
  return null;
}
