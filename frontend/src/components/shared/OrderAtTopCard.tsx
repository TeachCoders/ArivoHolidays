"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import OrderedMultiSelect from "./OrderedMultiSelect";

interface OrderAtTopCardProps {
  options: { id: number; title: string; isActive?: boolean }[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  loading?: boolean;
  loadingText?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  saving?: boolean;
  onSave: () => void;
  dirty: boolean;
  activeOnly?: boolean;
  variant?: "card" | "flush";
}

export default function OrderAtTopCard({
  options,
  selectedIds,
  onChange,
  loading = false,
  loadingText = "Loading...",
  placeholder = "Select items",
  searchPlaceholder = "Search...",
  saving = false,
  onSave,
  dirty,
  activeOnly = false,
  variant = "card",
}: OrderAtTopCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={
      variant === "card" 
        ? "bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3"
        : "space-y-3"
    }>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-slate-500" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Order at Top</h2>
        </div>
        {dirty && (
          <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            Unsaved changes
          </span>
        )}
      </div>
      <OrderedMultiSelect
        options={options}
        selectedIds={selectedIds}
        onChange={onChange}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        loading={loading}
        loadingText={loadingText}
        helperText="Selected items appear at the top in this order. Drag from the grip icon to reorder."
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        activeOnly={activeOnly}
        actionButton={
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onSave();
            }}
            disabled={saving || !dirty}
            className="btn-primary px-4 h-[38px] text-xs disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0 shadow-sm"
          >
            {saving ? "Saving..." : "Save Order"}
          </button>
        }
      />
    </div>
  );
}
