"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Flower2, Snowflake, CloudRain, ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/shared/SectionLabel";

interface SeasonItem {
  id: string;
  name: string;
  months: string;
  icon: React.ReactNode;
  tagline: string;
  destinations: string[];
  bannerImage: string;
}

const SEASON_PATTERNS: Record<string, string> = {
  winter: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%231C1C1C' stroke-width='0.5' opacity='0.07'%3E%3Cpath d='M40 10 L40 70 M10 40 L70 40 M18 18 L62 62 M62 18 L18 62'/%3E%3Ccircle cx='40' cy='40' r='4'/%3E%3Ccircle cx='40' cy='10' r='3'/%3E%3Ccircle cx='40' cy='70' r='3'/%3E%3Ccircle cx='10' cy='40' r='3'/%3E%3Ccircle cx='70' cy='40' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
  spring: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23D4561A' stroke-width='0.5' opacity='0.06'%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3Ccircle cx='40' cy='40' r='18'/%3E%3Cpath d='M40 12 L40 4 M40 68 L40 76 M12 40 L4 40 M68 40 L76 40 M20.2 20.2 L14.5 14.5 M59.8 20.2 L65.5 14.5 M20.2 59.8 L14.5 65.5 M59.8 59.8 L65.5 65.5'/%3E%3C/g%3E%3C/svg%3E")`,
  monsoon: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='80' viewBox='0 0 60 80'%3E%3Cg fill='none' stroke='%231C1C1C' stroke-width='0.5' opacity='0.06'%3E%3Cpath d='M10 0 L10 20 Q10 25 15 25 L10 25'/%3E%3Cpath d='M30 10 L30 30 Q30 35 35 35 L30 35'/%3E%3Cpath d='M50 5 L50 25 Q50 30 55 30 L50 30'/%3E%3Cpath d='M20 40 L20 60 Q20 65 25 65 L20 65'/%3E%3Cpath d='M40 50 L40 70 Q40 75 45 75 L40 75'/%3E%3C/g%3E%3C/svg%3E")`,
};

const SEASONS: SeasonItem[] = [
  {
    id: "winter",
    name: "Winter Special",
    months: "Oct - Mar",
    icon: <Snowflake className="w-4 h-4" />,
    tagline: "Enjoy snow in Gulmarg, Manali and Auli ski slopes",
    destinations: ["Gulmarg Snowfall", "Shimla Manali", "Auli Skiing", "Jaisalmer Desert Fair"],
    bannerImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "spring",
    name: "Spring Escapes",
    months: "Apr - Jun",
    icon: <Flower2 className="w-4 h-4" />,
    tagline: "Visit cool places like Kashmir, Ladakh and Leh with blooming landscapes",
    destinations: ["Ladakh Bike Tour", "Kashmir Valley", "Darjeeling & Gangtok", "Nainital & Mussoorie"],
    bannerImage: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "monsoon",
    name: "Monsoon Wonders",
    months: "Jul - Sep",
    icon: <CloudRain className="w-4 h-4" />,
    tagline: "See green hills and waterfalls in Munnar, Wayanad and Goa",
    destinations: ["Kerala Backwaters", "Wayanad Hills", "Dudhsagar Goa", "Coorg Coffee Estate"],
    bannerImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
  },
];

export const SeasonalTripsSection: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState<string>("winter");
  const currentSeason = SEASONS.find((s) => s.id === selectedSeason) || SEASONS[0];

  return (
    <section id="seasonal" className="py-20 bg-[#f8f8f8] relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: SEASON_PATTERNS[selectedSeason] || SEASON_PATTERNS.winter }} />
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <SectionLabel icon={<Calendar className="w-4 h-4" />}>Season-wise Planning</SectionLabel>
            <h2 className="h2 text-[#1C1C1C]">Best Trips By Season & Month</h2>
            <p className="mt-1 text-sm text-[#555] max-w-xl">Plan your trip by season — know when it snows, when it's cool, and the best time to visit.</p>
          </div>
          <div className="flex bg-[#f8f8f8] p-1 rounded-xl border border-[#e5e5e5]">
            {SEASONS.map((season) => (
              <button key={season.id} onClick={() => setSelectedSeason(season.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  selectedSeason === season.id ? "bg-[#1C1C1C] text-white" : "text-[#555] hover:text-[#1C1C1C]"
                }`}>
                {season.icon}<span>{season.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-[#1C1C1C] text-white shadow-md min-h-[380px] flex items-center">
          <div className="absolute inset-0 bg-cover bg-center opacity-50 transition-all duration-700"
            style={{ backgroundImage: `url('${currentSeason.bannerImage}')` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1C]/90 via-[#1C1C1C]/50 to-transparent" />

          <div className="relative z-10 p-8 sm:p-12 lg:p-14 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-4">
              <span>{currentSeason.months} Peak Season</span>
            </div>
            <h3 className="h3 text-white leading-tight">{currentSeason.name}</h3>
            <p className="mt-3 text-sm sm:text-base text-white/70 leading-relaxed font-medium">{currentSeason.tagline}</p>

            <div className="mt-6">
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-2">Recommended Circuits:</span>
              <div className="flex flex-wrap gap-2">
                {currentSeason.destinations.map((dest, idx) => (
                  <span key={idx} className="bg-white/10 border border-white/20 px-3 py-1 rounded-lg text-xs font-medium text-white">{dest}</span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <Link href="/india/tour-packages">
                <button className="bg-[#D4561A] text-white rounded-xl px-6 py-3 font-bold flex items-center gap-2 text-sm hover:bg-[#C24D15] transition-all">
                  <span>Explore Season Packages</span><ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeasonalTripsSection;
