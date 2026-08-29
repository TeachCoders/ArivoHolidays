"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  MapPin,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  CalendarDays,
  BadgeCheck,
  ChevronDown,
} from "lucide-react";
import { useStateBySlug } from "@/feature/state/api/useState";
import { useGetJourneys } from "@/feature/journey/api/useJourney";
import DestinationSlider, { useSliderControl } from "@/components/shared/DestinationSlider";
import HeroSlider from "@/components/shared/HeroSlider";
import RichContent from "@/components/shared/RichContent";
import ToursSection from "@/components/shared/ToursSection";
import FilterBar from "@/components/shared/FilterBar";
import {
  travelExperienceOptions,
  durationOptions,
  cityOptions,
  journeyMatchesExperiences,
  journeyMatchesDuration,
  journeyMatchesCities,
  journeyPackageHref,
} from "@/feature/journey/filterOptions";
import { cn, stripHtml } from "@/lib/utils";
import type { State } from "@/feature/state/type";
import type { Journey, PaginatedResponse } from "@/feature/journey/type";
import CityCard from "./CityCard";
import DestinationsSkeleton from "./DestinationsSkeleton";

export default function StateDetail({
  slug,
  initialState,
  initialJourneys,
}: {
  slug: string;
  initialState?: State | null;
  initialJourneys?: PaginatedResponse<Journey> | null;
}) {
  const { state, isLoading } = useStateBySlug(slug, initialState);

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <DestinationsSkeleton />
      </div>
    );
  }
  if (!state) return notFound();

  return <StateContent state={state} initialJourneys={initialJourneys} />;
}

function StateContent({ state, initialJourneys }: { state: State; initialJourneys?: PaginatedResponse<Journey> | null }) {
  const embeddedJourneys = state.journeys ?? [];
  const { journeys, isLoading: journeysLoading } = useGetJourneys(
    { limit: 100, isActive: "true" },
    initialJourneys ?? undefined,
    { enabled: embeddedJourneys.length === 0 }
  );
  const stateJourneys =
    embeddedJourneys.length > 0
      ? embeddedJourneys
      : journeys.filter((j) => j.cities?.some((c) => c.state?.id === state.id));

  const [expSelected, setExpSelected] = useState<string[]>([]);
  const [durSelected, setDurSelected] = useState<string[]>([]);
  const [citySelected, setCitySelected] = useState<string[]>([]);

  const filteredJourneys = stateJourneys.filter(
    (j) =>
      journeyMatchesExperiences(j, expSelected) &&
      journeyMatchesDuration(j, durSelected) &&
      journeyMatchesCities(j, citySelected)
  );

  const activeFilterCount = expSelected.length + durSelected.length + citySelected.length;

  const clearFilters = () => {
    setExpSelected([]);
    setDurSelected([]);
    setCitySelected([]);
  };

  const heroImages =
    state.banner?.images?.length
      ? state.banner.images
      : state.thumbImg
        ? [state.thumbImg]
        : [];

  const heroTitle = state.banner?.bannerTitle || state.title;
  const heroTag = state.banner?.bannerTag || "";
  const pageH1 = state.h1Title;

  const facts = [
    { label: "Capital", value: state.capital },
    { label: "Language", value: state.language },
    { label: "Area", value: state.area },
  ].filter((f) => f.value);

  const stateCities = [...(state.cities ?? [])].sort((a, b) => {
    const aPinned = (a.displayOrder ?? 0) > 0 ? 0 : 1;
    const bPinned = (b.displayOrder ?? 0) > 0 ? 0 : 1;
    if (aPinned !== bPinned) return aPinned - bPinned;
    if ((a.displayOrder ?? 0) !== (b.displayOrder ?? 0)) {
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    }
    return (a.title ?? "").localeCompare(b.title ?? "");
  });

  const journeyCountFor = (cityId: number) =>
    stateJourneys.filter((j) => j.cities?.some((c) => c.id === cityId)).length;

  const cityImageFor = (cityId: number) =>
    stateJourneys.find((j) => j.cities?.some((c) => c.id === cityId))?.thumbImg;

  const displayedCities = journeysLoading
    ? stateCities
    : stateCities.filter((c) => c.id != null && journeyCountFor(c.id) > 0);

  const cityCount = displayedCities.length ?? 0;

  const { swiperRef: citiesSwiperRef, slidePrev, slideNext, canScroll } = useSliderControl();

  const filterBar = (
    <FilterBar
      sections={[
        {
          id: "city",
          title: "City",
          icon: <MapPin size={14} />,
          options: cityOptions(stateJourneys, (c) => c.state?.id === state.id),
          selected: citySelected,
          onChange: setCitySelected,
        },
        {
          id: "experience",
          title: "Travel Experience",
          icon: <Sparkles size={14} />,
          options: travelExperienceOptions(stateJourneys),
          selected: expSelected,
          onChange: setExpSelected,
        },
        {
          id: "days",
          title: "Days",
          icon: <CalendarDays size={14} />,
          options: durationOptions(stateJourneys),
          selected: durSelected,
          onChange: setDurSelected,
        },
      ]}
      activeCount={activeFilterCount}
      onClearAll={clearFilters}
      resultCount={filteredJourneys.length}
      totalCount={stateJourneys.length}
    />
  );

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative h-[480px] md:h-[560px] overflow-hidden bg-[#1C1C1C]">
        {heroImages.length > 0 ? (
          <HeroSlider images={heroImages} alt={state.title} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2E8B8B] via-[#1C1C1C] to-[#D4561A]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

        <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 h-full flex flex-col justify-between py-8">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {heroTag && (
              <p className="max-w-2xl mx-auto mb-1 text-base sm:text-lg font-bold tracking-wider uppercase text-white leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                {heroTag}
              </p>
            )}

            <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-black uppercase text-white leading-tight tracking-wider drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {heroTitle}
            </h2>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a href="#tours" className="btn-primary px-7 py-3 text-sm font-medium tracking-wide flex items-center gap-2">
                Explore Tours
                <ArrowRight size={16} />
              </a>
              <a href="#more" className="px-7 py-3 text-sm font-medium tracking-wide rounded-xl border border-white/30 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-200">
                About {state.title}
              </a>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-1.5 text-white/70 text-sm pt-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            {state.country && (
              <>
                <ChevronRight size={14} />
                <Link
                  href={`/${state.country.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {state.country.title.replace(/\s*Tour$/i, "")}
                </Link>
              </>
            )}
            <ChevronRight size={14} />
            <span className="text-white/95">{state.title}</span>
          </nav>
        </div>
      </section>

      {/* ===== SHORT DESCRIPTION + TOURS ===== */}
      <ToursSection
        journeys={filteredJourneys}
        isLoading={journeysLoading}
        h1Title={pageH1}
        overView={state.overView ?? undefined}
        emptyLabel={`No tours found in ${state.title} yet`}
        showCount={4}
        filterBar={stateJourneys.length > 1 ? filterBar : undefined}
        onClearFilters={clearFilters}
      />

      {/* ===== CITIES ===== */}
      <section id="cities" className="w-full bg-white py-16 md:py-20 border-t border-slate-200/60">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="accent-label">Discover</span>
            <h2 className="h3 text-[#1C1C1C] mt-2">
              Cities in {state.title}
              <span className="ml-3 align-middle text-sm font-semibold text-[#D4561A] bg-[#D4561A]/10 px-3 py-1 rounded-full">
                {cityCount} Cities
              </span>
            </h2>
          </div>
          {!journeysLoading && canScroll && displayedCities.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={slidePrev}
                aria-label="Previous cities"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-[#1C1C1C] flex items-center justify-center shadow-sm hover:bg-[#1C1C1C] hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={slideNext}
                aria-label="Next cities"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-[#1C1C1C] flex items-center justify-center shadow-sm hover:bg-[#1C1C1C] hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {journeysLoading ? (
          <DestinationsSkeleton count={6} />
        ) : displayedCities.length === 0 ? (
          <div className="text-center py-14">
            <MapPin size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No cities found in {state.title}</p>
          </div>
        ) : (
          <DestinationSlider swiperRef={citiesSwiperRef}>
            {displayedCities.map((c) => {
              const cityId = c.id;
              if (cityId == null) return null;
              return (
                <CityCard
                  key={cityId}
                  city={c}
                  stateSlug={state.slug}
                  countrySlug={state.country?.slug}
                  journeyCount={journeyCountFor(cityId)}
                  fallbackImage={cityImageFor(cityId)}
                />
              );
            })}
          </DestinationSlider>
        )}
        </div>
      </section>

      {/* ===== MORE DESCRIPTION (ALL INFO) ===== */}
      <section id="more" className="bg-[#f8f8f8] border-y border-slate-200/60 py-16 md:py-20">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <span className="accent-label">Know More</span>
              <h2 className="h3 text-[#1C1C1C] mt-2 mb-8">Everything About {state.title}</h2>

              {state.seoDescription && (
                <RichContent html={state.seoDescription} />
              )}

              {state.moreDescription && (
                <RichContent html={state.moreDescription} className="mt-8" />
              )}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 self-start">
              {facts.length > 0 && (
                <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2E8B8B] mb-5">
                    Quick Facts
                  </h4>
                  <dl className="flex flex-col divide-y divide-slate-100">
                    {facts.map((f) => (
                      <div key={f.label} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                        <dt className="text-[15px] text-slate-700 font-semibold flex items-center gap-2">
                          {f.label}
                        </dt>
                        <dd className="text-[15px] font-bold text-[#1C1C1C] text-right capitalize">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {state.famousFor && (
                <div className="rounded-2xl bg-gradient-to-br from-[#2E8B8B]/10 via-transparent to-[#2E8B8B]/5 border border-[#2E8B8B]/20 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                  <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-[#2E8B8B]/10 rotate-12" />
                  <div className="w-full flex items-center justify-between gap-3 text-left relative z-10">
                    <h3 className="flex items-center gap-2.5 text-lg font-black text-[#1C1C1C]">
                      <Sparkles size={18} className="text-[#D4561A]" />
                      Famous For
                    </h3>
                  </div>
                  <ul className="mt-5 space-y-3 relative z-10">
                    {stripHtml(state.famousFor)
                      .split(",")
                      .map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[15px] text-slate-700 font-semibold leading-relaxed">
                          <BadgeCheck size={18} className="shrink-0 mt-[3px] text-[#2E8B8B]" />
                          {item.trim()}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {stateJourneys.filter((j) => (j.displayOrder ?? 0) > 0).length > 0 && (
                <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2E8B8B] mb-5 flex items-center justify-between">
                    Top 10 Tour Packages
                    <span className="text-[10px] font-black text-[#D4561A] bg-[#D4561A]/10 px-2.5 py-0.5 rounded-full">
                      {Math.min(
                        10,
                        stateJourneys.filter((j) => (j.displayOrder ?? 0) > 0).length
                      )}
                    </span>
                  </h4>
                  <ol className="mt-2 space-y-1">
                    {[...stateJourneys]
                      .filter((j) => (j.displayOrder ?? 0) > 0)
                      .sort(
                        (a, b) =>
                          (a.displayOrder ?? Number.MAX_SAFE_INTEGER) -
                          (b.displayOrder ?? Number.MAX_SAFE_INTEGER)
                      )
                      .slice(0, 10)
                      .map((j, i) => (
                        <li key={j.id}>
                            <Link
                              href={journeyPackageHref(j)}
                            className="flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                          >
                            <span className="mt-[2px] w-[26px] h-[26px] shrink-0 rounded-full bg-slate-100 text-[#1C1C1C] text-[11px] font-black flex items-center justify-center group-hover:bg-[#2E8B8B] group-hover:text-white transition-colors shadow-sm">
                              {i + 1}
                            </span>
                            <span className="text-[15px] font-bold text-[#333] leading-snug group-hover:text-[#1C1C1C] transition-colors">
                              {j.title}
                            </span>
                          </Link>
                        </li>
                      ))}
                  </ol>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
