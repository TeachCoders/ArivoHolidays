"use client";

import React, { useMemo, useState } from "react";
import { MapPin, X, Loader2, Sparkles, CalendarDays } from "lucide-react";
import { useGetJourneys } from "@/feature/journey/api/useJourney";
import type { Journey } from "@/feature/journey/type";
import FilterBar from "@/components/shared/FilterBar";
import TourPackageCard from "@/components/shared/TourPackageCard";
import Pagination from "@/components/shared/Pagination";
import {
  travelExperienceOptions,
  durationOptions,
  journeyMatchesExperiences,
  journeyMatchesDuration,
} from "@/feature/journey/filterOptions";

export default function PackagesExplorer({
  initialCities = [],
  initialExperiences = [],
}: {
  initialCities?: string[];
  initialExperiences?: string[];
}) {
  const { journeys, isLoading } = useGetJourneys({ limit: 100, isActive: "true" });

  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>(initialCities);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>(initialExperiences);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);

  const states = useMemo(() => {
    const set = new Set<string>();
    for (const j of journeys) {
      const state = j.cities?.[0]?.state?.title;
      if (state) set.add(state);
    }
    return [...set].sort();
  }, [journeys]);

  const stateOptions = useMemo(
    () =>
      states.map((s) => ({
        value: s,
        label: s,
        count: journeys.filter((j) => j.cities?.[0]?.state?.title === s).length,
      })),
    [states, journeys]
  );

  const cityOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string; count: number }>();
    for (const j of journeys) {
      for (const c of j.cities ?? []) {
        const entry = map.get(c.slug);
        if (entry) entry.count += 1;
        else map.set(c.slug, { value: c.slug, label: c.title, count: 1 });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [journeys]);

  const filtered = useMemo(() => {
    let list = journeys.filter((j) => {
      if (selectedStates.length > 0) {
        const state = j.cities?.[0]?.state?.title;
        if (!state || !selectedStates.includes(state)) return false;
      }
      if (selectedCities.length > 0) {
        const slugs = new Set(selectedCities);
        if (!(j.cities ?? []).some((c) => slugs.has(c.slug))) return false;
      }
      if (!journeyMatchesExperiences(j, selectedExperiences)) return false;
      if (!journeyMatchesDuration(j, selectedDurations)) return false;
      return true;
    });

    list = [...list].sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
    return list;
  }, [journeys, selectedStates, selectedCities, selectedExperiences, selectedDurations]);

  const clearAll = () => {
    setSelectedStates([]);
    setSelectedCities([]);
    setSelectedExperiences([]);
    setSelectedDurations([]);
  };

  const activeFilterCount =
    selectedStates.length +
    selectedCities.length +
    selectedExperiences.length +
    selectedDurations.length;

  const PAGE_SIZE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const key = filtered.map((j) => String(j.id ?? "")).join(",");
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    setCurrentPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  return (
    <div>
      <FilterBar
        sections={[
          {
            id: "state",
            title: "State",
            options: stateOptions,
            selected: selectedStates,
            onChange: setSelectedStates,
          },
          {
            id: "city",
            title: "Destination",
            icon: <MapPin size={14} />,
            options: cityOptions,
            selected: selectedCities,
            onChange: setSelectedCities,
          },
          {
            id: "experience",
            title: "Travel Experience",
            icon: <Sparkles size={14} />,
            options: travelExperienceOptions(journeys),
            selected: selectedExperiences,
            onChange: setSelectedExperiences,
          },
          {
            id: "duration",
            title: "Duration",
            icon: <CalendarDays size={14} />,
            options: durationOptions(journeys),
            selected: selectedDurations,
            onChange: setSelectedDurations,
          },
        ]}
        activeCount={activeFilterCount}
        onClearAll={clearAll}
        resultCount={filtered.length}
        totalCount={journeys.length}
      />

      <div className="mt-8">
        {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4561A]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#ececec] rounded-2xl">
          <X size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No tours match your filters</p>
          <button onClick={clearAll} className="mt-3 text-sm font-semibold text-[#D4561A] hover:underline">
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((j, i) => {
              const inPage = i >= (safePage - 1) * PAGE_SIZE && i < safePage * PAGE_SIZE;
              return (
                <div key={j.id} className={inPage ? "" : "hidden"}>
                  <TourPackageCard journey={j} />
                </div>
              );
            })}
          </div>
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      </div>
    </div>
  );
}

export function JourneyCard({ journey }: { journey: Journey }) {
  return <TourPackageCard journey={journey} />;
}
