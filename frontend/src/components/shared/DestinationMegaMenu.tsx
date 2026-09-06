"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, Compass } from "lucide-react";

export interface DestinationTreeCountry {
  id: number;
  title: string;
  slug: string;
  href: string;
  states: DestinationTreeState[];
}

export interface DestinationTreeState {
  id: number;
  title: string;
  slug: string;
  href: string;
  displayOrder: number;
  cities: DestinationTreeCity[];
}

export interface DestinationTreeCity {
  id: number;
  title: string;
  slug: string;
  href: string;
}

interface DestinationMegaMenuProps {
  tree: DestinationTreeCountry[];
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

export const DestinationMegaMenu: React.FC<DestinationMegaMenuProps> = ({
  tree,
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onClose,
}) => {
  const [activeCountryId, setActiveCountryId] = useState<number | null>(null);
  const [activeStateId, setActiveStateId] = useState<number | null>(null);

  // Active Country
  const displayCountryId = activeCountryId ?? (tree.length > 0 ? tree[0].id : null);
  const activeCountry = tree.find((c) => c.id === displayCountryId);

  // Active State inside Active Country
  const displayStateId =
    activeStateId && activeCountry?.states.some((s) => s.id === activeStateId)
      ? activeStateId
      : activeCountry?.states[0]?.id ?? null;

  const activeState = activeCountry?.states.find((s) => s.id === displayStateId);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute left-0 top-full transition-opacity duration-200 w-full z-50 ${isOpen
          ? "opacity-100 visible pointer-events-auto"
          : "opacity-0 invisible pointer-events-none"
        }`}
    >
      <div className="w-full bg-white border-b border-[#ececec] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.14)]">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 flex h-[420px] overflow-hidden">

          {/* COLUMN 1: Country List */}
          <div className="w-[210px] bg-slate-50 border-r border-[#ececec] shrink-0 py-5 px-3 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="h-7 flex items-center mb-2 px-2">
              <span className="text-[13px] font-extrabold tracking-widest text-[#888] uppercase flex items-center gap-1.5">
                <Compass size={14} className="text-[#D4561A]" />
                Country
              </span>
            </div>
            <div className="space-y-1">
              {tree.map((country) => {
                const isActive = displayCountryId === country.id;
                return (
                  <Link
                    key={country.id}
                    href={country.href}
                    onClick={onClose}
                    onMouseEnter={() => {
                      setActiveCountryId(country.id);
                      setActiveStateId(null);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors duration-150 text-[18px] font-bold ${isActive
                        ? "bg-[#2E8B8B] text-white shadow-xs"
                        : "text-[#555] hover:bg-slate-200/70 hover:text-[#2E8B8B]"
                      }`}
                  >
                    <span>{country.title}</span>
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-150 ${isActive ? "opacity-100 translate-x-0.5" : "opacity-40"
                        }`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: States List */}
          <div className="w-[270px] bg-slate-50/50 border-r border-[#ececec] shrink-0 py-5 px-3 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="h-7 flex items-center mb-2 px-2">
              <span className="text-[13px] font-extrabold tracking-widest text-[#888] uppercase">
                States & Regions
              </span>
            </div>
            {activeCountry && activeCountry.states.length > 0 ? (
              <div className="space-y-1">
                {activeCountry.states.map((state) => {
                  const isActive = displayStateId === state.id;
                  const cityCount = state.cities.length;
                  return (
                    <div
                      key={state.id}
                      onMouseEnter={() => setActiveStateId(state.id)}
                      className="group"
                    >
                      <Link
                        href={state.href}
                        onClick={onClose}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors duration-150 text-[17px] font-semibold ${isActive
                            ? "bg-white text-[#2E8B8B] font-bold shadow-xs"
                            : "text-[#555] hover:bg-white/80 hover:text-[#2E8B8B]"
                          }`}
                      >
                        <span className="truncate">{state.title}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {cityCount > 0 && (
                            <span
                              className={`text-[12px] px-2 py-0.5 rounded-full font-bold transition-colors ${isActive
                                  ? "bg-[#2E8B8B]/10 text-[#2E8B8B]"
                                  : "bg-slate-200/80 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                                }`}
                            >
                              {cityCount}
                            </span>
                          )}
                          <ChevronRight
                            size={15}
                            className={`transition-colors ${isActive
                                ? "text-[#2E8B8B] opacity-100"
                                : "text-slate-400 opacity-40 group-hover:opacity-80"
                              }`}
                          />
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-[14px] text-slate-400 italic">No states available</div>
            )}
          </div>

          {/* COLUMN 3: Cities & Content */}
          <div className="flex-1 py-5 px-8 bg-white flex flex-col justify-between overflow-y-auto custom-scrollbar">
            {activeState ? (
              <div className="space-y-5">
                {/* Header without bottom border */}
                <div className="flex items-baseline gap-2 pt-1 pb-1">
                  <h3 className="text-[19px] font-bold text-[#2E8B8B] tracking-tight">
                    {activeState.title}
                  </h3>
                  <span className="text-[14px] text-slate-400 font-medium">
                    ({activeCountry?.title})
                  </span>
                </div>

                {/* Cities Grid */}
                <div>
                  <div className="text-[13px] font-bold text-[#888] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#2E8B8B]" />
                    Popular Destinations
                  </div>
                  {activeState.cities.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-[#ececec] gap-y-2">
                      {activeState.cities.slice(0, 9).map((city) => (
                        <Link
                          key={city.id}
                          href={city.href}
                          onClick={onClose}
                          className="py-1 text-[17px] text-[#555] hover:text-[#2E8B8B] transition-colors truncate block"
                        >
                          {city.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[15px] text-slate-400 italic">Explore state tour packages directly.</p>
                  )}
                </div>

                {/* Bottom View All Link */}
                <div className="pt-2">
                  <Link
                    href={activeState.href}
                    onClick={onClose}
                    className="text-[16px] font-bold text-[#D4561A] hover:opacity-80 transition-opacity inline-flex items-center gap-1"
                  >
                    <span>{activeState.cities.length > 9 ? `View all ${activeState.cities.length} destinations` : "View All"}</span>
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-[15px] italic">
                Select a state to view destinations
              </div>
            )}


          </div>

        </div>
      </div>
    </div>
  );
};

export default DestinationMegaMenu;
