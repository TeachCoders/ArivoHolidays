"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type DateRange = { from?: Date; to?: Date };

interface DarkDateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
}

export function DarkDateRangePicker({ value, onChange, placeholder = "Select travel dates" }: DarkDateRangePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1.5">
        {placeholder}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center gap-3 bg-white/5 border border-white/12 rounded-lg px-4 py-3 text-left transition-all duration-150 hover:border-amber-400/50 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
          >
            <CalendarIcon className="h-4 w-4 text-amber-400 shrink-0" />
            {value.from && value.to ? (
              <span className="text-white text-sm">
                {format(value.from, "MMM d, yyyy")} → {format(value.to, "MMM d, yyyy")}
                <span className="text-amber-400/60 text-[10px] ml-2 font-bold">
                  ({Math.ceil((value.to.getTime() - value.from.getTime()) / (1000 * 60 * 60 * 24))}N)
                </span>
              </span>
            ) : value.from ? (
              <span className="text-white text-sm">{format(value.from, "MMM d, yyyy")} → ...</span>
            ) : (
              <span className="text-white/30 text-sm">{placeholder}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto p-0 bg-gray-900 border-white/10 text-white shadow-2xl shadow-black/60"
        >
          <Calendar
            dark
            mode="range"
            selected={value}
            onSelect={(range) => {
              onChange(range as DateRange);
              if ((range as DateRange)?.from && (range as DateRange)?.to) setOpen(false);
            }}
            initialFocus
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
