"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Globe2,
  Building2,
  ArrowRight,
  Landmark,
  Sparkles,
} from "lucide-react";
import type { Country } from "@/feature/country/type";
import type { State } from "@/feature/state/type";
import type { City } from "@/feature/city/type";

interface AllDestinationsProps {
  countries: Country[];
  states: State[];
  cities: City[];
  totals: { countries: number; states: number; cities: number };
}

const normalize = (value: string) => value.trim().toLowerCase();

export const AllDestinations: React.FC<AllDestinationsProps> = ({
  countries,
  states,
  cities,
  totals,
}) => {
  const [search, setSearch] = useState("");
  const query = normalize(search);
  const [activeCountryId, setActiveCountryId] = useState<number | null>(null);

  const citiesByState = useMemo(() => {
    const map = new Map<number, City[]>();
    for (const city of cities) {
      const list = map.get(city.stateId) ?? [];
      list.push(city);
      map.set(city.stateId, list);
    }
    return map;
  }, [cities]);

  const tree = useMemo(() => {
    return countries
      .map((country) => {
        const countryStates = states
          .filter(
            (s) =>
              s.countryId === country.id ||
              s.country?.id === country.id
          )
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((s) => ({
            state: s,
            stateCities: (citiesByState.get(s.id) ?? []).sort(
              (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
            ),
          }));
        return { country, countryStates };
      })
      .filter(({ country, countryStates }) => {
        if (!query) return true;
        if (normalize(country.title).includes(query)) return true;
        return countryStates.some(
          (s) =>
            normalize(s.state.title).includes(query) ||
            s.stateCities.some((c) => normalize(c.title).includes(query))
        );
      });
  }, [countries, states, citiesByState, query]);

  useEffect(() => {
    if (tree.length > 0) {
      if (!activeCountryId || !tree.find((t) => t.country.id === activeCountryId)) {
        setActiveCountryId(tree[0].country.id);
      }
    }
  }, [tree, activeCountryId]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-[#1C1C1C]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E8B8B]/20 via-transparent to-[#D4561A]/20 opacity-40" />
        
        <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-semibold mb-6 border border-white/20 backdrop-blur-md">
            <Globe2 className="w-4 h-4" /> Explore the World
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            Find Your Next <span className="text-[#D4561A]">Adventure</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 font-medium">
            Discover curated tour packages across {totals.countries} countries, {totals.states} states, and {totals.cities} cities.
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#D4561A] transition-colors" />
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by country, state, or city..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:bg-white focus:text-[#1C1C1C] focus:placeholder-slate-400 focus:ring-4 focus:ring-[#D4561A]/30 transition-all duration-300 text-lg shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
          {tree.length === 0 ? (
             <div className="bg-white rounded-3xl border border-slate-200 py-32 text-center shadow-sm">
                <MapPin size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">No destinations found</h3>
                <p className="text-slate-500">We couldn't find anything matching &quot;{search}&quot;</p>
             </div>
          ) : (
            <div className="space-y-12">
              {/* Country Tabs */}
              {tree.length > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-3 border-b border-slate-200 pb-8 mb-4">
                  {tree.map(({ country }) => (
                    <button
                      key={country.id}
                      onClick={() => setActiveCountryId(country.id)}
                      className={`px-8 py-3.5 rounded-full font-bold text-[16px] transition-all duration-300 ${
                        activeCountryId === country.id
                          ? "bg-[#1C1C1C] text-white shadow-lg shadow-black/10 scale-105"
                          : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200 hover:text-[#1C1C1C]"
                      }`}
                    >
                      {country.title} Destinations
                    </button>
                  ))}
                </div>
              )}

              {/* Render Active Country Content */}
              {tree
                .filter(({ country }) => country.id === activeCountryId)
                .map(({ country, countryStates }) => (
                <article key={country.id} className="relative">
                  {/* Country Header */}
                  <div className="flex items-end justify-between border-b border-slate-200 pb-4 mb-8">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black text-[#1C1C1C] flex items-center gap-3">
                        <MapPin className="w-8 h-8 text-[#2E8B8B]" />
                        {country.title}
                      </h2>
                      {country.h1Title && country.h1Title !== country.title && (
                        <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base">
                          {country.h1Title}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/tour-packages/${country.slug}`}
                      className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#D4561A] hover:text-[#b34713] transition-colors group"
                    >
                      Explore Country
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* States Grid (Full-width Premium Cards) */}
                  {countryStates.length > 0 ? (
                    <div className="space-y-12">
                      {countryStates.map(({ state, stateCities }) => (
                        <div key={state.id} className="relative bg-white rounded-[32px] p-8 md:p-10 border border-slate-200/60 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden">
                          
                          {/* Decorative subtle background blur */}
                          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#2E8B8B]/5 to-transparent rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                          {/* State Header */}
                          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                              <Link href={`/tour-packages/${country.slug}/${state.slug}`} className="w-14 h-14 rounded-xl bg-orange-50 border border-orange-100 text-[#D4561A] hover:bg-[#D4561A] hover:text-white transition-colors duration-300 flex items-center justify-center shrink-0">
                                 <Building2 className="w-6 h-6" />
                              </Link>
                              <Link href={`/tour-packages/${country.slug}/${state.slug}`}>
                                <h3 className="text-2xl font-bold text-[#1C1C1C] hover:text-[#D4561A] transition-colors">
                                  {state.title}
                                </h3>
                              </Link>
                            </div>
                            
                            <Link 
                                href={`/tour-packages/${country.slug}/${state.slug}`}
                                className="btn-primary hidden sm:inline-flex group items-center justify-center gap-2 px-6 py-2.5 text-[14px]"
                            >
                                View Tour Packages 
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>

                          {/* Cities Grid List */}
                          <div>
                            {stateCities.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
                                {stateCities.map((city) => (
                                  <Link
                                    key={city.id}
                                    href={`/tour-packages/${country.slug}/${state.slug}/${city.slug}`}
                                    className="group/city relative rounded-2xl md:rounded-[20px] overflow-hidden aspect-[4/3] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 block bg-slate-100"
                                  >
                                    {city.thumbImg ? (
                                      <img 
                                        src={city.thumbImg} 
                                        alt={city.title} 
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover/city:scale-110" 
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-100">
                                        <Landmark className="w-10 h-10 text-slate-300 group-hover/city:text-[#D4561A] transition-colors" />
                                      </div>
                                    )}
                                    
                                    {/* Gradients */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover/city:opacity-100 transition-opacity duration-500" />
                                    
                                    {/* Inner Glassy Border */}
                                    <div className="absolute inset-0 border-[1.5px] border-white/10 rounded-2xl md:rounded-[20px] pointer-events-none group-hover/city:border-white/25 transition-colors duration-500" />

                                    {/* Content - Centered */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 flex flex-col items-center justify-end text-center h-full">
                                      <span className="block text-[18px] md:text-[20px] font-black text-white leading-tight mb-2 group-hover/city:-translate-y-1 transition-transform duration-300 drop-shadow-md">
                                        {city.title}
                                      </span>
                                      
                                      <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[12px] font-bold text-white border border-white/10 shadow-sm group-hover/city:-translate-y-1 transition-transform duration-300 delay-75">
                                        {(city as any).tourCount || 0} Tours
                                      </span>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center py-12 bg-slate-50 rounded-2xl border border-slate-100/60 text-slate-500 font-medium italic">
                                 No cities found.
                              </div>
                            )}
                            
                            {/* Mobile View State Link */}
                            <div className="mt-8 sm:hidden">
                               <Link 
                                  href={`/tour-packages/${country.slug}/${state.slug}`}
                                  className="btn-primary flex items-center justify-center w-full gap-2 text-[15px] py-4"
                               >
                                 View {state.title} Packages
                               </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
                      <p className="text-slate-500">More destinations in {country.title} coming soon.</p>
                    </div>
                  )}

                  {/* Mobile Country Link */}
                  <div className="mt-6 sm:hidden">
                    <Link
                      href={`/tour-packages/${country.slug}`}
                      className="flex items-center justify-center gap-2 text-sm font-bold text-[#D4561A] bg-orange-50 hover:bg-orange-100 transition-colors px-4 py-3 rounded-xl"
                    >
                      Explore All of {country.title}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AllDestinations;
