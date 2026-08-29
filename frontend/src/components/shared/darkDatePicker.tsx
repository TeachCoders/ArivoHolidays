"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface DarkDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  minDate?: Date;
}

export function DarkDatePicker({ value, onChange, label, minDate }: DarkDatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex-1">
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center gap-2 bg-white border border-brand-neutral-border rounded-lg px-3 py-2 text-left transition-all duration-150 hover:border-indigo-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 shadow-sm"
          >
            <CalendarIcon className="h-4 w-4 text-indigo-400 shrink-0" />
            {value ? (
              <span className="text-brand-neutral-dark text-sm font-medium">{format(value, "MMM d, yyyy")}</span>
            ) : (
              <span className="text-slate-400 text-sm">Select date</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto p-0 bg-white border-brand-neutral-border shadow-xl shadow-slate-200/50"
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => {
              onChange(d as Date | undefined);
              setOpen(false);
            }}
            initialFocus
            disabled={(date) => {
              if (minDate) {
                const min = new Date(minDate);
                min.setHours(0, 0, 0, 0);
                return date < min;
              }
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
