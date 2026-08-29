import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import PackagesExplorer from "@/feature/journey/components/PackagesExplorer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tour Packages | Arivo Holiday",
  description:
    "Browse hand-picked tour packages across India — filter by destination, travel experience and duration. Book your perfect trip with Arivo Holiday.",
  alternates: { canonical: "/tour-packages" },
};

export default async function TourPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string | string[]; exp?: string | string[] }>;
}) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v || "").trim();
  const cities = first(params.city)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const experiences = first(params.exp)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-[#1C1C1C]">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 py-10">
          <nav className="flex items-center gap-1.5 text-white/70 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-white/95">Tour Packages</span>
          </nav>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-4">
            Tour Packages
          </h1>
          <p className="mt-2 text-white/70 text-base md:text-lg max-w-2xl">
            {cities.length > 0 || experiences.length > 0
              ? "Results filtered by your search — refine using the filters."
              : "Find the perfect tour package for your next holiday."}
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 py-10">
        <PackagesExplorer initialCities={cities} initialExperiences={experiences} />
      </div>
    </div>
  );
}
