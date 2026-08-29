"use client";

import React from "react";
import { Sparkles, ArrowRight, Crown, Compass } from "lucide-react";
import Link from "next/link";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { useGetTravelExperiences } from "@/feature/travelExperience/api/useTravelExperience";
import { useGetJourneys } from "@/feature/journey/api/useJourney";
import { resolveExperienceTheme, FALLBACK_IMAGE } from "@/feature/travelExperience/theme";
import { stripHtml } from "@/lib/utils";

export const TravelExperiencesSection: React.FC = () => {
  const { travelExperiences, isLoading } = useGetTravelExperiences({
    limit: 100,
    isActive: "true",
  });
  const { journeys } = useGetJourneys({
    limit: 200,
    isActive: "true",
  });

  const experiences = travelExperiences.filter(
    (e: any) => !/^test\b/i.test(e.title || "")
  );

  const tourCount = (id: number) =>
    journeys.filter((j: any) =>
      (j.travelExperiences || []).some((e: any) => e.id === id)
    ).length;

  return (
    <section id="experiences" className="py-20 bg-white">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <SectionLabel>Curated Travel Styles</SectionLabel>
            <h2 className="h2 text-[#1C1C1C] mt-2">Travel Built Around Your Vibe</h2>
            <p className="mt-2 text-base text-[#555] max-w-xl">
              From peaceful hill stations to mountain adventures, pick the trip style that fits you best.
            </p>
          </div>
          <Link href="/travel-experiences">
            <button className="btn-outline px-5 py-2.5 text-sm font-medium flex items-center gap-2">
              <span>View All Experiences</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-slate-100 animate-pulse h-64 border border-[#f0f0f0]"
              />
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <p className="text-center text-slate-400 py-16">No travel experiences yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {experiences.slice(0, 6).map((exp: any) => {
              const theme = resolveExperienceTheme(exp.title);
              const image = exp.thumbImg || exp.banner?.images?.[0] || theme.image;
              const count = tourCount(exp.id);
              return (
                <Link
                  key={exp.id}
                  href={`/travel-experiences/${exp.slug}`}
                  className="group relative block overflow-hidden rounded-2xl bg-white border border-[#e5e5e5] shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <div className="relative h-48 md:h-52 w-full overflow-hidden">
                    <img
                      src={image || FALLBACK_IMAGE}
                      alt={exp.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white">
                      {theme.icon || <Compass size={18} />}
                    </div>
                    {count > 0 && (
                      <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4561A] text-white text-[10px] font-bold shadow-lg">
                        <Crown size={11} /> {count} Tours
                      </span>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-heading text-xl font-extrabold text-white tracking-tight drop-shadow leading-snug">
                        {exp.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-[#555] leading-relaxed line-clamp-2 min-h-[2.5rem]">
                      {stripHtml(exp.overView || exp.description || "")}
                    </p>
                    <div className="mt-4 pt-4 border-t border-[#f0f0f0] flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#1C1C1C] group-hover:text-[#2E8B8B] transition-colors">
                        Explore <ArrowRight size={15} className="text-[#D4561A] transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                      <Sparkles size={14} className="text-[#D4561A]" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default TravelExperiencesSection;
