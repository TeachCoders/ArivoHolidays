"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionLabel } from "@/components/shared/SectionLabel";
import DestinationCard from "@/components/shared/DestinationCard";
import DestinationSlider, { useSliderControl } from "@/components/shared/DestinationSlider";
import { useGetCities } from "@/feature/city/api/useCity";
import { useGetStates } from "@/feature/state/api/useState";
import type { State, PaginatedResponse as StatePage } from "@/feature/state/type";
import type { City, PaginatedResponse as CityPage } from "@/feature/city/type";

const TOP_CITIES_PER_STATE = 5;

export const PopularDestinations: React.FC<{
  initialStates?: StatePage<State> | null;
  initialCities?: CityPage<City> | null;
}> = ({ initialStates, initialCities }) => {
  const { swiperRef, slidePrev, slideNext, canScroll } = useSliderControl();
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
            title: c.title,
            image: c.thumbImg || c.banner?.images?.[0],
            subtitle: tours > 0 ? `${tours}+ tours` : undefined,
            href: `/${state.country?.slug}/${state.slug}/${c.slug}`,
          };
        })
    );
  }, [cities, states]);

  const isLoading = statesLoading || citiesLoading;

  return (
    <section id="destinations" className="py-20 bg-white">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <SectionLabel>Popular Destinations</SectionLabel>
            <h2 className="h2 text-[#1C1C1C] mt-2">Explore Top Places</h2>
            <p className="mt-2 text-base text-[#555]">Find the best holiday packages for India's most loved cities and hill stations.</p>
          </div>
          {!isLoading && canScroll && items.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={slidePrev}
                aria-label="Previous destinations"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-[#1C1C1C] flex items-center justify-center shadow-sm hover:bg-[#1C1C1C] hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={slideNext}
                aria-label="Next destinations"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-[#1C1C1C] flex items-center justify-center shadow-sm hover:bg-[#1C1C1C] hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-slate-100 animate-pulse h-[190px] sm:h-[220px]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-slate-400 py-16">No destinations yet.</p>
        ) : (
          <DestinationSlider swiperRef={swiperRef}>
            {items.map((item) => (
              <DestinationCard
                key={item.id}
                title={item.title}
                image={item.image}
                subtitle={item.subtitle}
                href={item.href}
              />
            ))}
          </DestinationSlider>
        )}
      </div>
    </section>
  );
};

export default PopularDestinations;
