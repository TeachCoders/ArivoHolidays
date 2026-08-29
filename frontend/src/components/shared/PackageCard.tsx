"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, CheckCircle, ArrowRight, Star } from "lucide-react";
import { travelExperienceIcon } from "@/components/shared/TravelExperiencePills";

export interface PackageCardItem {
  title: string;
  destination?: string;
  duration?: string;
  image?: string;
  highlights?: string[];
  tags?: string[];
  href: string;
  price?: number;
  isBestSelling?: boolean;
}

export default function PackageCard({ item }: { item: PackageCardItem }) {
  const {
    title,
    destination,
    duration,
    image,
    highlights = [],
    tags = [],
    href,
    price = 0,
    isBestSelling,
  } = item;

  return (
    <Link
      href={href}
      className="group rounded-xl bg-white border border-brand-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
    >
      <div className="relative w-full h-52 overflow-hidden bg-brand-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-teal to-brand-navy" />
        )}

        {duration && (
          <div className="absolute top-3 left-3 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 bg-brand-navy/80 backdrop-blur-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>{duration}</span>
          </div>
        )}

        {isBestSelling && !price && (
          <span className="absolute top-3 right-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 bg-brand-navy">
            <Star size={10} fill="currentColor" /> BEST SELLING
          </span>
        )}

        {price > 0 && (
          <span className="absolute top-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-full bg-brand-gold">
            ₹{price.toLocaleString()}
          </span>
        )}

        {tags.length > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 flex-wrap justify-end">
            {tags.slice(0, 5).map((tag, i) => (
              <span
                key={i}
                className="font-semibold px-1.5 py-0.5 rounded-full bg-brand-teal text-white flex items-center gap-0.5 text-[13px]"
              >
                {travelExperienceIcon(tag)}
                {tag}
              </span>
            ))}
            {tags.length > 5 && (
              <span className="font-semibold px-1.5 py-0.5 rounded-full bg-brand-teal/80 text-white text-[13px]">
                +{tags.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-brand-navy line-clamp-2 leading-snug group-hover:text-brand-500 transition-colors">
          {title}
        </h3>

        {destination && (
          <div className="flex items-center gap-1.5 text-xs font-medium mt-1.5 mb-1 text-brand-500">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{destination}</span>
          </div>
        )}

        {highlights.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <span className="text-xs font-bold text-brand-300">Highlights</span>
            <div className="grid grid-cols-1 gap-1">
              {highlights.slice(0, 3).map((hl, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-brand-500">
                  <CheckCircle className="w-4 h-4 shrink-0 text-brand-gold" />
                  <span className="truncate">{hl}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 mt-auto pt-4">
          <span className="btn-outline w-fit text-sm font-medium rounded-lg py-2 px-5 flex items-center justify-center gap-2">
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
