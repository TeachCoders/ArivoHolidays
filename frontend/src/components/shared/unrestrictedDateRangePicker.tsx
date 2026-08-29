"use client";
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";

type DateRange = {
  from?: Date;
  to?: Date;
};

interface UnrestrictedDateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
}

export function UnrestrictedDateRangePicker({ value, onChange, placeholder = "Select date range" }: UnrestrictedDateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[260px] justify-start text-left font-semibold text-xs h-10 border-slate-200 rounded-xl bg-slate-50 text-slate-700",
            !value.from && "text-slate-500"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
          {value.from && value.to ? (
            <span>{format(value.from, "MMM d, yyyy")} - {format(value.to, "MMM d, yyyy")}</span>
          ) : value.from ? (
            <span>{format(value.from, "MMM d, yyyy")} - Select End</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          selected={value}
          onSelect={(range) => {
            onChange(range as DateRange);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
