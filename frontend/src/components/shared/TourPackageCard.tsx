"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import type { Journey } from "@/feature/journey/type";
import { journeyPackageHref } from "@/feature/journey/filterOptions";
import { travelExperienceIcon } from "@/components/shared/TravelExperiencePills";

export default function TourPackageCard({ journey, contextName }: { journey: Journey, contextName?: string }) {
  const price = journey.discountPrice ?? journey.pricePerPerson ?? 0;
  const hasDiscount = journey.discountPrice && journey.discountPrice > price;
  const offPercent = hasDiscount
    ? Math.round(((journey.discountPrice! - price) / journey.discountPrice!) * 100)
    : 0;
  const state = journey.cities?.[0]?.state?.title;
  const href = journeyPackageHref(journey);

  return (
    <div
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 ease-out h-full"
    >
      {/* Image Container */}
      <Link href={href} className="relative h-[240px] w-full overflow-hidden shrink-0 block">
        {journey.thumbImg || journey.banner?.images?.[0] ? (
          <Image
            src={journey.thumbImg || journey.banner?.images?.[0] || ""}
            alt={journey.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center relative">
            <Image src="/logo.png" alt="Arivo Holidays" width={96} height={96} className="opacity-20 object-contain grayscale" style={{ width: "auto", height: "auto" }} />
          </div>
        )}

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-2 items-start pointer-events-auto">
            {journey.isBestSelling && (
              <span className="inline-flex items-center gap-1.5 bg-amber-400 text-[#1C1C1C] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                <Star size={11} fill="currentColor" className="text-[#1C1C1C]" /> Best Seller
              </span>
            )}
          </div>
          {hasDiscount && offPercent > 0 && (
            <span className="bg-[#D4561A] text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg pointer-events-auto">
              {offPercent}% OFF
            </span>
          )}
        </div>

        {/* Dynamic Context Icon (Top Right) */}
        {contextName && (
          <div
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white shadow-lg pointer-events-none"
            title={contextName}
          >
            {travelExperienceIcon(contextName, "w-[18px] h-[18px]")}
          </div>
        )}

        {/* Bottom Image Info */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          {journey.noDays > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-black/30 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
              <Clock size={14} className="opacity-90" />
              {journey.noDays === 1 ? "1 Day" : `${journey.noDays - 1}N / ${journey.noDays}D`}
            </span>
          )}
        </div>
      </Link>

      {/* Content Container */}
      <div className="p-6 flex flex-col flex-1 bg-white relative z-10">
        <Link href={href} className="inline-block mb-3">
          <h3 className="text-[17px] font-bold text-[#1C1C1C] line-clamp-2 leading-snug group-hover:text-[#2E8B8B] transition-colors">
            {journey.h1Title}
          </h3>
        </Link>

        {/* Route / Destination */}
        {(journey.destination || state) && (
          <div className="flex items-start gap-1.5 mb-4 text-[13.5px] text-[#555] font-medium">
            <MapPin size={16} className="shrink-0 text-[#2E8B8B] mt-[1px]" />
            <span className="line-clamp-2 leading-snug">{journey.destination || state}</span>
          </div>
        )}

        {/* Experience Pills */}
        {(journey.travelExperiences?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {journey.travelExperiences!.slice(0, 3).map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#2E8B8B] bg-[#2E8B8B]/10 border border-[#2E8B8B]/20 px-2.5 py-1 rounded-full"
              >
                {travelExperienceIcon(t.title)}
                {t.title}
              </span>
            ))}
          </div>
        )}

        {/* Highlights List */}
        {(journey.highlights?.length ?? 0) > 0 && (
          <div className="space-y-2.5 mb-6">
            {journey.highlights!.slice(0, 3).map((hl, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600 font-medium">
                <CheckCircle2 size={16} className="shrink-0 text-[#2E8B8B]/80 mt-[2px]" />
                <span className="line-clamp-1">{hl}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pricing & CTA */}
        <div className="mt-auto pt-5 border-t border-slate-100 flex items-end justify-between gap-4">
          <Link href={href} className="min-w-0 flex-1">
            {hasDiscount && journey.discountPrice! > price && (
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs text-slate-400 line-through font-medium">
                  ₹{journey.discountPrice!.toLocaleString()}
                </p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Save ₹{(journey.discountPrice! - price).toLocaleString()}
                </span>
              </div>
            )}
            {price > 0 && (
              <p className="flex items-baseline gap-1 text-xl font-black text-[#1C1C1C] leading-none">
                ₹{price.toLocaleString()}
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">/ pp</span>
              </p>
            )}
            {(journey.purchaseCount || 0) > 0 && (
              <p className="text-[11px] text-[#888] mt-1.5">{journey.purchaseCount} booked</p>
            )}
          </Link>

          <Link href={href} className="shrink-0 flex items-center gap-2.5 group/btn">
            <span className="text-[13px] font-bold text-[#D4561A]">
              View Details
            </span>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 group-hover/btn:bg-[#D4561A] group-hover/btn:border-[#D4561A] group-hover/btn:shadow-md transition-all duration-300">
              <ArrowRight size={16} className="text-[#D4561A] group-hover/btn:text-white transition-all duration-300 group-hover/btn:-rotate-45" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
