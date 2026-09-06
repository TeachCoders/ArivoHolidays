"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useAnalyticsRange, iso } from "@/feature/analytics/range-context";
import type { DateRange } from "@/feature/analytics/api";

const PRESETS = [
  { days: 7, label: "7D" },
  { days: 14, label: "14D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
];

export default function DateRangeFilter() {
  const { range, presetDays, setPreset, setCustom, label } = useAnalyticsRange();
  const [open, setOpen] = useState(false);

  const sel: { from?: Date; to?: Date } = {
    from: new Date(range.from),
    to: new Date(range.to),
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {PRESETS.map((p) => (
          <button
            key={p.days}
            type="button"
            onClick={() => setPreset(p.days)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              presetDays === p.days ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
            <span>{label}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-2">
          <Calendar
            mode="range"
            selected={sel}
            onSelect={(value) => {
              const v = value as { from?: Date; to?: Date } | undefined;
              if (v?.from && v?.to) {
                setCustom({ from: iso(v.from), to: iso(v.to) } satisfies DateRange);
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}