"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowRight,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";
import { useTravelExperienceBySlug } from "@/feature/travelExperience/api/useTravelExperience";
import { useGetJourneys } from "@/feature/journey/api/useJourney";
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
import DestinationsSkeleton from "@/feature/destinations/components/DestinationsSkeleton";

export default function TravelExperienceDetail({
  slug,
  initialExperience,
}: {
  slug: string;
  initialExperience?: any;
}) {
  const { travelExperience, isLoading } = useTravelExperienceBySlug(slug, initialExperience);

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <DestinationsSkeleton />
      </div>
    );
  }
  if (!travelExperience) return notFound();

  return <ExperienceContent experience={travelExperience} />;
}

function ExperienceContent({ experience }: { experience: any }) {
  const h1Title = experience.h1Title || experience.title;

  const { journeys, isLoading: journeysLoading } = useGetJourneys({
    limit: 100,
    isActive: "true",
  });
  const experienceJourneys = journeys.filter((j) =>
    (j.travelExperiences || []).some((e: any) => e.slug === experience.slug)
  );

  const [expSelected, setExpSelected] = useState<string[]>([]);
  const [durSelected, setDurSelected] = useState<string[]>([]);
  const [citySelected, setCitySelected] = useState<string[]>([]);


  const filteredJourneys = experienceJourneys.filter(
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

  const heroTitle = experience.banner?.bannerTitle || h1Title;
  const heroTag = experience.banner?.bannerTag || "";

  const facts = [
    { label: "Duration", value: experience.duration },
    { label: "Ideal For", value: experience.idealFor },
    { label: "Budget Range", value: experience.budgetRange },
  ].filter((f) => f.value);

  const highlights = experience.highlights
    ? experience.highlights
        .split("\n")
        .map((h: string) => h.trim())
        .filter(Boolean)
    : [];

  const filterBar = (
    <FilterBar
      sections={[
        {
          id: "city",
          title: "City",
          icon: <MapPin size={14} />,
          options: cityOptions(experienceJourneys),
          selected: citySelected,
          onChange: setCitySelected,
        },
        {
          id: "experience",
          title: "Travel Experience",
          icon: <Sparkles size={14} />,
          options: travelExperienceOptions(experienceJourneys),
          selected: expSelected,
          onChange: setExpSelected,
        },
        {
          id: "days",
          title: "Days",
          icon: <CalendarDays size={14} />,
          options: durationOptions(experienceJourneys),
          selected: durSelected,
          onChange: setDurSelected,
        },
      ]}
      activeCount={activeFilterCount}
      onClearAll={clearFilters}
      resultCount={filteredJourneys.length}
      totalCount={experienceJourneys.length}
    />
  );

  const heroImages = experience.banner?.images?.length ? experience.banner.images : [];

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative h-[480px] md:h-[560px] overflow-hidden bg-[#1C1C1C]">
        {heroImages.length > 0 ? (
          <>
            <HeroSlider images={heroImages} alt={h1Title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#1C1C1C]" />
        )}

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
                About {h1Title}
              </a>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-1.5 text-white/70 text-sm pt-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link href="/travel-experiences" className="hover:text-white transition-colors">
              Travel Experiences
            </Link>
            <ChevronRight size={14} />
            <span className="text-white/95">{h1Title}</span>
          </nav>
        </div>
      </section>

      {/* ===== SHORT DESCRIPTION + TOURS ===== */}
      <ToursSection
        journeys={filteredJourneys}
        isLoading={journeysLoading}
        h1Title={experience.h1Title}
        overView={experience.overView ?? undefined}
        emptyLabel={`No tours found for ${h1Title} yet`}
        showCount={4}
        filterBar={experienceJourneys.length > 1 ? filterBar : undefined}
        onClearFilters={clearFilters}
        contextName={h1Title}
      />

      {/* ===== MORE DESCRIPTION (ALL INFO) ===== */}
      <section id="more" className="bg-[#f8f8f8] border-y border-slate-200/60 py-16 md:py-20">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <span className="accent-label">Know More</span>

              {experience.seoDescription && (
                <RichContent html={experience.seoDescription} />
              )}

              {experience.moreDescription && (
                <RichContent html={experience.moreDescription} className={experience.seoDescription ? "mt-8" : ""} />
              )}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 self-start">
              {facts.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#2E8B8B] mb-4">
                    Quick Info
                  </h4>
                  <dl className="space-y-3">
                    {facts.map((f) => (
                      <div key={f.label} className="flex items-center justify-between gap-4">
                        <dt className="text-sm text-slate-500">{f.label}</dt>
                        <dd className="text-sm font-semibold text-[#1C1C1C] text-right">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {highlights.length > 0 && (
                <div className="rounded-2xl bg-gradient-to-br from-[#1C1C1C] to-[#2b2b2b] text-white p-7 shadow-xl overflow-hidden relative">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#D4561A]/20 blur-2xl" />
                  <h3 className="flex items-center gap-2 text-lg font-bold mb-4 text-white">
                    <Sparkles size={18} className="text-[#F5B041]" />
                    Highlights
                  </h3>
                  <ul className="space-y-2.5">
                    {highlights.map((h: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/85">
                        <BadgeCheck size={16} className="shrink-0 mt-0.5 text-[#F5B041]" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {experienceJourneys.filter((j) => (j.displayOrder ?? 0) > 0).length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#2E8B8B] mb-1 flex items-center justify-between">
                    Top 10 Tour Packages
                    <span className="text-[10px] font-semibold text-[#D4561A] bg-[#D4561A]/10 px-2 py-0.5 rounded-full">
                      {Math.min(
                        10,
                        experienceJourneys.filter((j) => (j.displayOrder ?? 0) > 0).length
                      )}
                    </span>
                  </h4>
                  <ol className="mt-2">
                    {[...experienceJourneys]
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
                            className="flex items-start gap-2.5 py-1.5 group"
                          >
                            <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-[#f5f5f5] text-[#1C1C1C] text-[11px] font-bold flex items-center justify-center group-hover:bg-[#2E8B8B] group-hover:text-white transition-colors">
                              {i + 1}
                            </span>
                            <span className="text-sm text-[#555] leading-snug group-hover:text-[#2E8B8B] transition-colors">
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
