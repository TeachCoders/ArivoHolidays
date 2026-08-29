"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronLeft, ChevronRight, X, MapPin, Camera, ExternalLink } from "lucide-react";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { Destination } from "./types";

interface DestinationsAccordionProps {
  destinations: Destination[];
}

const groupByState = (destinations: Destination[]) => {
  const groups: { state: string; destinations: Destination[] }[] = [];
  const index = new Map<string, number>();
  for (const dest of destinations) {
    const existing = index.get(dest.state);
    if (existing === undefined) {
      index.set(dest.state, groups.length);
      groups.push({ state: dest.state, destinations: [dest] });
    } else {
      groups[existing].destinations.push(dest);
    }
  }
  return groups;
};

const slugToLabel = (name: string) =>
  name
    .split("-")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");

export const DestinationsAccordion: React.FC<DestinationsAccordionProps> = ({ destinations }) => {
  const groups = groupByState(destinations);
  const [openStates, setOpenStates] = useState<Set<string>>(() => new Set([groups[0]?.state]));
  const [lightbox, setLightbox] = useState<{ destination: Destination; index: number } | null>(null);

  const toggleState = (state: string) => {
    setOpenStates((prev) => {
      const next = new Set(prev);
      if (next.has(state)) next.delete(state);
      else next.add(state);
      return next;
    });
  };

  const showImage = (destination: Destination, index: number) => setLightbox({ destination, index });

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const navigateLightbox = useCallback(
    (direction: 1 | -1) => {
      setLightbox((current) => {
        if (!current) return current;
        const count = current.destination.banners.length;
        return { ...current, index: (current.index + direction + count) % count };
      });
    },
    []
  );

  useEffect(() => {
    if (!lightbox) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") navigateLightbox(1);
      if (event.key === "ArrowLeft") navigateLightbox(-1);
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, closeLightbox, navigateLightbox]);

  return (
    <section className="py-16 sm:py-20 bg-[#f8f8f8]">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <SectionLabel icon={<MapPin className="w-4 h-4" />}>Explore Destinations</SectionLabel>
          <h1 className="h1 text-[#1C1C1C] mt-1">Destinations Across India</h1>
          <p className="mt-3 text-base text-[#555] leading-relaxed">
            Browse {destinations.length} hand-picked destinations grouped by state. Tap any destination to view its
            photo gallery.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {groups.map((group) => {
            const isOpen = openStates.has(group.state);
            return (
              <div
                key={group.state}
                className={`bg-white rounded-xl border overflow-hidden transition-colors ${
                  isOpen ? "border-[#D4561A]/30 shadow-sm" : "border-[#e5e5e5]"
                }`}
              >
                <button
                  onClick={() => toggleState(group.state)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shrink-0 ${
                        isOpen ? "bg-[#D4561A] text-white" : "bg-[#f0f0f0] text-[#555]"
                      }`}
                    >
                      {group.destinations.length}
                    </span>
                    <h2 className="h4 text-[#1C1C1C] group-hover:text-[#D4561A] transition-colors">{group.state}</h2>
                  </div>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isOpen ? "bg-[#D4561A] text-white rotate-180" : "bg-[#f0f0f0] text-[#555]"
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 pt-1">
                      {group.destinations.map((destination) => (
                        <button
                          key={destination.slug}
                          onClick={() => showImage(destination, 0)}
                          className="group text-left rounded-xl overflow-hidden bg-white border border-[#e5e5e5] hover:border-[#D4561A]/40 hover:shadow-md transition-all focus:outline-none"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-[#f0f0f0]">
                            <Image
                              src={destination.thumb}
                              alt={`${destination.city} tourism photo`}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-3.5 h-3.5" />
                              {destination.banners.length} photos
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="h6 text-[#1C1C1C]">{destination.city}</h3>
                            <p className="mt-1 text-xs text-[#888] leading-relaxed line-clamp-2">
                              {destination.attractions.join(", ")}
                            </p>
                            <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-[#D4561A]">
                              <ExternalLink className="w-3.5 h-3.5" /> View gallery
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            aria-label="Close gallery"
            className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              navigateLightbox(-1);
            }}
            aria-label="Previous photo"
            className="absolute left-3 sm:left-6 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              navigateLightbox(1);
            }}
            aria-label="Next photo"
            className="absolute right-3 sm:right-6 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            className="w-full max-w-5xl px-4 sm:px-16 py-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
              <Image
                src={lightbox.destination.banners[lightbox.index]}
                alt={`${lightbox.destination.city} photo ${lightbox.index + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="object-cover"
                loading="eager"
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-4 text-white">
              <div className="min-w-0">
                <h3 className="h6 text-white truncate">{lightbox.destination.city}</h3>
                <p className="text-sm text-white/60 truncate">{lightbox.destination.attractions.join(", ")}</p>
              </div>
              <span className="text-sm text-white/80 font-medium shrink-0">
                {lightbox.index + 1} / {lightbox.destination.banners.length}
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 hidden sm:flex justify-center gap-2">
            {lightbox.destination.banners.map((banner, i) => {
              const name = banner.split("/").pop()?.replace(/\.webp$/, "") ?? `photo-${i + 1}`;
              return (
                <button
                  key={banner}
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightbox((current) => (current ? { ...current, index: i } : current));
                  }}
                  aria-label={`Go to ${slugToLabel(name)}`}
                  className={`h-12 w-20 rounded-md overflow-hidden border-2 transition-all ${
                    i === lightbox.index ? "border-white opacity-100" : "border-transparent opacity-40 hover:opacity-80"
                  }`}
                >
                  <Image src={banner} alt="" fill className="object-cover" sizes="80px" loading="lazy" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default DestinationsAccordion;
