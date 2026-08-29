"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, GripVertical } from "lucide-react";

interface SearchableMultiSelectProps<T extends string | number = number> {
  options: { id: T; title: string }[];
  selectedIds: T[];
  onChange: (ids: T[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  error?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onReorder?: (fromId: T, toId: T) => void;
  activeOnly?: boolean;
}

export default function SearchableMultiSelect<T extends string | number = number>({
  options,
  selectedIds,
  onChange,
  placeholder = "Select items",
  searchPlaceholder = "Search...",
  loading = false,
  loadingText = "Loading...",
  disabled = false,
  error,
  isOpen: isOpenProp,
  onOpenChange,
  onReorder,
  activeOnly = false,
}: SearchableMultiSelectProps<T>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dragId, setDragId] = useState<T | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOpen = isOpenProp ?? internalOpen;

  const setOpen = (open: boolean) => {
    if (onOpenChange) onOpenChange(open);
    else setInternalOpen(open);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = q ? options.filter((o) => o.title.toLowerCase().includes(q)) : options;
    const hasActive = matches.some((o) => typeof (o as { isActive?: boolean }).isActive === "boolean");
    const sortActiveFirst = (list: typeof matches) => {
      if (!hasActive) return list;
      return [...list].sort((a, b) => {
        const aActive = (a as { isActive?: boolean }).isActive ? 0 : 1;
        const bActive = (b as { isActive?: boolean }).isActive ? 0 : 1;
        return aActive - bActive;
      });
    };
    const checked = matches
      .filter((o) => selectedIds.includes(o.id))
      .sort((a, b) => selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id));
    const uncheckedPool = activeOnly
      ? matches.filter((o) => !selectedIds.includes(o.id) && (o as { isActive?: boolean }).isActive !== false)
      : matches.filter((o) => !selectedIds.includes(o.id));
    const unchecked = sortActiveFirst(uncheckedPool);
    return [...checked, ...unchecked];
  }, [options, search, selectedIds, activeOnly]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (id: T) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => {
          setOpen(!isOpen);
          setSearch("");
        }}
        className={`w-full h-[38px] flex items-center justify-between px-3 text-sm border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors text-left ${
          error ? "border-red-400" : "border-slate-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-slate-400"}`}
      >
        <span className={selectedIds.length > 0 ? "text-slate-700" : "text-slate-400"}>
          {loading ? loadingText : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-0.5 w-full bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden">
          <div className="p-1.5 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:border-brand-500"
                autoFocus
              />
            </div>
          </div>
          <div className={`max-h-96 overflow-y-auto p-1.5 ${filtered.length > 10 && !loading ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1" : "space-y-0.5"}`}>
            {loading ? (
              <p className="text-xs text-slate-400 p-3">{loadingText}</p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-slate-400 p-3">No results found</p>
            ) : (
              filtered.map((option) => {
                const isChecked = selectedIds.includes(option.id);
                return (
                  <label
                    key={String(option.id)}
                    onDragOver={(e) => {
                      if (isChecked) e.preventDefault();
                    }}
                    onDrop={() => {
                      if (dragId !== null && dragId !== option.id && onReorder) {
                        onReorder(dragId, option.id);
                      }
                      setDragId(null);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 cursor-pointer transition-colors text-[13px] rounded-md ${
                      isChecked ? "bg-indigo-50/60" : "hover:bg-slate-50"
                    } ${isChecked && dragId !== null ? "opacity-70" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(option.id)}
                      className="w-3.5 h-3.5 rounded accent-indigo-600 shrink-0"
                    />
                    {isChecked && (
                      <span
                        draggable={!disabled}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", String(option.id));
                          setDragId(option.id);
                        }}
                        onDragEnd={() => setDragId(null)}
                        title="Drag to reorder"
                        className={`shrink-0 flex items-center justify-center w-4 h-6 rounded transition-colors ${
                          disabled
                            ? "cursor-not-allowed text-slate-200"
                            : "cursor-grab text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 active:cursor-grabbing"
                        }`}
                      >
                        <GripVertical size={13} />
                      </span>
                    )}
                    <span className={`font-medium truncate ${isChecked ? "text-indigo-700" : "text-slate-700"}`}>
                      {option.title}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
