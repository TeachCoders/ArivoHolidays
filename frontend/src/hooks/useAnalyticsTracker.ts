// src/hooks/useAnalyticsTracker.ts
import { useEffect } from "react";
import { sendAnalytics, resolveCountry } from "../utils/analytics";
import { analyticsConfig } from "../utils/analyticsConfig";

export const useAnalyticsTracker = (keyword?: string) => {
  const page = window.location.pathname + window.location.search;
  const referrer = document.referrer || undefined;
  const start = performance.now();

  const getCountry = async () => {
    if (!analyticsConfig.trackCountryKeyword) return undefined;
    try {
      const res = await fetch("/utils/ip-country");
      if (!res.ok) return undefined;
      const data = await res.json();
      return data.country;
    } catch {
      return undefined;
    }
  };

  const handleUnload = async () => {
    const durationMs = Math.round(performance.now() - start);
    const country = await getCountry();
    await sendAnalytics({
      country,
      keyword,
      page,
      referrer,
      eventType: "PAGE_VIEW",
      durationMs,
    });
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [keyword]);
};

export const initClickTracking = () => {
  if (!analyticsConfig.trackClicks) return;
  document.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    const selector =
      target?.closest("[data-analytics-id]")?.getAttribute("data-analytics-id") ??
      target?.tagName?.toLowerCase() ??
      "unknown";
    await sendAnalytics({
      page: window.location.pathname,
      referrer: document.referrer || undefined,
      eventType: "CLICK",
      element: selector,
      details: { x: e.clientX, y: e.clientY, text: target?.textContent?.trim() },
    });
  });
};
