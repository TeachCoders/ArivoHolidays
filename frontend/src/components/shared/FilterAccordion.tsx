"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
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
  defaultOpen?: boolean;
}

export default function FilterAccordion({
  sections,
}: {
  sections: FilterSection[];
}) {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.id, s.defaultOpen ?? false]))
  );

  return (
    <div className="divide-y divide-[#ececec]">
      {sections.map((s) => {
        const isOpen = open[s.id];
        return (
          <div key={s.id}>
            <button
              type="button"
              onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
              className="w-full flex items-center justify-between py-3 text-left cursor-pointer group"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-[#1C1C1C] uppercase tracking-wider">
                {s.icon && <span className="text-[#D4561A]">{s.icon}</span>}
                {s.title}
                {s.selected.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#2E8B8B] text-white text-[10px] font-bold">
                    {s.selected.length}
                  </span>
                )}
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  "text-[#999] transition-transform duration-200 group-hover:text-[#555]",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <div className="pb-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                {s.options.length === 0 && (
                  <p className="text-xs text-[#999]">No options available</p>
                )}
                {s.options.map((opt) => {
                  const checked = s.selected.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex items-center justify-between gap-2 text-sm text-[#555] cursor-pointer hover:text-[#1C1C1C]"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? s.selected.filter((v) => v !== opt.value)
                              : [...s.selected, opt.value];
                            s.onChange(next);
                          }}
                          className="accent-[#D4561A]"
                        />
                        <span className="truncate">{opt.label}</span>
                      </span>
                      {opt.count !== undefined && (
                        <span className="text-xs text-[#aaa]">{opt.count}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
