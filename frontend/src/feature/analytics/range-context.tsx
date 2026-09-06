"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { DateRange } from "@/feature/analytics/api";

const DAY_MS = 24 * 60 * 60 * 1000;

export function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function presetRange(days: number): DateRange {
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * DAY_MS);
  return { from: iso(from), to: iso(to) };
}

interface AnalyticsRangeCtx {
  range: DateRange;
  presetDays: number;
  setPreset: (days: number) => void;
  setCustom: (r: DateRange) => void;
  label: string;
}

const Ctx = createContext<AnalyticsRangeCtx | null>(null);

export function AnalyticsRangeProvider({ children }: { children: ReactNode }) {
  const [presetDays, setPresetDays] = useState<number>(30);
  const [custom, setCustomState] = useState<DateRange | null>(null);

  const range = custom ?? presetRange(presetDays);

  const setPreset = useCallback((days: number) => {
    setPresetDays(days);
    setCustomState(null);
  }, []);

  const setCustom = useCallback((r: DateRange) => {
    setCustomState(r);
  }, []);

  const label = useMemo(() => {
    if (custom) return `${custom.from} → ${custom.to}`;
    return `Last ${presetDays} days`;
  }, [custom, presetDays]);

  const value = useMemo(
    () => ({ range, presetDays, setPreset, setCustom, label }),
    [range, presetDays, setPreset, setCustom, label]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAnalyticsRange() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAnalyticsRange must be used within AnalyticsRangeProvider");
  return ctx;
}