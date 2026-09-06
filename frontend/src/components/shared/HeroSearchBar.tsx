"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Sparkles, X } from "lucide-react";
import { useJourneyFilters } from "@/feature/journey/api/useJourney";
import { travelExperienceIcon } from "@/components/shared/TravelExperiencePills";
import { emitSearchRefinement } from "@/lib/analyticsSearchEvents";

interface CityOption {
  id: number;
  slug: string;
  title: string;
  stateTitle?: string | null;
}

interface ExpOption {
  id: number;
  slug: string;
  title: string;
}

interface Suggestion {
  kind: "exp" | "city";
  key: string;
  title: string;
  item: ExpOption | CityOption;
}

export default function HeroSearchBar() {
  const router = useRouter();
  const { cities, experiences, isLoading } = useJourneyFilters();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);

  const q = query.trim().toLowerCase();

  const citySuggestions = useMemo(
    () =>
      q ? cities.filter((c) => c.title.toLowerCase().includes(q)).slice(0, 6) : cities.slice(0, 5),
    [q, cities]
  );

  const expSuggestions = useMemo(
    () =>
      q
        ? experiences.filter((e) => e.title.toLowerCase().includes(q)).slice(0, 6)
        : experiences.slice(0, 4),
    [q, experiences]
  );

  const merged = useMemo<Suggestion[]>(() => {
    const rows: Suggestion[] = [];
    const max = Math.max(expSuggestions.length, citySuggestions.length);
    for (let i = 0; i < max; i++) {
      if (i < expSuggestions.length) {
        const e = expSuggestions[i];
        rows.push({ kind: "exp", key: `e-${e.slug}`, title: e.title, item: e });
      }
      if (i < citySuggestions.length) {
        const c = citySuggestions[i];
        rows.push({ kind: "city", key: `c-${c.slug}`, title: c.title, item: c });
      }
    }
    return rows;
  }, [expSuggestions, citySuggestions]);

  const toggleCity = (c: CityOption) => {
    setSelectedCities((prev) => (prev.includes(c.slug) ? prev : [...prev, c.slug]));
  };

  const toggleExp = (e: ExpOption) => {
    setSelectedExperiences((prev) => (prev.includes(e.title) ? prev : [...prev, e.title]));
  };

  const go = () => {
    const params = new URLSearchParams();
    if (selectedCities.length > 0) params.set("city", selectedCities.join(","));
    if (selectedExperiences.length > 0) params.set("exp", selectedExperiences.join(","));
    const qs = params.toString();
    emitSearchRefinement({
      searchQuery: query.trim(),
      destination: selectedCities.join(","),
      filtersApplied: selectedExperiences,
    });
    router.push(qs ? `/tour-packages?${qs}` : "/tour-packages");
  };

  const cityLabel = (slug: string) => cities.find((c) => c.slug === slug)?.title || slug;
  const expLabel = (title: string) => title;

  const popularCities = cities.slice(0, 4);
  const popularExps = experiences.slice(0, 2);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative bg-gradient-to-r from-[#D4561A]/50 via-[#2E8B8B]/50 to-[#D4561A]/50 p-[1.5px] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)]">
        <div className="bg-white rounded-[14px] p-2 sm:p-3">
          <div className="flex flex-col sm:flex-row items-stretch gap-0">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2E8B8B]" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                onKeyDown={(e) => e.key === "Enter" && go()}
                placeholder="Where do you want to go? Try 'Jaipur', 'Honeymoon'..."
                className="w-full rounded-l-xl rounded-r-none border border-[#1C1C1C]/10 bg-[#f8f8f8] pl-12 pr-4 py-4 text-lg font-medium text-[#1C1C1C] placeholder-[#aaa] outline-none focus:border-[#D4561A] focus:ring-2 focus:ring-[#D4561A]/20 transition-all"
              />

              {open && merged.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-[#1C1C1C]/10 shadow-xl z-30 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="py-1.5 max-h-80 overflow-y-auto">
                    {merged.map((r) => {
                      if (r.kind === "exp") {
                        return (
                          <button
                            key={r.key}
                            type="button"
                            onMouseDown={(ev) => {
                              ev.preventDefault();
                              toggleExp(r.item as ExpOption);
                              setQuery("");
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm text-[#1C1C1C] hover:bg-[#f5f5f5] transition-colors"
                          >
                            <span className="w-4 h-4 shrink-0 text-[#D4561A]">
                              {travelExperienceIcon(r.title)}
                            </span>
                            <span className="flex-1 truncate">{r.title}</span>
                          </button>
                        );
                      }
                      return (
                        <button
                          key={r.key}
                          type="button"
                          onMouseDown={(ev) => {
                            ev.preventDefault();
                            toggleCity(r.item as CityOption);
                            setQuery("");
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm text-[#1C1C1C] hover:bg-[#f5f5f5] transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-[#2E8B8B] shrink-0" />
                          <span className="flex-1 truncate">{r.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={go}
              className="btn-gold px-8 py-4 rounded-r-xl rounded-l-none font-extrabold text-base flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          {selectedCities.length === 0 &&
            selectedExperiences.length === 0 &&
            !open &&
            (isLoading || popularCities.length > 0 || popularExps.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mt-2 px-1 pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#999]">
                  Popular
                </span>
                {isLoading
                  ? [0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className="h-6 w-16 rounded-full bg-[#f0f0f0] animate-pulse"
                      />
                    ))
                  : popularCities.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => {
                      toggleCity(c);
                    }}
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1C1C1C]/75 bg-white border border-[#1C1C1C]/10 hover:border-[#2E8B8B] hover:text-[#2E8B8B] rounded-full px-3 py-1 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {c.title}
                  </button>
                ))}
                {popularExps.map((e) => (
                  <button
                    key={e.slug}
                    type="button"
                    onClick={() => {
                      toggleExp(e);
                    }}
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1C1C1C]/75 bg-white border border-[#1C1C1C]/10 hover:border-[#D4561A] hover:text-[#D4561A] rounded-full px-3 py-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {e.title}
                  </button>
                ))}
              </div>
            )}

          {(selectedCities.length > 0 || selectedExperiences.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mt-2 px-1 pb-1">
              {selectedCities.map((slug) => (
                <span
                  key={slug}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1C1C] bg-[#eef6f6] border border-[#2E8B8B]/25 rounded-full px-3 py-1.5"
                >
                  <MapPin className="w-3 h-3 text-[#2E8B8B]" />
                  {cityLabel(slug)}
                  <button
                    type="button"
                    onClick={() => setSelectedCities((prev) => prev.filter((s) => s !== slug))}
                    className="text-[#1C1C1C]/50 hover:text-[#D4561A] transition-colors"
                    aria-label={`Remove ${cityLabel(slug)}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {selectedExperiences.map((title) => (
                <span
                  key={title}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1C1C] bg-[#fdf0e6] border border-[#D4561A]/25 rounded-full px-3 py-1.5"
                >
                  <Sparkles className="w-3 h-3 text-[#D4561A]" />
                  {expLabel(title)}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedExperiences((prev) => prev.filter((t) => t !== title))
                    }
                    className="text-[#1C1C1C]/50 hover:text-[#D4561A] transition-colors"
                    aria-label={`Remove ${title}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
