"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { API_BASE } from "@/lib/apiClient";
import HeroSearchBar from "@/components/shared/HeroSearchBar";

const SLIDES = [
  { image: `${API_BASE}/content/rajasthan-tours-holiday-1.webp`, alt: "Rajasthan heritage tour" },
  { image: `${API_BASE}/content/srinagar-holiday-1.webp`, alt: "Srinagar Kashmir holiday" },
  { image: `${API_BASE}/content/jaipur-holiday-1.webp`, alt: "Jaipur royal heritage" },
  { image: `${API_BASE}/content/manali-holiday-1.webp`, alt: "Manali Himachal holiday" },
];

export const HeroSection: React.FC = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative min-h-[600px] lg:min-h-[680px] flex items-center justify-center overflow-hidden py-14 lg:py-20">
      <div className="absolute inset-0 flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
        {SLIDES.map((s, i) => (
          <img
            key={i}
            src={s.image}
            alt={s.alt}
            fetchPriority={i === 0 ? "high" : undefined}
            loading={i === 0 ? "eager" : "lazy"}
            className="w-full h-full object-cover object-center shrink-0"
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

      <button onClick={prev}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 w-full text-center">

        <h1 className="hero-heading text-white leading-[1.12] max-w-4xl mx-auto drop-shadow-lg transition-all duration-700">
          Find Your Perfect <span className="text-[#D4561A]">Holiday</span>
        </h1>

        <div className="mt-10">
          <HeroSearchBar />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
