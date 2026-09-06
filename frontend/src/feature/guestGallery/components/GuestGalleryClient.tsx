"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles, MapPin } from "lucide-react";
import type { GuestGallery } from "../type";

interface GuestGalleryClientProps {
  initialItems: GuestGallery[];
}

export default function GuestGalleryClient({ initialItems }: GuestGalleryClientProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const activePhoto = activePhotoIndex !== null ? initialItems[activePhotoIndex] : null;

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex(activePhotoIndex === 0 ? initialItems.length - 1 : activePhotoIndex - 1);
    }
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex(activePhotoIndex === initialItems.length - 1 ? 0 : activePhotoIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header with Teal Green Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4">
        <div className="space-y-1">
          <span className="text-lg sm:text-xl md:text-2xl font-extrabold uppercase tracking-wide text-[#2E8B8B] block">
            Real Guest Moments
          </span>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore authentic travel moments, family vacations, and scenic road trips shared by our happy guests across India.
          </p>
        </div>

        {initialItems.length > 0 && (
          <div className="shrink-0 self-start sm:self-end bg-white px-4 py-2 rounded-full text-xs font-semibold text-slate-600 border border-slate-200/90 shadow-2xs">
            Showing <span className="font-bold text-slate-900">{initialItems.length}</span> of{" "}
            <span className="font-bold text-slate-900">{initialItems.length}</span> photos
          </div>
        )}
      </div>

      {/* 4-Column Photo Grid with Smooth Rounded Corners */}
      {initialItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {initialItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setActivePhotoIndex(index)}
              className="group relative bg-white rounded-[22px] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200/70"
            >
              <div className="aspect-4/3 overflow-hidden bg-slate-100 relative">
                <img
                  src={item.imageUrl}
                  alt={item.caption || item.location || `Guest Photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Subtle Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                  {item.location && (
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 uppercase tracking-wider mb-0.5">
                      <MapPin size={12} />
                      <span>{item.location}</span>
                    </div>
                  )}
                  <p className="text-xs font-medium text-slate-200 line-clamp-1">
                    {item.caption || `Guest Photo ${index + 1}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-[24px] border border-slate-200 p-8 shadow-xs">
          <Sparkles className="w-10 h-10 text-[#2E8B8B] mx-auto mb-3 opacity-60" />
          <h3 className="text-xl font-bold text-slate-800">No Guest Photos Found</h3>
          <p className="text-slate-500 mt-1 text-sm">
            Check back later for new guest travel moments.
          </p>
        </div>
      )}

      {/* Lightbox Fullscreen Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhotoIndex(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 sm:p-8 select-none"
        >
          {/* Close button */}
          <button
            onClick={() => setActivePhotoIndex(null)}
            className="fixed top-6 right-6 sm:top-8 sm:right-8 text-white/70 hover:text-white p-2 transition-colors cursor-pointer z-50"
            aria-label="Close"
          >
            <X size={32} />
          </button>

          {/* Left Arrow Button */}
          {initialItems.length > 1 && (
            <button
              onClick={handlePrevPhoto}
              className="fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 transition-colors cursor-pointer z-50"
              aria-label="Previous"
            >
              <ChevronLeft size={38} />
            </button>
          )}

          {/* Right Arrow Button */}
          {initialItems.length > 1 && (
            <button
              onClick={handleNextPhoto}
              className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 transition-colors cursor-pointer z-50"
              aria-label="Next"
            >
              <ChevronRight size={38} />
            </button>
          )}

          {/* Centered Image with rounded corners & bottom caption text */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center max-w-5xl max-h-[85vh] w-full px-4"
          >
            <img
              src={activePhoto.imageUrl}
              alt={activePhoto.caption || activePhoto.location || `Guest Photo ${activePhotoIndex! + 1}`}
              className="max-h-[76vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
            />
            {/* Caption text below image */}
            <div className="mt-4 text-center">
              <p className="text-white/90 text-sm sm:text-base font-medium tracking-wide">
                {activePhoto.caption || activePhoto.location || `Guest Photo ${activePhotoIndex! + 1}`}
              </p>
              {activePhoto.location && activePhoto.caption && (
                <p className="text-amber-400 text-xs font-semibold mt-1 uppercase tracking-wider flex items-center justify-center gap-1">
                  <MapPin size={12} /> {activePhoto.location}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
