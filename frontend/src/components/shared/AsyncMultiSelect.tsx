"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, Search, GripVertical, Loader2 } from "lucide-react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface AsyncMultiSelectProps<T extends string | number = number> {
  selectedIds: T[];
  onChange: (ids: T[]) => void;
  fetchOptions: (search: string) => Promise<{ id: T; title: string }[]>;
  initialOptions?: { id: T; title: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onReorder?: (fromId: T, toId: T) => void;
  activeOnly?: boolean;
  columns?: number;
}

export default function AsyncMultiSelect<T extends string | number = number>({
  selectedIds,
  onChange,
  fetchOptions,
  initialOptions = [],
  placeholder = "Select items",
  searchPlaceholder = "Search...",
  disabled = false,
  error,
  isOpen: isOpenProp,
  onOpenChange,
  onReorder,
  activeOnly = false,
  columns = 1,
}: AsyncMultiSelectProps<T>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  
  const [dragId, setDragId] = useState<T | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cached options stores all options we've ever seen (to keep titles for selectedIds)
  const [cachedOptions, setCachedOptions] = useState<Map<T, { id: T; title: string }>>(
    new Map(initialOptions.map(opt => [opt.id, opt]))
  );
  
  // Current search results
  const [searchResults, setSearchResults] = useState<{ id: T; title: string }[]>(initialOptions);
  const [loading, setLoading] = useState(false);
  const hasFetchedInitial = useRef(false);

  const isOpen = isOpenProp ?? internalOpen;

  const setOpen = (open: boolean) => {
    if (onOpenChange) onOpenChange(open);
    else setInternalOpen(open);
  };

  const loadOptions = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const results = await fetchOptions(query);
      setSearchResults(results);
      
      // Update cache with new results
      setCachedOptions(prev => {
        const next = new Map(prev);
        results.forEach(r => next.set(r.id, r));
        return next;
      });
    } catch (err) {
      console.error("Failed to fetch options", err);
    } finally {
      setLoading(false);
    }
  }, [fetchOptions]);

  // Fetch when search changes
  useEffect(() => {
    if (isOpen) {
      loadOptions(debouncedSearch);
    }
  }, [debouncedSearch, isOpen, loadOptions]);

  // Initial fetch when opened for the first time
  useEffect(() => {
    if (isOpen && !hasFetchedInitial.current) {
      hasFetchedInitial.current = true;
      loadOptions("");
    }
  }, [isOpen, loadOptions]);

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

  const filtered = useMemo(() => {
    const matches = searchResults;
    const hasActive = matches.some((o) => typeof (o as { isActive?: boolean }).isActive === "boolean");
    
    const sortActiveFirst = (list: typeof matches) => {
      if (!hasActive) return list;
      return [...list].sort((a, b) => {
        const aActive = (a as { isActive?: boolean }).isActive ? 0 : 1;
        const bActive = (b as { isActive?: boolean }).isActive ? 0 : 1;
        return aActive - bActive;
      });
    };

    // Include selected options from cache even if they don't match the current search
    const checked = selectedIds
      .map(id => cachedOptions.get(id))
      .filter(Boolean) as { id: T; title: string }[];

    // Unchecked options from current search results
    const uncheckedPool = activeOnly
      ? matches.filter((o) => !selectedIds.includes(o.id) && (o as { isActive?: boolean }).isActive !== false)
      : matches.filter((o) => !selectedIds.includes(o.id));
      
    const unchecked = sortActiveFirst(uncheckedPool);

    // Remove duplicates from checked (just in case)
    const uniqueChecked = Array.from(new Map(checked.map(item => [item.id, item])).values());
    
    return [...uniqueChecked, ...unchecked];
  }, [searchResults, selectedIds, activeOnly, cachedOptions]);

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
        disabled={disabled}
        onClick={() => {
          setOpen(!isOpen);
          if (!isOpen) setSearch("");
        }}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors text-left ${
          error ? "border-red-400" : "border-slate-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-slate-400"}`}
      >
        <span className={selectedIds.length > 0 ? "text-slate-700" : "text-slate-400"}>
          {selectedIds.length > 0 ? `${selectedIds.length} selected` : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
                autoFocus
              />
              {loading && (
                <Loader2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-500 animate-spin" />
              )}
            </div>
          </div>
          <div className={`max-h-96 overflow-y-auto ${columns > 1 ? `grid grid-cols-${columns} gap-1 p-1` : 'divide-y divide-slate-50'}`}>
            {filtered.length === 0 && !loading ? (
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
                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors text-sm ${
                      isChecked ? "bg-indigo-50" : "hover:bg-slate-50"
                    } ${isChecked && dragId !== null ? "opacity-70" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(option.id)}
                      className="w-3.5 h-3.5 rounded accent-indigo-600 shrink-0"
                    />
                    {isChecked && onReorder && (
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
