import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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

  // Default to first country if none selected
  const displayCountryId = activeCountryId ?? (tree.length > 0 ? tree[0].id : null);
  const activeCountry = tree.find((c) => c.id === displayCountryId);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute left-0 top-full transition-all duration-300 w-full ${
        isOpen
          ? "opacity-100 translate-y-0 visible"
          : "opacity-0 -translate-y-2 invisible pointer-events-none"
      }`}
    >
      <div className="w-full bg-[#f8f8f8] border-t border-b border-[#ececec] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)]">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 flex min-h-[460px] max-h-[70vh] overflow-hidden">
          {/* Left Sidebar: Countries */}
          <div className="w-[220px] bg-[#f8f8f8] shrink-0 pt-6 pb-4 pl-4 pr-0 flex flex-col overflow-y-auto custom-scrollbar">
          <span className="text-[15px] font-bold tracking-[0.08em] text-[#888] uppercase mb-2 px-3">
            Country
          </span>
          {tree.map((country) => {
            const isActive = displayCountryId === country.id;
            return (
              <Link
                key={country.id}
                href={country.href}
                onClick={onClose}
                onMouseEnter={() => setActiveCountryId(country.id)}
                className={`flex items-center justify-between pl-3 pr-2 py-2.5 rounded-l-lg transition-all duration-200 group text-[21px] relative border-y border-l ${
                  isActive
                    ? "bg-white text-[#2E8B8B] font-bold z-10 border-[#e5e5e5] shadow-[-2px_0_8px_rgba(0,0,0,0.03)]"
                    : "text-[#555] hover:bg-[#f0f0f0] hover:text-[#2E8B8B] font-medium mr-2 rounded-r-lg border-transparent"
                }`}
              >
                <span>{country.title}</span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isActive ? "translate-x-0.5 opacity-100 text-[#2E8B8B]" : "opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-50"
                  }`}
                />
              </Link>
            );
          })}
        </div>

          {/* Right Content: States & Cities */}
          <div className="flex-1 py-6 pl-4 pr-4 lg:py-8 lg:pl-6 lg:pr-6 bg-white overflow-y-auto custom-scrollbar relative z-0">
          {activeCountry && activeCountry.states.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-6">
              {activeCountry.states.map((state) => (
                <div key={state.id} className="break-inside-avoid">
                  <Link
                    href={state.href}
                    onClick={onClose}
                    className="inline-block text-[19px] font-bold text-[#2E8B8B] hover:opacity-80 transition-opacity mb-2"
                  >
                    {state.title}
                  </Link>
                  {state.cities.length > 0 ? (
                    <ul className="space-y-1">
                      {state.cities.slice(0, 5).map((city) => (
                        <li key={city.id}>
                          <Link
                            href={city.href}
                            onClick={onClose}
                            className="text-[17px] text-[#555] hover:text-[#D4561A] transition-colors inline-block py-0.5"
                          >
                            {city.title}
                          </Link>
                        </li>
                      ))}
                      {state.cities.length > 5 && (
                        <li className="pt-1">
                          <Link
                            href={state.href}
                            onClick={onClose}
                            className="text-[16px] font-bold text-[#D4561A] hover:opacity-80 transition-opacity inline-flex items-center gap-1"
                          >
                            View all {state.cities.length} <span aria-hidden>→</span>
                          </Link>
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-[16px] text-[#999] italic">Explore state</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[#999]">
              No destinations configured for this country yet.
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};
