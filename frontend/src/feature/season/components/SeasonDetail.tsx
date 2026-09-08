"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Sparkles, CalendarDays, BadgeCheck, MapPin, ChevronRight, ArrowRight } from "lucide-react";
import { useGetJourneys } from "@/feature/journey/api/useJourney";
import HeroSlider from "@/components/shared/HeroSlider";
import { FallbackImage } from "@/components/shared/FallbackImage";
import RichContent from "@/components/shared/RichContent";
import ToursSection from "@/components/shared/ToursSection";
import FilterBar from "@/components/shared/FilterBar";
import { QuoteModal } from "@/components/shared/QuoteModal";
import FaqSection from "@/feature/home/components/FaqSection";
import {
  cityOptions,
  travelExperienceOptions,
  durationOptions,
  journeyMatchesExperiences,
  journeyMatchesDuration,
  journeyMatchesCities,
  journeyPackageHref,
} from "@/feature/journey/filterOptions";
import type { Season } from "@/feature/season/type";
import type { Journey, PaginatedResponse } from "@/feature/journey/type";
import { useGetSeasons } from "@/feature/season/api/useSeason";
import DestinationsSkeleton from "@/feature/destinations/components/DestinationsSkeleton";

export default function SeasonDetail({
  slug,
  initialSeason,
  initialJourneys,
}: {
  slug: string;
  initialSeason: Season;
  initialJourneys?: PaginatedResponse<Journey> | null;
}) {
  const { journeys, isLoading: journeysLoading } = useGetJourneys(
    { limit: 100, isActive: "true" },
    initialJourneys ?? undefined,
    { enabled: true }
  );

  const seasonJourneys = journeys.filter((j) =>
    j.months?.some((m) => m.id === initialSeason.id)
  );

  const heroImages =
    initialSeason.banner?.images?.length
      ? initialSeason.banner.images
      : initialSeason.thumbImg
        ? [initialSeason.thumbImg]
        : [];

  let heroTitle = initialSeason.banner?.bannerTitle || initialSeason.title;
  let heroTag = initialSeason.banner?.bannerTag || "";

  const titleMatch = heroTitle.match(/^(.*?)\s*(\(.*?\))\s*$/);
  if (titleMatch) {
    if (!heroTag) heroTag = titleMatch[2].replace(/[()]/g, "");
    heroTitle = titleMatch[1];
  }

  const pageH1 = initialSeason.h1Title;

  const facts = [
    { label: "Weather", value: initialSeason.weather },
    { label: "Best For", value: initialSeason.bestFor },
    { label: "Festivals", value: initialSeason.festivals },
  ].filter((f) => f.value);

  const [expSelected, setExpSelected] = useState<string[]>([]);
  const [durSelected, setDurSelected] = useState<string[]>([]);
  const [citySelected, setCitySelected] = useState<string[]>([]);

  const filteredJourneys = seasonJourneys.filter(
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

  const filterBar = (
    <FilterBar
      sections={[
        {
          id: "city",
          title: "Destination",
          icon: <MapPin size={14} />,
          options: cityOptions(seasonJourneys),
          selected: citySelected,
          onChange: setCitySelected,
        },
        {
          id: "experience",
          title: "Travel Experience",
          icon: <Sparkles size={14} />,
          options: travelExperienceOptions(seasonJourneys),
          selected: expSelected,
          onChange: setExpSelected,
        },
        {
          id: "duration",
          title: "Duration",
          icon: <CalendarDays size={14} />,
          options: durationOptions(seasonJourneys),
          selected: durSelected,
          onChange: setDurSelected,
        },
      ]}
      activeCount={activeFilterCount}
      onClearAll={clearFilters}
      resultCount={filteredJourneys.length}
      totalCount={seasonJourneys.length}
    />
  );

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative h-[480px] md:h-[560px] overflow-hidden bg-slate-900">
        {heroImages.length > 0 ? (
          <>
            <HeroSlider images={heroImages} alt={initialSeason.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-slate-950/20" />
          </>
        ) : (
          <div className="absolute inset-0">
            <FallbackImage
              src={initialSeason.thumbImg}
              alt={initialSeason.title}
              fill
              priority
              className="object-cover object-center"
              theme="dark"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/30" />
          </div>
        )}

        <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 h-full flex flex-col justify-center items-center py-8 text-center">
          {heroTag && (
            <p className="max-w-2xl mx-auto mb-2 text-base sm:text-lg font-bold tracking-wider uppercase text-white/90 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              {heroTag}
            </p>
          )}

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase text-white leading-tight tracking-wider drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            {heroTitle}
          </h1>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <QuoteModal>
              <button
                type="button"
                className="btn-primary px-7 py-3.5 text-sm font-bold tracking-wide flex items-center gap-2 cursor-pointer shadow-lg shadow-[#D4561A]/30 active:scale-95 transition-all"
              >
                <Sparkles size={16} />
                <span>Plan My {initialSeason.title} Trip</span>
              </button>
            </QuoteModal>

            <a href="#tours" className="px-6 py-3.5 text-sm font-bold tracking-wide rounded-xl border border-white/40 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-200 flex items-center gap-2">
              <span>Explore Packages</span>
              <ArrowRight size={16} />
            </a>

            <a href="#more" className="px-6 py-3.5 text-sm font-medium tracking-wide rounded-xl border border-white/20 text-white/80 bg-black/20 backdrop-blur-md hover:bg-white/10 transition-all duration-200">
              About {initialSeason.title}
            </a>
          </div>
        </div>
      </section>

      {/* ===== BREADCRUMB (BELOW HERO) ===== */}
      <nav aria-label="Breadcrumb" className="border-b border-slate-200 bg-slate-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 py-3 flex flex-wrap items-center gap-1.5 text-[14px] text-slate-500">
          <Link href="/" className="hover:text-[#2E8B8B] transition-colors shrink-0 font-medium">
            Home
          </Link>
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
          <span className="text-[#1C1C1C] font-semibold">{initialSeason.title}</span>
        </div>
      </nav>

      {/* ===== SHORT DESCRIPTION + TOURS ===== */}
      <ToursSection
        journeys={filteredJourneys}
        isLoading={journeysLoading}
        h1Title={pageH1}
        overView={initialSeason.overView ?? undefined}
        emptyLabel={`No tours found for ${initialSeason.title} yet`}
        filterBar={seasonJourneys.length > 0 ? filterBar : undefined}
        onClearFilters={clearFilters}
      />

      {/* ===== MORE DESCRIPTION (ALL INFO) ===== */}
      <section id="more" className="bg-[#f8f8f8] border-y border-slate-200/60 py-16 md:py-20">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <span className="accent-label">Know More</span>
              <h2 className="h3 text-[#1C1C1C] mt-2 mb-8">Everything About {initialSeason.title}</h2>

              {initialSeason.seoDescription && (
                <RichContent html={initialSeason.seoDescription} />
              )}

              {initialSeason.moreDescription && (
                <RichContent html={initialSeason.moreDescription} className="mt-8" />
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
                      <div key={f.label} className="flex flex-col gap-1 py-3.5 first:pt-0 last:pb-0">
                        <dt className="text-[13px] text-slate-500 font-semibold flex items-center gap-2 uppercase tracking-wide">
                          {f.label}
                        </dt>
                        <dd className="text-[15px] font-bold text-[#1C1C1C]">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {seasonJourneys.filter((j) => (j.displayOrder ?? 0) > 0).length > 0 && (
                <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2E8B8B] mb-5 flex items-center justify-between">
                    Top Tours
                    <span className="text-[10px] font-black text-[#D4561A] bg-[#D4561A]/10 px-2.5 py-0.5 rounded-full">
                      {Math.min(
                        10,
                        seasonJourneys.filter((j) => (j.displayOrder ?? 0) > 0).length
                      )}
                    </span>
                  </h4>
                  <ol className="mt-2 space-y-1">
                    {[...seasonJourneys]
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

      {/* ===== OTHER SEASONS ===== */}
      <OtherSeasonsSection currentSlug={initialSeason.slug} />

      {/* ===== FAQ SECTION ===== */}
      <FaqSection faqs={initialSeason.faqs} />
    </div>
  );
}

function OtherSeasonsSection({ currentSlug }: { currentSlug: string }) {
  const { seasons } = useGetSeasons({ isActive: "true" });
  const otherSeasons = (seasons || []).filter((s: any) => s.slug !== currentSlug);

  if (otherSeasons.length === 0) return null;

  return (
    <section className="bg-white py-16 border-t border-slate-200/80">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="accent-label">Seasonal Circuits</span>
            <h2 className="h3 text-[#1C1C1C] mt-1">Explore Other Seasons in India</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherSeasons.slice(0, 4).map((s: any) => (
            <Link
              key={s.id || s.slug}
              href={`/season/${s.slug}`}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-900 h-64 flex flex-col justify-end p-6"
            >
              <FallbackImage
                src={s.thumbImg || s.banner?.images?.[0]}
                alt={s.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#F5B041] mb-1 block">
                  {s.bestFor || "Season"}
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-[#F5B041] transition-colors">
                  {s.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
