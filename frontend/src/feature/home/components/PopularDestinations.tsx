"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { SectionLabel } from "@/components/shared/SectionLabel";
import DestinationCard from "@/components/shared/DestinationCard";
import { useGetCities } from "@/feature/city/api/useCity";
import { useGetStates } from "@/feature/state/api/useState";
import type { State, PaginatedResponse as StatePage } from "@/feature/state/type";
import type { City, PaginatedResponse as CityPage } from "@/feature/city/type";

const TOP_CITIES_PER_STATE = 5;

export const PopularDestinations: React.FC<{
  initialStates?: StatePage<State> | null;
  initialCities?: CityPage<City> | null;
}> = ({ initialStates, initialCities }) => {
  const [activeState, setActiveState] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { states, isLoading: statesLoading } = useGetStates(
    {
      limit: 100,
      isActive: "true",
    },
    initialStates
  );
  const { cities, isLoading: citiesLoading } = useGetCities(
    {
      limit: 1000,
      isActive: "true",
    },
    initialCities
  );

  const items = useMemo(() => {
    const ordered = cities.filter((c) => (c.displayOrder ?? 0) > 0);
    const statesWithCities = states.filter((s) =>
      ordered.some((c) => c.stateId === s.id)
    );

    return statesWithCities.flatMap((state) =>
      ordered
        .filter((c) => c.stateId === state.id)
        .slice(0, TOP_CITIES_PER_STATE)
        .map((c) => {
          const tours = c._count?.journeys ?? 0;
          return {
            id: c.id,
            stateId: state.id,
            stateName: state.title,
            title: c.title,
            image: c.thumbImg || c.banner?.images?.[0],
            subtitle: tours > 0 ? `${tours}+ tours` : undefined,
            href: `/tour-packages/${state.country?.slug}/${state.slug}/${c.slug}`,
          };
        })
    );
  }, [cities, states]);

  const availableStates = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach(i => map.set(String(i.stateId), i.stateName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!activeState) return items;
    return items.filter(i => String(i.stateId) === String(activeState));
  }, [items, activeState]);

  const isLoading = statesLoading || citiesLoading;
  const bentoItems = filteredItems.slice(0, 18); // Take up to 18 for a dense bento grid

  return (
    <section id="destinations" className="py-20 bg-white relative border shadow-[inset_0_15px_20px_-15px_rgba(0,0,0,0.06)] z-10">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6 relative z-30">
          <div>
            <SectionLabel>Popular Destinations</SectionLabel>
            <h2 className="h2 text-[#1C1C1C] mt-2">Explore Top Places</h2>
            <p className="mt-2 text-base text-[#555]">Find the best holiday packages for India's most loved cities and hill stations.</p>
          </div>
          
          {!isLoading && availableStates.length > 0 && (
            <div className="relative inline-block shrink-0">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center justify-between gap-3 bg-white border px-6 py-3 rounded-full text-sm font-bold shadow-sm outline-none transition-all min-w-[220px] ${
                  isDropdownOpen ? "border-orange-500 ring-2 ring-orange-500/20" : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span className="truncate text-slate-800">
                  {activeState ? availableStates.find(s => s.id === activeState)?.name : "All Destinations"}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-orange-500" : ""}`} />
              </button>

              {/* Custom Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 lg:right-0 mt-2 w-full lg:w-[260px] bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[300px] overflow-y-auto py-2 custom-scrollbar">
                      <button
                        onClick={() => {
                          setActiveState(null);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${
                          activeState === null ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        All Destinations
                      </button>
                      {availableStates.map(state => (
                        <button
                          key={state.id}
                          onClick={() => {
                            setActiveState(state.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${
                            activeState === state.id ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {state.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 auto-rows-[160px] lg:auto-rows-[180px]">
            <div className="col-span-2 row-span-2 rounded-2xl bg-slate-100 animate-pulse h-full" />
            <div className="rounded-2xl bg-slate-100 animate-pulse h-full" />
            <div className="rounded-2xl bg-slate-100 animate-pulse h-full" />
            <div className="rounded-2xl bg-slate-100 animate-pulse h-full" />
            <div className="rounded-2xl bg-slate-100 animate-pulse h-full" />
          </div>
        ) : bentoItems.length === 0 ? (
          <p className="text-center text-slate-400 py-16">No destinations yet.</p>
        ) : (
          <div className="space-y-6">
            <div key={activeState || "all"} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 auto-rows-[140px] sm:auto-rows-[160px] lg:auto-rows-[180px] animate-in fade-in duration-500">
              {bentoItems.map((item, idx) => {
                // Always make the first item massive for that premium WOW factor!
                // If there are many items, add a second massive block at idx 13.
                const isLarge = idx === 0 || (bentoItems.length >= 14 && idx === 13);
                
                return (
                  <DestinationCard
                    key={item.id}
                    title={item.title}
                    image={item.image}
                    subtitle={item.subtitle}
                    href={item.href}
                    className={`!rounded-2xl !h-full w-full ${
                      isLarge 
                        ? "col-span-2 row-span-2" 
                        : "col-span-1 row-span-1"
                    }`}
                  />
                );
              })}
            </div>
            
            {/* View All Link at the bottom if filtered list is long */}
            {!activeState && items.length > 18 && (
              <div className="flex justify-center pt-4">
                <Link 
                  href="/tour-packages" 
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-50 text-orange-600 text-sm font-bold hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                >
                  <span>View All Destinations</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularDestinations;
