// Updated Calendar component to accept a disabled function
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";

export type CalendarProps = {
  /** "single" | "range" */
  mode?: "single" | "multiple" | "range";
  /** selected date or range */
  selected?: Date | Date[] | { from?: Date; to?: Date };
  /** callback when selection changes */
  onSelect?: (value: Date | Date[] | { from?: Date; to?: Date } | undefined) => void;
  /** focus on mount */
  initialFocus?: boolean;
  /** optional className */
  className?: string;
  /** optional disable function for dates */
  disabled?: (date: Date) => boolean;
  /** dark theme mode */
  dark?: boolean;
};

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  initialFocus = false,
  className,
  disabled,
  dark = false,
}: CalendarProps) {
  return (
    <>
      {dark && (
        <style>{`
          .rdp-dark { --rdp-cell-size: 40px; --rdp-background: rgba(251,191,36,0.15); }
          .rdp-dark .rdp { background: #111827; color: white; }
          .rdp-dark .rdp-months { background: #111827; }
          .rdp-dark .rdp-month { background: #111827; }
          .rdp-dark .rdp-caption_label { color: white; }
          .rdp-dark .rdp-nav_button { color: white; }
          .rdp-dark .rdp-nav_button:hover { background: rgba(255,255,255,0.1); }
          .rdp-dark .rdp-head_cell { color: rgba(255,255,255,0.5); }
          .rdp-dark .rdp-cell { color: white; }
          .rdp-dark .rdp-day:hover { background: rgba(255,255,255,0.08); }
          .rdp-dark .rdp-day_selected { background: #f59e0b; color: #111; font-weight: 700; }
          .rdp-dark .rdp-day_selected:hover { background: #d97706; }
          .rdp-dark .rdp-day_range_start { background: #f59e0b; color: #111; border-radius: 8px 0 0 8px; }
          .rdp-dark .rdp-day_range_end { background: #f59e0b; color: #111; border-radius: 0 8px 8px 0; }
          .rdp-dark .rdp-day_range_middle { background: rgba(251,191,36,0.15); color: white; border-radius: 0; }
          .rdp-dark .rdp-day_outside { color: rgba(255,255,255,0.2); }
          .rdp-dark .rdp-day_disabled { color: rgba(255,255,255,0.15); }
          .rdp-dark .rdp-chevron { color: white; }
        `}</style>
      )}
      <DayPicker
        mode={mode as any}
        selected={selected as any}
        onSelect={onSelect as any}
        disabled={disabled}
        className={cn(
          "p-3",
          dark ? "rdp-dark bg-gray-900 rounded-md shadow-2xl text-white" : "bg-white rounded-md shadow",
          className
        )}
      />
    </>
  );
}

