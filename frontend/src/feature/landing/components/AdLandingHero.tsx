"use client";

import React from "react";
import { Sparkles, Star, ArrowRight } from "lucide-react";
import { FallbackImage } from "@/components/shared/FallbackImage";
import TourBookingForm from "@/feature/leads/components/TourBookingForm";

interface AdLandingHeroProps {
  title?: string;
  subtitle?: string;
  destinationName?: string;
  discountBadge?: string;
  bannerImage?: string;
  slug?: string;
  ctaText?: string;
}

export default function AdLandingHero({
  title = "Exclusive Holiday Packages - Custom Crafted For You",
  subtitle = "Get 100% customized tour itineraries with private transfers, premium stay & 24/7 on-trip assistance at factory-direct rates.",
  destinationName = "Kashmir & Exotic Destinations",
  discountBadge = "LIMITED TIME OFFER",
  bannerImage = "",
  slug = "ad-offer",
  ctaText = "Book Now",
}: AdLandingHeroProps) {
  return (
    <section className="relative bg-slate-900 text-white overflow-hidden flex items-center pt-16 pb-8 lg:pt-20 lg:pb-10 min-h-[500px] lg:min-h-[560px]">
      
      {/* 100% Natural Background Image */}
      <div className="absolute inset-0 z-0">
        <FallbackImage
          src={bannerImage}
          alt={title}
          className="w-full h-full object-cover object-center opacity-100"
          fallbackSrc="/logo-with-name.png"
          theme="dark"
          fill
          priority
        />
        {/* Soft Organic Gradient Mask ONLY under left text content (Fades to 0% transparent over image) */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-[50%] bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Subheading & CTAs */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
            
            {/* Offer Pill */}
            {discountBadge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/60 border border-white/20 backdrop-blur-md text-amber-300 text-xs font-extrabold uppercase tracking-widest shadow-md">
                <Sparkles size={13} className="text-amber-400" />
                <span>{discountBadge}</span>
              </div>
            )}

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight max-w-2xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-slate-100 text-sm sm:text-base font-medium leading-relaxed max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  document.getElementById("lead-form-hero")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
              >
                <span>{ctaText || "Book Now"}</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById("lead-form-hero")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-2.5 sm:py-3 bg-white/95 hover:bg-white text-slate-900 font-extrabold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm cursor-pointer"
              >
                Plan My Trip
              </button>
            </div>

            {/* Trust Rating Footer */}
            <div className="flex items-center gap-2 text-xs text-slate-100 font-bold pt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-0.5 text-amber-400">
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
              </div>
              <span className="font-bold text-white">4.9/5 Traveller Rating</span>
            </div>

          </div>

          {/* Right Column: Unified Tour Booking Form Card */}
          <div className="lg:col-span-5" id="lead-form-hero">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 lg:p-6 shadow-2xl border border-white/20 text-slate-900 relative">
              <div className="absolute -top-2.5 right-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                Fast Response Guaranteed
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Request a <span className="text-orange-600">QUOTE</span>
              </h2>
              <p className="text-slate-500 text-xs mt-0.5 mb-3">
                Fill details below & receive instant customized itinerary on WhatsApp
              </p>

              <TourBookingForm embedded hideHeader />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
