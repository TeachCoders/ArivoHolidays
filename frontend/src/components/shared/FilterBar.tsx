"use client";

import { useState, type ReactNode } from "react";
import { Check, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterSection {
  id: string;
  title: string;
  icon?: ReactNode;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export default function FilterBar({
  sections,
  activeCount,
  onClearAll,
  resultCount,
  totalCount,
}: {
  sections: FilterSection[];
  activeCount: number;
  onClearAll: () => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-1">
      <span className="hidden lg:flex items-center gap-2 pl-1 pr-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
        <SlidersHorizontal size={14} className="text-slate-400" />
        Refine
      </span>

      {sections.map((s) => (
        <FilterSelect key={s.id} section={s} />
      ))}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={13} strokeWidth={2.5} /> Clear all ({activeCount})
        </button>
      )}

      <span className="ml-auto hidden md:flex items-baseline gap-1.5 px-2 text-xs font-medium text-slate-500">
        <span className="font-bold text-[#1C1C1C]">{resultCount}</span>
        <span className="text-slate-400">
          of {totalCount} {totalCount === 1 ? "tour" : "tours"}
        </span>
      </span>
    </div>
  );
}

function FilterSelect({ section: s }: { section: FilterSection }) {
  const [open, setOpen] = useState(false);
  const selectedCount = s.selected.length;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border bg-white transition-colors duration-200 cursor-pointer",
            selectedCount > 0
              ? "border-slate-300 text-[#1C1C1C]"
              : "border-slate-200 text-[#555] hover:border-slate-300 hover:text-[#1C1C1C]"
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className={selectedCount > 0 ? "text-[#2E8B8B]" : "text-slate-400"}>
              {s.icon}
            </span>
            <span className="truncate">{s.title}</span>
            {selectedCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                {selectedCount}
              </span>
            )}
          </span>
          <ChevronDown
            size={15}
            className={cn(
              "transition-transform duration-200 text-slate-400 shrink-0",
              open && "rotate-180"
            )}
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="z-50 w-64 rounded-2xl bg-white p-0 outline-none ring-1 ring-slate-200/70 shadow-lg"
        >
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
            <span className="text-sm font-bold text-[#1C1C1C] flex items-center gap-2">
              <span className="text-slate-400">{s.icon}</span>
              {s.title}
            </span>
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={() => s.onChange([])}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto p-2 space-y-0.5">
            {s.options.length === 0 && (
              <p className="text-xs text-[#999] px-3 py-2">No options available</p>
            )}
            {s.options.map((opt) => {
              const checked = s.selected.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  onClick={() => {
                    const next = checked
                      ? s.selected.filter((v) => v !== opt.value)
                      : [...s.selected, opt.value];
                    s.onChange(next);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors",
                    checked
                      ? "bg-slate-50 text-[#1C1C1C] font-semibold"
                      : "text-[#555] hover:bg-slate-50"
                  )}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        "flex items-center justify-center w-[18px] h-[18px] rounded border transition-colors shrink-0",
                        checked ? "bg-slate-800 border-slate-800 text-white" : "border-slate-300"
                      )}
                    >
                      {checked && <Check size={11} strokeWidth={3.5} />}
                    </span>
                    <span className="truncate">{opt.label}</span>
                  </span>
                  {opt.count !== undefined && (
                    <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                      {opt.count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
