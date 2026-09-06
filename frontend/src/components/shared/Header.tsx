"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, PhoneCall, User } from "lucide-react";
import { useGetStates } from "@/feature/state/api/useState";
import { useGetJourneys } from "@/feature/journey/api/useJourney";
import { useGetTravelExperiences } from "@/feature/travelExperience/api/useTravelExperience";
import type { State } from "@/feature/state/type";
import type { Journey } from "@/feature/journey/type";
import type { TravelExperience } from "@/feature/travelExperience/type";
import { stripTourSuffix, pickPriorityLinks, type NavChild } from "@/lib/utils";
import { QuoteModal } from "./QuoteModal";
import { RequestCallbackModal } from "./RequestCallbackModal";
import { DestinationMegaMenu, DestinationTreeCountry } from "./DestinationMegaMenu";

const DEFAULT_DESTINATION_LINKS: NavChild[] = [
  { href: "/tour-packages/india", label: "India" },
  { href: "/tour-packages/india/rajasthan", label: "Rajasthan" },
  { href: "/tour-packages/india/uttar-pradesh", label: "Uttar Pradesh" },
  { href: "/tour-packages/india/uttarakhand", label: "Uttarakhand" },
  { href: "/tour-packages/india/himachal-pradesh", label: "Himachal Pradesh" },
  { href: "/tour-packages/india/jammu-and-kashmir", label: "Jammu and Kashmir" },
  { href: "/tour-packages/india/punjab", label: "Punjab" },
  { href: "/tour-packages/india/ladakh", label: "Ladakh" },
  { href: "/tour-packages/india/delhi", label: "Delhi NCR" },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const isOfferPage = pathname?.startsWith("/offers/");

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const megaMenuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearMegaMenuCloseTimer = useCallback(() => {
    if (megaMenuCloseTimer.current) {
      clearTimeout(megaMenuCloseTimer.current);
      megaMenuCloseTimer.current = null;
    }
  }, []);

  const scheduleMegaMenuClose = useCallback(() => {
    megaMenuCloseTimer.current = setTimeout(() => {
      setOpenDesktopDropdown(null);
      megaMenuCloseTimer.current = null;
    }, 120);
  }, []);

  const { states } = useGetStates({ limit: 100, isActive: "true" });
  const { journeys } = useGetJourneys({ limit: 100, isActive: "true" });
  const { travelExperiences } = useGetTravelExperiences({
    limit: 100,
    isActive: "true",
  });

  const destinationTree = useMemo(() => {
    if (!states || states.length === 0) return [];

    // Only show cities that actually have tour packages/journeys in the menu.
    const journeyCityIds = new Set<number>();
    (journeys || []).forEach((j) => {
      (j.cities || []).forEach((c) => {
        if (typeof c.id === "number") journeyCityIds.add(c.id);
      });
    });

    const countryMap = new Map<number, DestinationTreeCountry>();

    states.forEach(state => {
      if (!state.country) return;

      if (!countryMap.has(state.country.id)) {
        countryMap.set(state.country.id, {
          id: state.country.id,
          title: state.country.title,
          slug: state.country.slug,
          href: `/tour-packages/${state.country.slug}`,
          states: []
        });
      }

      const countryEntry = countryMap.get(state.country.id)!;

      const sortedCities = [...(state.cities || [])]
        .filter((city) => typeof city.id === "number" && journeyCityIds.has(city.id))
        .sort((a, b) => {
          const aOrder = a.displayOrder && a.displayOrder > 0 ? a.displayOrder : 999;
          const bOrder = b.displayOrder && b.displayOrder > 0 ? b.displayOrder : 999;
          return aOrder - bOrder;
        })
        .map(city => ({
          id: city.id as number,
          title: stripTourSuffix(city.title || ""),
          slug: city.slug || "",
          href: `/tour-packages/${state.country!.slug}/${state.slug}/${city.slug}`
        }));

      if (sortedCities.length > 0) {
        countryEntry.states.push({
          id: state.id,
          title: stripTourSuffix(state.h1Title || state.title || ""),
          slug: state.slug,
          href: `/tour-packages/${state.country.slug}/${state.slug}`,
          displayOrder: state.displayOrder && state.displayOrder > 0 ? state.displayOrder : 999,
          cities: sortedCities
        });
      }
    });

    const result = Array.from(countryMap.values())
      .filter((country) => country.states.length > 0)
      .map((country) => {
        country.states.sort((a, b) => a.displayOrder - b.displayOrder);
        return country;
      });

    result.sort((a, b) => {
      if (a.slug.toLowerCase() === 'india') return -1;
      if (b.slug.toLowerCase() === 'india') return 1;
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [states, journeys]);

  const tourLinks = useMemo(
    () =>
      pickPriorityLinks<Journey>(
        journeys,
        (j) => j.displayOrder ?? 0,
        (j) => {
          return {
            href: `/tour-packages/${j.slug}`,
            label: stripTourSuffix(j.h1Title || j.title),
          };
        }
      ),
    [journeys]
  );

  const experienceLinks = useMemo(
    () =>
      pickPriorityLinks<TravelExperience>(
        travelExperiences,
        (e) => e.displayOrder ?? 0,
        (e) => ({ href: `/travel-experiences/${e.slug}`, label: stripTourSuffix(e.h1Title || e.title) })
      ),
    [travelExperiences]
  );

  type NavLink = {
    href: string;
    label: string;
    isDestinationMega?: boolean;
    tree?: DestinationTreeCountry[];
    children?: any[];
    dropdownStyle?: string;
    dropdownColumns?: number;
    seeAllHref?: string;
    dropdownTitle?: string;
    dropdownSubtext?: string;
  };

  const navLinks: NavLink[] = useMemo(
    () => [
      { href: "/", label: "Home" },
      {
        href: "/tour-packages/india",
        label: "Destinations",
        isDestinationMega: true,
        tree: destinationTree,
      },
      {
        href: "/tour-packages",
        label: "Tour Packages",
        children: tourLinks,
        dropdownStyle: "mega",
        dropdownColumns: 2,
        seeAllHref: "/tour-packages",
        dropdownTitle: "Top Tour Packages",
        dropdownSubtext: "Explore all tour packages",
      },
      {
        href: "/travel-experiences",
        label: "Experiences",
        children: experienceLinks,
        dropdownStyle: "mega",
        seeAllHref: "/travel-experiences",
        dropdownTitle: "Top Experiences",
        dropdownSubtext: "Explore all experiences",
      },
      {
        href: "/about-company",
        label: "About Company",
        children: [
          { href: "/about-us", label: "About Us" },
          { href: "/guest-gallery", label: "Guest Gallery" },
          { href: "/contact-us", label: "Contact Us" },
        ],
        dropdownStyle: "mega",
        dropdownColumns: 1,
        dropdownTitle: "About Company",
      },
      { href: "/blog", label: "Blog" },
    ],
    [destinationTree, tourLinks, experienceLinks]
  );

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`relative sticky top-0 z-50 transition-[background-color,border-color,box-shadow,padding] duration-300 ${isScrolled
        ? "bg-white/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)] border-b border-[#ececec] py-2"
        : "bg-white border-b border-[#f2f2f2] py-2.5"
        }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-stretch justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/logo-with-name.png"
              alt="Arivo Holidays"
              className="h-[68px] sm:h-[72px] md:h-[76px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </Link>

          {!isOfferPage && (
            <nav className="hidden md:flex items-stretch gap-0.5">
              {navLinks.map((link) => (
                <div
                  key={link.href}
                  className={`${link.isDestinationMega ? "" : "relative"} flex items-center h-full`}
                  onMouseEnter={() => (link.children || link.isDestinationMega) ? (clearMegaMenuCloseTimer(), setOpenDesktopDropdown(link.href)) : null}
                  onMouseLeave={() => (link.children || link.isDestinationMega) ? scheduleMegaMenuClose() : setOpenDesktopDropdown(null)}
                >
                  {link.children || link.isDestinationMega ? (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDesktopDropdown(
                          openDesktopDropdown === link.href ? null : link.href
                        )
                      }
                      className={`relative px-3 py-2.5 text-sm font-medium tracking-wide rounded-full transition-all duration-300 group flex items-center gap-1 hover:text-[#2E8B8B] hover:bg-[#2E8B8B]/5 cursor-pointer ${openDesktopDropdown === link.href
                        ? "text-[#2E8B8B] bg-[#2E8B8B]/5"
                        : "text-[#666]"
                        }`}
                    >
                      <span className="relative z-10">{link.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 relative z-10 transition-transform duration-300 ${openDesktopDropdown === link.href ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={`relative px-3 py-2.5 text-sm font-medium tracking-wide rounded-full transition-all duration-300 group flex items-center gap-1 hover:text-[#2E8B8B] hover:bg-[#2E8B8B]/5 ${openDesktopDropdown === link.href
                        ? "text-[#2E8B8B] bg-[#2E8B8B]/5"
                        : "text-[#666]"
                        }`}
                    >
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  )}

                  {link.isDestinationMega && link.tree && link.tree.length > 0 && (
                    <DestinationMegaMenu
                      tree={link.tree as DestinationTreeCountry[]}
                      isOpen={openDesktopDropdown === link.href}
                      onMouseEnter={() => { clearMegaMenuCloseTimer(); setOpenDesktopDropdown(link.href); }}
                      onMouseLeave={() => scheduleMegaMenuClose()}
                      onClose={() => setOpenDesktopDropdown(null)}
                    />
                  )}

                  {link.children && link.dropdownStyle === "mega" && !link.isDestinationMega && (
                    <div
                      // Keep dropdown open while mouse is over the dropdown area
                      onMouseEnter={() => setOpenDesktopDropdown(link.href)}
                      onMouseLeave={() => setOpenDesktopDropdown(null)}
                      className={`absolute left-1/2 -translate-x-1/2 top-full transition-opacity duration-200 ${openDesktopDropdown === link.href
                        ? "opacity-100 visible pointer-events-auto"
                        : "opacity-0 invisible pointer-events-none"
                        }`}
                    >
                      <div
                        className={`bg-white rounded-2xl border border-slate-200/90 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] p-6 ${link.dropdownColumns === 1 ? "w-[320px]" : "w-[640px]"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[18px] font-bold text-[#2E8B8B] tracking-tight">
                            {link.dropdownTitle ?? "Popular Tour Packages"}
                          </span>
                        </div>
                        <div
                          className={`grid gap-x-8 gap-y-2 ${link.dropdownColumns === 1
                            ? "grid-cols-1"
                            : link.dropdownColumns === 2
                              ? "grid-cols-2"
                              : "grid-cols-3"
                            }`}
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setOpenDesktopDropdown(null)}
                              className="py-1 text-[16px] text-slate-700 hover:text-[#2E8B8B] font-medium transition-colors duration-150 truncate block"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                        {link.seeAllHref && (
                          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[13px] text-slate-400 font-medium">
                              {link.dropdownSubtext ?? "Explore all destinations worldwide"}
                            </span>
                            <Link
                              href={link.seeAllHref}
                              onClick={() => setOpenDesktopDropdown(null)}
                              className="text-[15px] font-bold text-[#D4561A] hover:opacity-80 transition-opacity flex items-center gap-1"
                            >
                              <span>See All</span>
                              <span aria-hidden>→</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </nav>
          )}

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/my-trips"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#D4561A]" />
              <span>My Trips</span>
            </Link>
            <QuoteModal>
              <button
                type="button"
                className="btn-primary px-5 py-2.5 text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Get Detailed Quote</span>
              </button>
            </QuoteModal>
          </div>

          {!isOfferPage && (
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                className="p-2 rounded-lg text-[#555] hover:bg-[#f5f5f5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]/20"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {!isOfferPage && (
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${isMobileMenuOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="border-t border-[#ececec] bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-1">
            <Link
              href="/my-trips"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 mb-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#D4561A] to-[#B34310] shadow-sm"
            >
              <User className="w-4 h-4" />
              <span>My Trips / Traveller Portal 🧳</span>
            </Link>
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.href}>
                  <button
                    onClick={() =>
                      setOpenMobileDropdown(
                        openMobileDropdown === link.href ? null : link.href
                      )
                    }
                    aria-expanded={openMobileDropdown === link.href}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-[#555] hover:text-[#1C1C1C] hover:bg-[#f8f8f8] transition-colors"
                  >
                    <span>{link.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${openMobileDropdown === link.href ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-out ${openMobileDropdown === link.href
                      ? "max-h-[70vh] opacity-100 overflow-y-auto"
                      : "max-h-0 opacity-0 overflow-hidden"
                      }`}
                  >
                    <div className="pl-4 pb-1 space-y-0.5">
                      {link.isDestinationMega && link.tree ? (
                        <div className="space-y-4 pt-2">
                          {(link.tree as DestinationTreeCountry[]).map((country) => (
                            <div key={country.id} className="border-b border-[#f0f0f0] pb-3 last:border-0 last:pb-0">
                              <Link
                                href={country.href}
                                onClick={() => { setIsMobileMenuOpen(false); setOpenMobileDropdown(null); }}
                                className="block font-bold text-[#1C1C1C] text-[15px] mb-2"
                              >
                                {country.title}
                              </Link>
                              <div className="space-y-3 pl-2">
                                {country.states.map((state) => (
                                  <div key={state.id}>
                                    <Link
                                      href={state.href}
                                      onClick={() => { setIsMobileMenuOpen(false); setOpenMobileDropdown(null); }}
                                      className="block text-[14px] font-semibold text-[#2E8B8B] hover:opacity-80 mb-1"
                                    >
                                      {state.title}
                                    </Link>
                                    {state.cities.length > 0 && (
                                      <div className="pl-3 flex flex-col gap-1">
                                        {state.cities.slice(0, 5).map((city) => (
                                          <Link
                                            key={city.id}
                                            href={city.href}
                                            onClick={() => { setIsMobileMenuOpen(false); setOpenMobileDropdown(null); }}
                                            className="text-[13px] text-[#777] hover:text-[#2E8B8B]"
                                          >
                                            {city.title}
                                          </Link>
                                        ))}
                                        {state.cities.length > 5 && (
                                          <Link
                                            href={state.href}
                                            onClick={() => { setIsMobileMenuOpen(false); setOpenMobileDropdown(null); }}
                                            className="text-[12px] font-semibold text-[#D4561A] mt-1"
                                          >
                                            View all {state.cities.length} →
                                          </Link>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {link.children?.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setOpenMobileDropdown(null);
                              }}
                              className="block px-4 py-2.5 rounded-lg text-sm text-[#666] hover:text-[#1C1C1C] hover:bg-[#f8f8f8] transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                          {link.seeAllHref && (
                            <Link
                              href={link.seeAllHref}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setOpenMobileDropdown(null);
                              }}
                              className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#D4561A]"
                            >
                              See All
                              <span aria-hidden>→</span>
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-base font-medium transition-colors text-[#555] hover:text-[#1C1C1C] hover:bg-[#f8f8f8]"
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-3 mt-2 border-t border-[#ececec] flex flex-col gap-2">
              <QuoteModal>
                <button className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
                  <span>Enquire Now</span>
                </button>
              </QuoteModal>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
