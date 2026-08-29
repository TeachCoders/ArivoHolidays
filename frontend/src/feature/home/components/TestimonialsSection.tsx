"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Star, CheckCircle, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { SectionLabel } from "@/components/shared/SectionLabel";

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
  { id: 1, name: "Vikram & Ananya Sharma", location: "Delhi", tripName: "Kashmir Honeymoon (6D/5N)", rating: 5, comment: "Our Kashmir trip was magical! The private cab driver was super polite, and our houseboats stay in Dal Lake was unforgettable. Highly recommended for couples.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { id: 2, name: "Rajesh Kulkarni", location: "Mumbai", tripName: "Kerala Family Trip (5D/4N)", rating: 5, comment: "Everything was perfectly coordinated from pickup at Cochin airport to Munnar resorts and Alleppey houseboat. Top-notch service for families.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { id: 3, name: "Pooja & Amit Verma", location: "Bengaluru", tripName: "Himachal Manali Package", rating: 5, comment: "Booked a custom tour for 6 friends. Clean Innova cab throughout the trip. Great hotel food and hassle-free check-ins at every stop.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
  { id: 4, name: "Sunita Reddy", location: "Hyderabad", tripName: "Rajasthan Heritage (8D/7N)", rating: 5, comment: "The Rajasthan fort stay and desert safari were absolutely amazing! Trip manager was available round the clock and handled everything.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" },
  { id: 5, name: "Arjun & Meera Nair", location: "Chennai", tripName: "Goa Beach Escape (4D/3N)", rating: 5, comment: "Perfect weekend getaway! Beach resort was stunning, cab was punctual, team arranged a surprise dinner for our anniversary.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" },
];

export const TestimonialsSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { ref, isVisible } = useScrollReveal();

  const next = useCallback(() => setCurrent((p) => (p + 1) % TESTIMONIALS.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), []);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [isPaused, next]);

  const renderCard = (item: Testimonial, isFeatured: boolean = false) => (
    <div className={`rounded-2xl flex flex-col justify-between relative ${
      isFeatured
        ? "bg-white p-8 border border-[#e5e5e5] shadow-lg"
        : "bg-white p-6 border border-[#f0f0f0]"
    }`}>
      <Quote className={`absolute top-5 right-5 text-[#D4561A]/10 ${isFeatured ? "w-10 h-10" : "w-7 h-7"}`} />
      <div>
        <div className="flex items-center gap-0.5 mb-4">
          {[...Array(item.rating)].map((_, i) => (
            <Star key={i} className={`${isFeatured ? "w-4 h-4" : "w-3.5 h-3.5"} text-[#D4561A] fill-[#D4561A]`} />
          ))}
        </div>
        <p className={`text-[#333] italic leading-relaxed ${isFeatured ? "text-base" : "text-sm"}`}>
          &ldquo;{item.comment}&rdquo;
        </p>
      </div>
      <div className={`mt-5 pt-4 border-t border-[#f0f0f0] flex items-center gap-3`}>
        <img src={item.avatar} alt={item.name} loading="lazy" decoding="async"
          className={`${isFeatured ? "w-12 h-12" : "w-10 h-10"} rounded-full object-cover border-2 border-[#D4561A]/20`} />
        <div>
          <h4 className="text-sm font-bold text-[#1C1C1C] flex items-center gap-1.5">
            <span>{item.name}</span>
            <CheckCircle className="w-3.5 h-3.5 text-[#D4561A] fill-[#D4561A]/20" />
          </h4>
          <p className="text-xs text-[#888] mt-0.5">{item.tripName} &bull; {item.location}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section ref={ref} className="py-20 bg-[#f8f8f8]" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <SectionLabel>Traveler Reviews</SectionLabel>
            <h2 className="h2 text-[#1C1C1C] mt-2">Real Stories From Real Guests</h2>
            <p className="mt-2 text-sm sm:text-base text-[#555] max-w-xl">Read what our travellers say about their trips, hotels and cab services.</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1C1C1C]">
              <Star className="w-5 h-5 text-[#D4561A] fill-[#D4561A]" />
              <span>4.9</span>
              <span className="text-[#888] font-normal">/5 Rating</span>
            </div>
        </div>

        <div className={`relative transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {/* Desktop - 3 cards sliding */}
          <div className="hidden md:block overflow-hidden">
            <div className="flex gap-5 transition-transform duration-600 ease-in-out" style={{ transform: `translateX(-${current * (100 / 3)}%)` }}>
              {[...TESTIMONIALS, ...TESTIMONIALS.slice(0, 3)].map((item, i) => {
                const isCenter = i % 3 === 1;
                return (
                  <div key={`${item.id}-${i}`} className={`shrink-0 w-[calc(33.333%-13.33px)] ${isCenter ? "self-center" : "self-center"}`}>
                    {renderCard(item, isCenter)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile - single card sliding */}
          <div className="md:hidden overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
              {TESTIMONIALS.map((item) => (
                <div key={item.id} className="w-full shrink-0 px-0">
                  {renderCard(item, true)}
                </div>
              ))}
            </div>
          </div>

          <button onClick={prev}
            className="absolute top-1/2 -left-5 -translate-y-1/2 w-10 h-10 bg-white border border-[#e5e5e5] rounded-full shadow-sm flex items-center justify-center hover:border-[#D4561A]/30 hover:text-[#D4561A] transition-all hidden md:flex">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next}
            className="absolute top-1/2 -right-5 -translate-y-1/2 w-10 h-10 bg-white border border-[#e5e5e5] rounded-full shadow-sm flex items-center justify-center hover:border-[#D4561A]/30 hover:text-[#D4561A] transition-all hidden md:flex">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "w-8 h-2 bg-[#D4561A]" : "w-2 h-2 bg-[#ddd] hover:bg-[#aaa]"
              }`} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
