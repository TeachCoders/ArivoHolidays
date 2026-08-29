"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, ChevronRight } from "lucide-react";
import { useGetJourneys } from "@/feature/journey/api/useJourney";
import TourPackageCard from "@/components/shared/TourPackageCard";
import Pagination from "@/components/shared/Pagination";
import DestinationsSkeleton from "@/feature/destinations/components/DestinationsSkeleton";
import { useSearchParams, usePathname } from "next/navigation";
import HeroSlider from "@/components/shared/HeroSlider";
import { useCountryBySlug } from "@/feature/country/api/useCountry";
import type { Journey } from "@/feature/journey/type";
import type { Country } from "@/feature/country/type";

const PAGE_SIZE = 12;

export default function TourPackagesList({
  countrySlug,
  initialJourneys,
  initialCountry,
}: {
  countrySlug: string;
  initialJourneys?: Journey[];
  initialCountry?: Country | null;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { country, isLoading: countryLoading } = useCountryBySlug(countrySlug, initialCountry);
  const { journeys, isLoading } = useGetJourneys(
    { limit: 1000, isActive: "true" },
    initialJourneys
      ? {
          success: true,
          data: initialJourneys,
          pagination: { page: 1, limit: 1000, total: initialJourneys.length, totalPages: 1 },
        }
      : undefined
  );

  const countryJourneys = journeys.filter(
    (j) => j.cities?.some((c) => c.state?.country?.slug === countrySlug)
  );

  const page = parseInt(searchParams.get("page") || "1", 10);
  const totalPages = Math.max(1, Math.ceil(countryJourneys.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const paginatedJourneys = countryJourneys.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}#packages`;
  };

  const title = country?.title.replace(/\s*Tour$/i, "") || countrySlug;

  const heroImages = country?.banner?.images?.length
    ? country.banner.images
    : country?.thumbImg
      ? [country.thumbImg]
      : [];

  return (
    <div>
      <section className="relative h-64 md:h-80 overflow-hidden bg-slate-900">
        {heroImages.length > 0 ? (
          <HeroSlider images={heroImages} alt={title} />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-slate-900 flex items-center justify-center">
            <img src="/logo.png" alt="Arivo Holidays" className="w-48 h-48 opacity-10 object-contain grayscale" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 h-full flex flex-col justify-end pb-10">
          <nav className="flex flex-wrap items-center gap-1.5 text-white/80 text-sm pb-3 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link href={`/${countrySlug}`} className="hover:text-white transition-colors">
              {title}
            </Link>
            <ChevronRight size={14} />
            <span className="text-white/95">Tour Packages</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {title} Tour Packages
          </h1>
          <p className="mt-2 text-white/80 text-sm sm:text-base max-w-2xl">
            All-inclusive holiday itineraries across {title} with private cabs, star hotels, and
            verified local guides.
          </p>
        </div>
      </section>

      <section id="packages" className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 py-12 md:py-16">
        {isLoading || countryLoading ? (
          <DestinationsSkeleton count={PAGE_SIZE} />
        ) : countryJourneys.length === 0 ? (
          <div className="text-center py-14 bg-white border border-slate-200 rounded-2xl">
            <MapPin size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No tour packages found in {title} yet</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <span className="accent-label">Tour Packages</span>
              <h2 className="h3 text-[#1C1C1C] mt-2">
                {countryJourneys.length} Packages in {title}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedJourneys.map((j) => (
                <TourPackageCard key={j.id} journey={j} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              createPageUrl={createPageUrl}
            />
          </>
        )}
      </section>
    </div>
  );
}
