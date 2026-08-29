"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { MapPin } from "lucide-react";
import RichContent from "@/components/shared/RichContent";
import TourPackageCard from "@/components/shared/TourPackageCard";
import Pagination from "@/components/shared/Pagination";
import DestinationsSkeleton from "@/feature/destinations/components/DestinationsSkeleton";
import type { Journey } from "@/feature/journey/type";

interface ToursSectionProps {
  journeys: Journey[];
  isLoading?: boolean;
  accentLabel?: string;
  h1Title?: string | null;
  overView?: string;
  emptyLabel?: string;
  showCount?: number;
  filterBar?: React.ReactNode;
  onClearFilters?: () => void;
  contextName?: string;
}

export default function ToursSection({
  journeys,
  isLoading = false,
  accentLabel = "Popular Tours",
  h1Title,
  overView,
  emptyLabel = "No tours found yet",
  filterBar,
  onClearFilters,
  contextName,
}: ToursSectionProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 12; // 3 rows of 4 items

  const totalPages = Math.ceil(journeys.length / pageSize);
  const currentPage = Math.min(Math.max(page, 1), totalPages || 1);

  const paginatedJourneys = journeys.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const hasFilters = Boolean(filterBar && onClearFilters);

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}#tours`;
  };

  return (
    <section id="tours" className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 py-16 md:py-20">
      <div className="mb-14">
        {accentLabel && <span className="accent-label">{accentLabel}</span>}
        {h1Title && <h1 className="font-heading h2 text-[#1C1C1C] mt-3">{h1Title}</h1>}
        {overView && <RichContent html={overView} className="mt-4" />}
      </div>

      {isLoading ? (
        <DestinationsSkeleton count={pageSize} />
      ) : journeys.length === 0 ? (
        hasFilters ? (
          <div className="text-center py-14 mt-6 bg-white border border-slate-200 rounded-2xl">
            <p className="text-slate-500">No tours match your filters</p>
            <button
              onClick={onClearFilters}
              className="mt-3 text-sm font-semibold text-slate-500 hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="text-center py-14">
            <MapPin size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">{emptyLabel}</p>
          </div>
        )
      ) : (
        <div>
          {filterBar}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {paginatedJourneys.map((j) => (
              <TourPackageCard key={j.id} journey={j} contextName={contextName} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            createPageUrl={createPageUrl}
          />
        </div>
      )}
    </section>
  );
}
