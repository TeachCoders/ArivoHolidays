"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, Search, Loader2, Check } from "lucide-react";
import { useDebounce } from "./AsyncMultiSelect";

interface AsyncSelectProps<T extends string | number = number> {
  selectedId: T | null;
  onChange: (id: T | null) => void;
  fetchOptions: (search: string) => Promise<{ id: T; title: string }[]>;
  initialOptions?: { id: T; title: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  activeOnly?: boolean;
}

export default function AsyncSelect<T extends string | number = number>({
  selectedId,
  onChange,
  fetchOptions,
  initialOptions = [],
  placeholder = "Select an item",
  searchPlaceholder = "Search...",
  disabled = false,
  error,
  isOpen: isOpenProp,
  onOpenChange,
  activeOnly = false,
}: AsyncSelectProps<T>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Cached options stores all options we've ever seen (to keep title for selectedId)
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

    const validMatches = activeOnly 
      ? matches.filter(o => (o as { isActive?: boolean }).isActive !== false)
      : matches;

    return sortActiveFirst(validMatches);
  }, [searchResults, activeOnly]);

  const selectedOption = selectedId !== null ? cachedOptions.get(selectedId) : null;

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
        <span className={selectedOption ? "text-slate-700" : "text-slate-400 truncate"}>
          {selectedOption ? selectedOption.title : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
          <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
            {filtered.length === 0 && !loading ? (
              <p className="text-xs text-slate-400 p-3">No results found</p>
            ) : (
              <>
                {selectedId !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(null);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 transition-colors italic"
                  >
                    Clear selection
                  </button>
                )}
                {filtered.map((option) => {
                  const isChecked = selectedId === option.id;
                  return (
                    <button
                      key={String(option.id)}
                      type="button"
                      onClick={() => {
                        onChange(option.id);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 cursor-pointer transition-colors text-sm text-left ${
                        isChecked ? "bg-indigo-50 text-indigo-700 font-medium" : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="truncate">{option.title}</span>
                      {isChecked && <Check size={14} className="text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
