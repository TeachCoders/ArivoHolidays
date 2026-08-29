"use client";

import React, { useState } from "react";
import { ChevronDown, GripVertical, ChevronUp, X } from "lucide-react";
import SearchableMultiSelect from "./SearchableMultiSelect";

interface OrderedMultiSelectProps<T extends string | number = number> {
  options: { id: T; title: string; isActive?: boolean }[];
  selectedIds: T[];
  onChange: (ids: T[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  helperText?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  activeOnly?: boolean;
  actionButton?: React.ReactNode;
}

export default function OrderedMultiSelect<T extends string | number = number>({
  options,
  selectedIds,
  onChange,
  placeholder = "Select items",
  searchPlaceholder = "Search...",
  loading = false,
  loadingText = "Loading...",
  disabled = false,
  helperText,
  isOpen,
  onOpenChange,
  activeOnly = false,
  actionButton,
}: OrderedMultiSelectProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [showList, setShowList] = useState(false);

  const move = (from: number, to: number) => {
    if (from === to) return;
    const arr = [...selectedIds];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  const moveById = (fromId: T, toId: T) => {
    const arr = [...selectedIds];
    const fromIdx = arr.indexOf(fromId);
    const toIdx = arr.indexOf(toId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx > fromIdx ? toIdx - 1 : toIdx, 0, item);
    onChange(arr);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <SearchableMultiSelect
            options={options}
            selectedIds={selectedIds}
            onChange={onChange}
            onReorder={moveById}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            loading={loading}
            loadingText={loadingText}
            disabled={disabled}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            activeOnly={activeOnly}
          />
          {helperText && <p className="text-[11px] text-slate-400 mt-1.5">{helperText}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setShowList((s) => !s)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 h-[38px] rounded-md text-xs font-semibold transition-colors border ${
                showList
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 shadow-sm"
              }`}
            >
              <ChevronDown size={14} className={`transition-transform ${showList ? "rotate-180" : ""}`} />
              {showList ? "Hide Order" : `Update Order (${selectedIds.length})`}
            </button>
          )}
          {actionButton}
        </div>
      </div>

      {showList && selectedIds.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mt-3">
          <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Top Order</p>
            <p className="text-[10px] text-slate-400">Drag or use arrows to reorder</p>
          </div>
          <div className="max-h-72 overflow-y-auto p-2 space-y-1.5 bg-slate-50/30">
            {selectedIds.map((id, idx) => {
              const opt = options.find((o) => o.id === id);
              if (!opt) return null;
              return (
                <div
                  key={String(id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null) move(dragIndex, idx);
                    setDragIndex(null);
                  }}
                  className={`flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm transition-all ${
                    dragIndex === idx ? "opacity-50 ring-2 ring-indigo-500 scale-[0.99]" : "hover:border-indigo-300 hover:shadow-md"
                  }`}
                >
                  <span
                    draggable={!disabled}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(id));
                      setDragIndex(idx);
                    }}
                    onDragEnd={() => setDragIndex(null)}
                    title="Drag to reorder"
                    className={`shrink-0 flex items-center justify-center w-6 h-8 rounded-md transition-colors ${
                      disabled
                        ? "cursor-not-allowed text-slate-200"
                        : "cursor-grab text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:cursor-grabbing"
                    }`}
                  >
                    <GripVertical size={16} />
                  </span>
                  
                  <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 text-[11px] font-black flex items-center justify-center shrink-0 border border-indigo-200/50">
                    {idx + 1}
                  </div>
                  
                  <span className="flex-1 text-sm font-semibold text-slate-700 truncate">{opt.title}</span>
                  
                  <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={idx === 0 || disabled}
                      onClick={() => move(idx, idx - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-slate-50 transition-colors"
                      title="Move Up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === selectedIds.length - 1 || disabled}
                      onClick={() => move(idx, idx + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-slate-50 transition-colors"
                      title="Move Down"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onChange(selectedIds.filter((i) => i !== id))}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 disabled:opacity-30 disabled:hover:bg-red-50 transition-colors"
                      title="Remove"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
