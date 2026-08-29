"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/shared/SectionLabel";
import TourPackageCard from "@/components/shared/TourPackageCard";
import { useGetJourneys } from "@/feature/journey/api/useJourney";
import type { Journey, PaginatedResponse as JourneyPage } from "@/feature/journey/type";

const MAX_PACKAGES = 4;

export const BestSellingPackages: React.FC<{
  initialJourneys?: JourneyPage<Journey> | null;
}> = ({ initialJourneys }) => {
  const { journeys, isLoading } = useGetJourneys(
    {
      limit: 100,
      isActive: "true",
    },
    initialJourneys
  );

  const packages = journeys
    .filter((j: any) => (j.displayOrder ?? 0) > 0)
    .slice(0, MAX_PACKAGES);

  return (
    <section id="packages" className="py-20 bg-[#f8f8f8] relative overflow-hidden">
      {/* Taj Mahal + Dance + Mandala pattern */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='%23D4561A' stroke-width='0.8'%3E%3Crect x='0' y='0' width='200' height='200' fill='none'/%3E%3Cpath d='M90 60 L100 20 L110 60 M85 62 L80 75 L120 75 L115 62 M75 75 L75 90 L125 90 L125 75 M100 20 L100 14 M96 38 L100 25 L104 38 M80 90 L80 120 L120 120 L120 90 M85 120 L85 125 L115 125 L115 120 M100 90 L100 120'/%3E%3Ccircle cx='100' cy='72' r='4'/%3E%3Cpath d='M60 155 Q60 145 65 140 Q60 135 55 140 Q60 145 60 155 M52 160 L60 155 L68 160 M50 168 L52 160 L48 170 M68 160 L72 168 L64 170 M55 140 L48 135 M65 140 L72 135 M55 140 L52 132 M65 140 L68 132 M55 150 L52 155 M65 150 L68 155 M60 155 L60 168 M55 168 L65 168'/%3E%3Ccircle cx='60' cy='135' r='5'/%3E%3Ccircle cx='40' cy='40' r='15'/%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3Ccircle cx='40' cy='40' r='5'/%3E%3Cpath d='M40 25 L40 15 M40 55 L40 65 M25 40 L15 40 M55 40 L65 40'/%3E%3Ccircle cx='160' cy='160' r='12'/%3E%3Ccircle cx='160' cy='160' r='7'/%3E%3Ccircle cx='160' cy='160' r='3'/%3E%3Cpath d='M160 148 L160 140 M160 172 L160 180 M148 160 L140 160 M172 160 L180 160'/%3E%3C/g%3E%3C/svg%3E")`
      }} />
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <SectionLabel>Handpicked Holiday Tours</SectionLabel>
            <h2 className="h2 text-[#1C1C1C] mt-2">Popular Tour Packages</h2>
            <p className="mt-2 text-base text-[#555] max-w-xl">Ready-made holiday packages with hotels, cabs and daily sightseeing — all planned for you.</p>
          </div>
          <Link href="/india/tour-packages">
            <button className="btn-outline px-5 py-2.5 text-sm font-medium flex items-center gap-2">
              <span>View All Tours</span><ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white animate-pulse h-[420px] border border-brand-200" />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <p className="text-center text-slate-400 py-16">No packages yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {packages.map((pkg) => (
              <TourPackageCard key={pkg.id} journey={pkg} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellingPackages;
