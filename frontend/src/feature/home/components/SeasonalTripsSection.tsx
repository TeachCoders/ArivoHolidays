"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, Flower2, Snowflake, CloudRain, Sun, ArrowRight, Star } from "lucide-react";
import { SectionLabel } from "@/components/shared/SectionLabel";
import type { Season } from "@/feature/season/type";
import { FallbackImage } from "@/components/shared/FallbackImage";

import type { Journey } from "@/feature/journey/type";

interface SeasonCircuit {
  name: string;
  href: string;
}

interface SeasonGroup {
  id: string;
  name: string;
  months: string;
  icon: React.ReactNode;
  tagline: string;
  circuits: SeasonCircuit[];
  bannerImage: string;
  mainSlug?: string;
  bannerTag?: string;
}

const SEASON_PATTERNS: Record<string, string> = {
  winter: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%231C1C1C' stroke-width='0.5' opacity='0.07'%3E%3Cpath d='M40 10 L40 70 M10 40 L70 40 M18 18 L62 62 M62 18 L18 62'/%3E%3Ccircle cx='40' cy='40' r='4'/%3E%3Ccircle cx='40' cy='10' r='3'/%3E%3Ccircle cx='40' cy='70' r='3'/%3E%3Ccircle cx='10' cy='40' r='3'/%3E%3Ccircle cx='70' cy='40' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
  spring: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23D4561A' stroke-width='0.5' opacity='0.06'%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3Ccircle cx='40' cy='40' r='18'/%3E%3Cpath d='M40 12 L40 4 M40 68 L40 76 M12 40 L4 40 M68 40 L76 40 M20.2 20.2 L14.5 14.5 M59.8 20.2 L65.5 14.5 M20.2 59.8 L14.5 65.5 M59.8 59.8 L65.5 65.5'/%3E%3C/g%3E%3C/svg%3E")`,
  summer: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23E8A317' stroke-width='0.5' opacity='0.06'%3E%3Ccircle cx='40' cy='40' r='12'/%3E%3Cpath d='M40 8 L40 16 M40 64 L40 72 M8 40 L16 40 M64 40 L72 40 M17 17 L22.6 22.6 M57.4 57.4 L63 63 M63 17 L57.4 22.6 M22.6 57.4 L17 63'/%3E%3C/g%3E%3C/svg%3E")`,
  monsoon: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='80' viewBox='0 0 60 80'%3E%3Cg fill='none' stroke='%231C1C1C' stroke-width='0.5' opacity='0.06'%3E%3Cpath d='M10 0 L10 20 Q10 25 15 25 L10 25'/%3E%3Cpath d='M30 10 L30 30 Q30 35 35 35 L30 35'/%3E%3Cpath d='M50 5 L50 25 Q50 30 55 30 L50 30'/%3E%3Cpath d='M20 40 L20 60 Q20 65 25 65 L20 65'/%3E%3Cpath d='M40 50 L40 70 Q40 75 45 75 L40 75'/%3E%3C/g%3E%3C/svg%3E")`,
};

const SEASON_ICONS: Record<string, React.ReactNode> = {
  winter: <Snowflake className="w-4 h-4" />,
  spring: <Flower2 className="w-4 h-4" />,
  summer: <Sun className="w-4 h-4" />,
  monsoon: <CloudRain className="w-4 h-4" />,
};

const SEASON_LABELS: Record<string, string> = {
  winter: "Winter Special",
  spring: "Spring Escapes",
  summer: "Summer Retreats",
  monsoon: "Monsoon Wonders",
};

const FALLBACK_BANNER = "";

const SEASON_CURATED_DATA: Record<string, {
  tagline: string;
  months: string;
  circuits: { name: string; query: string }[];
  bannerImage: string;
}> = {
  winter: {
    tagline: "Experience snowfall in Kashmir & Himachal, golden desert nights in Rajasthan, and pristine Kerala backwaters.",
    months: "Nov - Feb",
    circuits: [
      { name: "Kashmir Snow Special", query: "Kashmir" },
      { name: "Manali & Shimla Winter", query: "Manali" },
      { name: "Rajasthan Desert & Forts", query: "Rajasthan" },
      { name: "Kerala Backwater Breeze", query: "Kerala" },
    ],
    bannerImage: "",
  },
  spring: {
    tagline: "Witness vibrant flower blossoms in Srinagar tulip gardens, fresh tea plantations in Munnar, and pleasant hill views.",
    months: "Mar - Apr",
    circuits: [
      { name: "Srinagar Tulip Special", query: "Srinagar" },
      { name: "Munnar Tea Gardens", query: "Munnar" },
      { name: "Darjeeling Blooming Hills", query: "Darjeeling" },
      { name: "Ooty Hill Retreat", query: "Ooty" },
    ],
    bannerImage: "",
  },
  summer: {
    tagline: "Beat the heat with high mountain passes in Leh Ladakh, cool pine forests in Manali, and serene Sikkim lakes.",
    months: "May - Jul",
    circuits: [
      { name: "Leh Ladakh High Passes", query: "Ladakh" },
      { name: "Spiti Valley Circuit", query: "Spiti" },
      { name: "Cool Shimla & Manali", query: "Himachal" },
      { name: "Gangtok & Sikkim Lakes", query: "Sikkim" },
    ],
    bannerImage: "",
  },
  monsoon: {
    tagline: "Soak in lush green waterfalls in Meghalaya, misty tea hills in Wayanad, and monsoon magic in Western Ghats.",
    months: "Aug - Oct",
    circuits: [
      { name: "Meghalaya Waterfalls", query: "Meghalaya" },
      { name: "Wayanad Rainforest", query: "Wayanad" },
      { name: "Coorg Coffee Trails", query: "Coorg" },
      { name: "Udaipur Lakes in Rain", query: "Udaipur" },
    ],
    bannerImage: "",
  },
};

const DEFAULT_GROUPS: SeasonGroup[] = [
  {
    id: "winter",
    name: "Winter Special",
    months: "November - February",
    icon: <Snowflake className="w-4 h-4" />,
    tagline: SEASON_CURATED_DATA.winter.tagline,
    circuits: SEASON_CURATED_DATA.winter.circuits.map((c) => ({
      name: c.name,
      href: `/tour-packages?search=${encodeURIComponent(c.query)}`,
    })),
    bannerImage: SEASON_CURATED_DATA.winter.bannerImage,
    bannerTag: SEASON_CURATED_DATA.winter.months,
  },
  {
    id: "spring",
    name: "Spring Escapes",
    months: "March - April",
    icon: <Flower2 className="w-4 h-4" />,
    tagline: SEASON_CURATED_DATA.spring.tagline,
    circuits: SEASON_CURATED_DATA.spring.circuits.map((c) => ({
      name: c.name,
      href: `/tour-packages?search=${encodeURIComponent(c.query)}`,
    })),
    bannerImage: SEASON_CURATED_DATA.spring.bannerImage,
    bannerTag: SEASON_CURATED_DATA.spring.months,
  },
  {
    id: "summer",
    name: "Summer Retreats",
    months: "May - July",
    icon: <Sun className="w-4 h-4" />,
    tagline: SEASON_CURATED_DATA.summer.tagline,
    circuits: SEASON_CURATED_DATA.summer.circuits.map((c) => ({
      name: c.name,
      href: `/tour-packages?search=${encodeURIComponent(c.query)}`,
    })),
    bannerImage: SEASON_CURATED_DATA.summer.bannerImage,
    bannerTag: SEASON_CURATED_DATA.summer.months,
  },
  {
    id: "monsoon",
    name: "Monsoon Wonders",
    months: "August - October",
    icon: <CloudRain className="w-4 h-4" />,
    tagline: SEASON_CURATED_DATA.monsoon.tagline,
    circuits: SEASON_CURATED_DATA.monsoon.circuits.map((c) => ({
      name: c.name,
      href: `/tour-packages?search=${encodeURIComponent(c.query)}`,
    })),
    bannerImage: SEASON_CURATED_DATA.monsoon.bannerImage,
    bannerTag: SEASON_CURATED_DATA.monsoon.months,
  },
];

function groupSeasons(seasons: Season[], journeys: Journey[]): SeasonGroup[] {
  if (!seasons || seasons.length === 0) return DEFAULT_GROUPS;

  const grouped: Record<string, Season[]> = {};
  for (const s of seasons) {
    const key = (s.season || "").trim().toLowerCase();
    if (!key) continue;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  }

  const order = ["winter", "spring", "summer", "monsoon"];
  const groups: SeasonGroup[] = [];

  for (const key of order) {
    const items = grouped[key] || [];
    const curated = SEASON_CURATED_DATA[key];

    const seasonPackages = journeys
      .filter((j) => j.months?.some((m) => (m.season || "").trim().toLowerCase() === key))
      .slice(0, 5);

    const dbCircuits: SeasonCircuit[] = seasonPackages.map((pkg) => {
      let prefix = "";
      if (pkg.noDays) {
        const nights = pkg.noDays - 1;
        if (nights > 1) prefix = `${nights} Nights - `;
        else if (nights === 1) prefix = `1 Night - `;
        else if (pkg.noDays === 1) prefix = `1 Day - `;
      }
      return {
        name: `${prefix}${pkg.h1Title || pkg.title}`,
        href: `/tour-packages/${pkg.slug}`,
      };
    });

    const circuits = dbCircuits.length > 0 
      ? dbCircuits 
      : curated?.circuits.map((c) => ({
          name: c.name,
          href: `/tour-packages?search=${encodeURIComponent(c.query)}`,
        })) || [];

    const bannerImage =
      items.find((m) => m.banner?.images?.[0])?.banner?.images?.[0] ||
      items.find((m) => m.thumbImg)?.thumbImg ||
      curated?.bannerImage ||
      FALLBACK_BANNER;

    const tagline =
      items.find((m) => m.bestFor)?.bestFor ||
      items.find((m) => m.seoDescription)?.seoDescription ||
      curated?.tagline ||
      `Explore the best of ${SEASON_LABELS[key] || key}`;

    const bannerTag =
      items.find((m) => m.banner?.bannerTag)?.banner?.bannerTag ||
      (curated?.months || "");

    const mainSlug = items[0]?.slug ? `/season/${items[0].slug}` : undefined;

    groups.push({
      id: key,
      name: SEASON_LABELS[key] || key,
      months: curated?.months ? `${SEASON_LABELS[key]} (${curated.months})` : key,
      icon: SEASON_ICONS[key] || <Calendar className="w-4 h-4" />,
      tagline,
      circuits,
      bannerImage,
      mainSlug,
      bannerTag,
    });
  }

  return groups.length > 0 ? groups : DEFAULT_GROUPS;
}

export const SeasonalTripsSection: React.FC<{
  initialSeasons?: { data: Season[] } | null;
  initialJourneys?: { data: Journey[] } | null;
}> = ({ initialSeasons, initialJourneys }) => {
  const seasons = initialSeasons?.data || [];
  const journeys = initialJourneys?.data || [];
  const seasonGroups = useMemo(() => groupSeasons(seasons, journeys), [seasons, journeys]);
  const [selectedSeason, setSelectedSeason] = useState<string>("winter");
  const currentSeason = seasonGroups.find((s) => s.id === selectedSeason) || seasonGroups[0];
  const curatedInfo = SEASON_CURATED_DATA[currentSeason?.id || "winter"] || SEASON_CURATED_DATA.winter;

  return (
    <section id="seasonal" className="py-20 bg-slate-50 relative overflow-hidden shadow-[inset_0_15px_20px_-15px_rgba(0,0,0,0.06)]">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <SectionLabel icon={<Calendar className="w-4 h-4" />}>Season-wise Planning</SectionLabel>
            <h2 className="h2 text-[#1C1C1C] mt-2">Best Trips By Season & Month</h2>
            <p className="mt-2 text-sm sm:text-base text-[#555] max-w-xl">
              Plan your trip by season — know when it snows, when it&apos;s cool, and the best time to visit.
            </p>
          </div>

          {/* Season Filter Tabs */}
          <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1">
            {seasonGroups.map((season) => {
              const isActive = currentSeason?.id === season.id;
              return (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeason(season.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {season.icon}
                  <span>{season.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Showcase Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl min-h-[420px] flex items-center border border-slate-200/20">
          <div className="absolute inset-0">
            <FallbackImage
              src={currentSeason.bannerImage}
              alt={currentSeason.name}
              fill
              className="object-cover object-right md:object-center transform scale-105 transition-all duration-700"
              theme="dark"
            />
          </div>
          <div className="absolute inset-0 bg-slate-900/60 md:bg-transparent md:bg-gradient-to-r md:from-slate-900/95 md:via-slate-900/30 md:to-transparent" />

          <div className="relative z-10 p-8 sm:p-12 lg:p-14 w-full flex flex-col lg:flex-row justify-between lg:items-center gap-10">
            <div className="max-w-xl space-y-6">
              {currentSeason.bannerTag && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-300 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
                  {currentSeason.icon}
                  <span>{currentSeason.bannerTag}</span>
                </div>
              )}

              <div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                  {currentSeason.name}
                </h3>
                <p className="mt-3 text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
                  {currentSeason.tagline}
                </p>
              </div>

              <div className="pt-4">
                <Link href={currentSeason.mainSlug || `/tour-packages?season=${encodeURIComponent(currentSeason.id)}`}>
                  <button className="bg-orange-500 text-white rounded-xl px-7 py-3.5 font-bold flex items-center gap-2.5 text-sm sm:text-base hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all cursor-pointer">
                    <span>Explore {currentSeason.name} Packages</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>

            {currentSeason.circuits.length > 0 && (
              <div className="w-full lg:w-auto shrink-0 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl overflow-x-auto custom-scrollbar">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-4">
                  Top Tour Packages
                </span>
                <div className="flex flex-col gap-2 min-w-max">
                  {currentSeason.circuits.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="group flex items-center gap-2.5 text-[13px] sm:text-sm font-bold text-slate-800 hover:text-orange-600 transition-all bg-white/80 hover:bg-white backdrop-blur-sm border border-white/40 px-4 py-2.5 rounded-xl shadow-sm whitespace-nowrap"
                    >
                      <ArrowRight className="w-4 h-4 text-orange-500 opacity-90 group-hover:translate-x-1 transition-all shrink-0" />
                      <span className="transition-colors">
                        {item.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeasonalTripsSection;
