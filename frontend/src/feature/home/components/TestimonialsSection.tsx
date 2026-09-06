"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Star, CheckCircle, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { FallbackImage } from "@/components/shared/FallbackImage";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  tripName: string;
  rating: number;
  comment: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "James & Eleanor Vance",
    location: "London, UK",
    tripName: "Golden Triangle & Varanasi (8D/7N)",
    rating: 5,
    comment: "Honestly, landing in Delhi at 2 AM was overwhelming, but seeing our driver Ramesh holding our nameplate with a big smile put us at ease. He kept cold water in the car, helped us in Jaipur markets, and took us to a quiet rooftop cafe facing the Taj Mahal!",
    avatar: "",
  },
  {
    id: 2,
    name: "Sarah & Daniel Jenkins",
    location: "Manchester, UK",
    tripName: "Kashmir Luxury Tour (6D/5N)",
    rating: 5,
    comment: "Our driver Tariq was amazing in Kashmir! Clean Innova cab, warm hotel rooms in Pahalgam, and zero hassle with Gulmarg snow passes.",
    avatar: "",
  },
  {
    id: 3,
    name: "Marcus & Clara Weber",
    location: "Munich, Germany",
    tripName: "Rajasthan Forts & Desert Safari (7D/6N)",
    rating: 5,
    comment: "What we appreciated most was the complete transparency. Zero hidden charges or forced shopping stops. Our driver Kuldeep was extremely courteous on long highway stretches between Jaipur, Jodhpur and Udaipur. Sleeping under the stars at Jaisalmer desert camp with local musicians playing folk music felt so genuine and memorable for us.",
    avatar: "",
  },
  {
    id: 4,
    name: "Liam & Emma Davies",
    location: "Sydney, Australia",
    tripName: "Kerala Backwaters & Hills (5D/4N)",
    rating: 5,
    comment: "Traveled with our elderly mother and a toddler. Driver Sunil drove very carefully on Munnar curves and stopped whenever mom needed tea. Houseboat chef even cooked non-spicy food specifically for our kid!",
    avatar: "",
  },
  {
    id: 5,
    name: "Sophie & David Miller",
    location: "Melbourne, Australia",
    tripName: "Kerala & South India Nature (8D/7N)",
    rating: 5,
    comment: "Flight into Kochi was delayed by 3 hours, but our driver waited patiently outside arrivals. Pristine tea estate stay in Munnar!",
    avatar: "",
  },
  {
    id: 6,
    name: "Clara & Thomas Schmidt",
    location: "Berlin, Germany",
    tripName: "Himachal Manali & Shimla (7D/6N)",
    rating: 5,
    comment: "Booked a trip for 6 of us. Clean cab, huge breakfast spread, and Atal Tunnel permits were pre-arranged so we avoided traffic jams. Our driver even recommended awesome local cafe spots in Old Manali!",
    avatar: "",
  },
];

export const TestimonialsSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { ref, isVisible } = useScrollReveal();

  const maxIndexDesktop = Math.max(0, TESTIMONIALS.length - 3); // 3
  const maxIndexMobile = TESTIMONIALS.length - 1; // 5

  const next = useCallback(() => {
    setCurrent((p) => (p >= maxIndexDesktop ? 0 : p + 1));
  }, [maxIndexDesktop]);

  const prev = useCallback(() => {
    setCurrent((p) => (p <= 0 ? maxIndexDesktop : p - 1));
  }, [maxIndexDesktop]);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [isPaused, next]);

  const renderCard = (item: Testimonial) => (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg relative flex flex-col justify-between h-full min-h-[300px]">
      <Quote className="absolute top-6 right-6 text-slate-100 pointer-events-none" size={60} />
      
      <div>
        <div className="flex gap-1 mb-6 relative z-10">
          {[...Array(item.rating)].map((_, i) => (
            <Star key={i} size={18} className="text-orange-500 fill-orange-500" />
          ))}
        </div>
        <p className="text-slate-700 leading-relaxed relative z-10 mb-8 italic text-sm sm:text-[15px]">
          &ldquo;{item.comment}&rdquo;
        </p>
      </div>

      <div className="flex items-center gap-4 relative z-10 mt-auto border-t border-slate-100 pt-6">
        <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold text-base flex items-center justify-center shrink-0 select-none shadow-sm">
          {(item.name || "A").trim().charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 truncate">
            <span className="truncate">{item.name}</span>
            <CheckCircle className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20 shrink-0" />
          </h4>
          <p className="text-xs text-slate-500">{item.location}</p>
          {item.tripName && (
            <p className="text-[11px] text-orange-500 font-semibold mt-0.5 truncate flex items-center gap-1">
              <span>✈</span> <span className="truncate">{item.tripName}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section ref={ref} className="py-20 bg-slate-50 overflow-hidden relative shadow-[inset_0_15px_20px_-15px_rgba(0,0,0,0.06)]" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      {/* Testimonials Pattern Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.8]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23D4561A' stroke-width='1.5' opacity='0.08'%3E%3Cpath d='M0 60 Q30 10, 60 60 T120 60' stroke-dasharray='4 4' /%3E%3Ccircle cx='60' cy='60' r='3' fill='%23D4561A' /%3E%3Ccircle cx='60' cy='60' r='8' stroke-dasharray='2 2' /%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '120px 120px'
      }} />
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <SectionLabel>Traveler Reviews</SectionLabel>
            <h2 className="h2 text-[#1C1C1C] mt-2">Real Stories From Our Guests</h2>
            <p className="mt-2 text-sm sm:text-base text-[#555] max-w-xl">Real stories from our guests who experienced the perfect holiday with zero stress.</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1C1C1C]">
            <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span>4.9</span>
            <span className="text-[#888] font-normal">/5 Rating</span>
          </div>
        </div>

        <div className={`relative transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {/* Desktop - 3 cards sliding */}
          <div className="hidden md:block overflow-hidden py-2 px-1">
            <div
              className="flex gap-8 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${current * (100 / 3 + 1.15)}%)` }}
            >
              {TESTIMONIALS.map((item) => (
                <div key={item.id} className="shrink-0 w-[calc(33.333%-21.33px)]">
                  {renderCard(item)}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile - single card sliding */}
          <div className="md:hidden overflow-hidden py-2 px-1">
            <div
              className="flex gap-4 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${Math.min(current, maxIndexMobile) * (100 + 4)}%)` }}
            >
              {TESTIMONIALS.map((item) => (
                <div key={item.id} className="w-full shrink-0">
                  {renderCard(item)}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prev}
            aria-label="Previous review"
            className="absolute top-1/2 -left-4 -translate-y-1/2 w-11 h-11 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center text-slate-700 hover:text-orange-500 hover:border-orange-500 transition-all hidden md:flex cursor-pointer z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next review"
            className="absolute top-1/2 -right-4 -translate-y-1/2 w-11 h-11 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center text-slate-700 hover:text-orange-500 hover:border-orange-500 transition-all hidden md:flex cursor-pointer z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: maxIndexDesktop + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === current ? "w-8 h-2.5 bg-orange-500" : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
