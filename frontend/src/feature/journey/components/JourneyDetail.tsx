"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  BadgeCheck,
  ShieldCheck,
  CalendarDays,
  ArrowRight,
  ChevronDown,
  Star,
  Route,
  MessageCircle,
  Phone,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useJourneyBySlug } from "@/feature/journey/api/useJourney";
import type { Journey } from "@/feature/journey/type";
import { groupMonthsBySeason } from "@/components/shared/seasonUtils";
import PageLoader from "@/components/shared/PageLoader";
import TourBookingForm from "@/feature/leads/components/TourBookingForm";
import { travelExperienceIcon } from "@/components/shared/TravelExperiencePills";
import RichContent from "@/components/shared/RichContent";
import { cn, stripHtml } from "@/lib/utils";

const JourneyLightbox = dynamic(() => import("./JourneyLightbox"), { ssr: false });

export default function JourneyDetail({ slug, initialJourney }: { slug: string; initialJourney?: Journey | null }) {
  const { journey, isLoading } = useJourneyBySlug(slug, initialJourney);
  const [openDay, setOpenDay] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const WHATSAPP_NUMBER =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919136739178";
  const SALES_PHONE = process.env.NEXT_PUBLIC_SALES_PHONE || "+918447273005";

  if (isLoading) return <PageLoader size="page" />;
  if (!journey) return notFound();

  const countrySlug = journey.cities?.[0]?.state?.country?.slug;
  const countryTitle = journey.cities?.[0]?.state?.country?.title;
  const stateSlug = journey.cities?.[0]?.state?.slug;
  const stateTitle = journey.cities?.[0]?.state?.title;

  const heroImages = journey.banner?.images?.length
    ? journey.banner.images
    : journey.thumbImg
      ? [journey.thumbImg]
      : [];

  const lightboxSlides = heroImages.map((src) => ({ src, alt: journey.title }));

  const pageH1 = journey.h1Title;
  const durationText =
    journey.duration || (journey.noDays > 0 ? `${journey.noDays} Days` : "");

  return (
    <div>
      {/* ===== BREADCRUMB ===== */}
      <nav aria-label="Breadcrumb" className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 py-2.5 flex flex-wrap items-center gap-1.5 text-[14px] text-slate-500">
          <Link href="/" className="hover:text-[#2E8B8B] transition-colors">
            Home
          </Link>
          {countrySlug && countryTitle && (
            <>
              <ChevronRight size={14} className="text-slate-300" />
              <Link
                href={`/${countrySlug}`}
                className="hover:text-[#2E8B8B] transition-colors"
              >
                {countryTitle.replace(/\s*Tour$/i, "")}
              </Link>
            </>
          )}
          <ChevronRight size={14} className="text-slate-300" />
          {countrySlug ? (
            <Link
              href={`/${countrySlug}/tour-packages`}
              className="hover:text-[#2E8B8B] transition-colors"
            >
              Tour Packages
            </Link>
          ) : (
            <span>Tour Packages</span>
          )}
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-[#1C1C1C] font-semibold">{journey.title}</span>
        </div>
      </nav>

      {/* ===== HERO + HEADING ===== */}
      <div className="bg-white relative overflow-hidden border-b border-slate-100">
        {/* Taj Mahal + Dance + Mandala pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='%23D4561A' stroke-width='0.8'%3E%3Crect x='0' y='0' width='200' height='200' fill='none'/%3E%3Cpath d='M90 60 L100 20 L110 60 M85 62 L80 75 L120 75 L115 62 M75 75 L75 90 L125 90 L125 75 M100 20 L100 14 M96 38 L100 25 L104 38 M80 90 L80 120 L120 120 L120 90 M85 120 L85 125 L115 125 L115 120 M100 90 L100 120'/%3E%3Ccircle cx='100' cy='72' r='4'/%3E%3Cpath d='M60 155 Q60 145 65 140 Q60 135 55 140 Q60 145 60 155 M52 160 L60 155 L68 160 M50 168 L52 160 L48 170 M68 160 L72 168 L64 170 M55 140 L48 135 M65 140 L72 135 M55 150 L52 155 M65 150 L68 155 M60 155 L60 168 M55 168 L65 168'/%3E%3Ccircle cx='60' cy='135' r='5'/%3E%3Ccircle cx='40' cy='40' r='15'/%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3Ccircle cx='40' cy='40' r='5'/%3E%3Cpath d='M40 25 L40 15 M40 55 L40 65 M25 40 L15 40 M55 40 L65 40'/%3E%3Ccircle cx='160' cy='160' r='12'/%3E%3Ccircle cx='160' cy='160' r='7'/%3E%3Ccircle cx='160' cy='160' r='3'/%3E%3Cpath d='M160 148 L160 140 M160 172 L160 180 M148 160 L140 160 M172 160 L180 160'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 py-8 md:py-12 relative z-10">
        
        {/* Header Info Block */}
        <div className="mb-8">

          {pageH1 && (
            <h1 className="font-heading text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-[#1C1C1C] mb-4 leading-[1.3]">
              {durationText && (
                <span className="text-[#2E8B8B]">{durationText}</span>
              )}
              {durationText && (
                <span className="mx-2 text-slate-300">-</span>
              )}
              {pageH1}
            </h1>
          )}
          {journey.destination && (
            <p className="flex items-center gap-2 text-base font-semibold text-[#555] mb-4">
              <Route size={18} className="text-[#2E8B8B]" />
              <span className="text-[#2E8B8B] font-bold">Journey Route:</span>
              <span>
                {(journey.route && journey.route.length > 0
                  ? journey.route.map((c) => c.title)
                  : journey.destination.split("-")
                ).join(" - ")}
              </span>
            </p>
          )}

        </div>

        {/* LEFT: BANNER | RIGHT: BOOKING CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] lg:items-stretch items-start gap-8 lg:gap-10">
        <section className="h-full">
          {heroImages.length > 0 ? (
            <div className="flex flex-col h-full">
              <div 
                className={cn(
                  "grid gap-3 md:gap-4 lg:h-full w-full",
                  heroImages.length === 1 ? "grid-cols-1 grid-rows-1 md:h-[440px]" :
                  heroImages.length === 2 ? "grid-cols-1 grid-rows-2 h-[350px] md:h-[440px]" :
                  "grid-cols-2 grid-rows-2 h-[350px] md:h-[440px]" // 3 or 4+ images
                )}
              >
                {/* Image 1 */}
                <button
                  type="button"
                  onClick={() => openLightbox(0)}
                  className={cn(
                    "w-full h-full rounded-[16px] md:rounded-3xl overflow-hidden cursor-pointer group relative block p-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
                    heroImages.length === 3 ? "col-span-1 row-span-2" : "col-span-1 row-span-1"
                  )}
                >
                  <img
                    src={heroImages[0]}
                    alt={journey.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </button>

                {/* Image 2 */}
                {heroImages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => openLightbox(1)}
                    className="w-full h-full rounded-[16px] md:rounded-3xl overflow-hidden cursor-pointer group relative block p-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] col-span-1 row-span-1"
                  >
                    <img
                      src={heroImages[1]}
                      alt={journey.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </button>
                )}
                
                {/* Image 3 */}
                {heroImages.length > 2 && (
                  <button
                    type="button"
                    onClick={() => openLightbox(2)}
                    className="w-full h-full rounded-[16px] md:rounded-3xl overflow-hidden cursor-pointer group relative block p-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] col-span-1 row-span-1"
                  >
                    <img
                      src={heroImages[2]}
                      alt={journey.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </button>
                )}

                {/* Image 4 */}
                {heroImages.length > 3 && (
                  <button
                    type="button"
                    onClick={() => openLightbox(3)}
                    className="w-full h-full rounded-[16px] md:rounded-3xl overflow-hidden cursor-pointer group relative block p-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] col-span-1 row-span-1"
                  >
                    <img
                      src={heroImages[3]}
                      alt={journey.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    {/* +More Photos overlay for 4+ images */}
                    {heroImages.length > 4 && (
                      <div className="absolute inset-0 bg-[#1C1C1C]/20 flex items-center justify-center transition-colors group-hover:bg-[#1C1C1C]/30">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            openLightbox(4);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur-md text-[#1C1C1C] text-[12px] md:text-[13px] font-extrabold shadow-xl hover:bg-white transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          +{heroImages.length - 4} Photos
                        </span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[320px] md:h-[420px] bg-[#1C1C1C] rounded-3xl" />
          )}
        </section>

        {/* RIGHT: DETAILS */}
        <aside className="h-full">
          <div className="rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
              <Sparkles className="w-32 h-32 rotate-12" />
            </div>
            
            <div className="p-7 lg:p-8 flex-1">
              {/* 1. Price */}
              {(journey.pricePerPerson ?? 0) > 0 && (
                <>
                  <div className="relative z-10">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2E8B8B] mb-2">Starting Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-[#D4561A]">
                        ₹{(journey.pricePerPerson ?? 0).toLocaleString()}
                      </span>
                      {(journey.discountPrice ?? 0) > 0 && (
                        <span className="text-lg font-medium text-slate-400 line-through">
                          ₹{(journey.discountPrice ?? 0).toLocaleString()}
                        </span>
                      )}
                      <span className="text-sm font-medium text-slate-500 ml-1">/ person</span>
                    </div>
                  </div>
                  <hr className="my-7 border-slate-100" />
                </>
              )}

              {/* 2. Quick Facts */}
              <div className="mb-7 relative z-10">
                <h3 className="text-[18px] font-extrabold text-[#1C1C1C] mb-5 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#D4561A]" />
                  Quick Facts
                </h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2.5 text-[17px] text-slate-700 font-semibold">
                      <Clock size={20} className="text-[#2E8B8B]" />
                      Duration
                    </span>
                    <span className="text-[18px] font-bold text-[#1C1C1C] text-right">
                      {journey.duration || (journey.noDays > 0 ? `${journey.noDays} Days` : "—")}
                    </span>
                  </div>
                  {(journey.months?.length ?? 0) > 0 && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2.5 text-[17px] text-slate-700 font-semibold">
                        <CalendarDays size={20} className="text-[#2E8B8B]" />
                        Best Months
                      </span>
                      <span className="text-[18px] font-bold text-[#1C1C1C] text-right">
                        {groupMonthsBySeason(journey.months!).map((g) => `${g.label} (${g.range})`).join(", ")}
                      </span>
                    </div>
                  )}
                  

                </div>
              </div>

              {/* 3. Travel Experience */}
              {(journey.travelExperiences?.length ?? 0) > 0 && (
                <div className="relative z-10">
                  <h3 className="text-[18px] font-extrabold text-[#1C1C1C] mb-5 flex items-center gap-2">
                    <Star size={18} className="text-[#F5B041]" />
                    Travel Experience
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {journey.travelExperiences!.map((e) => (
                      <span key={e.id} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-50 text-[#555] text-[14px] font-semibold border border-slate-200">
                        <span className="text-[#2E8B8B]">{travelExperienceIcon(e.title)}</span>
                        {e.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Booking Buttons at the Bottom */}
            <div className="p-7 lg:p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-3.5 relative z-10">
              {!(journey.pricePerPerson ?? 0) && (
                <div className="mb-2">
                  <h3 className="text-[18px] font-extrabold text-[#1C1C1C] mb-2 leading-[1.3]">Interested in this tour?</h3>
                  <p className="text-[14.5px] text-slate-500 leading-relaxed font-medium">
                    Get in touch with our travel experts to get a customized itinerary and the best quote for your trip.
                  </p>
                </div>
              )}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hi! I'm interested in "${journey.title}". Please share the best price and availability.\n\nTour Page: ${pageUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#D4561A] to-[#ed6b2e] hover:to-[#f07b43] text-white text-[15px] font-bold shadow-lg shadow-[#D4561A]/30 transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle size={18} /> Get Best Price
              </a>
              <a
                href={`tel:${SALES_PHONE}`}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-slate-100 text-[#1C1C1C] text-[15px] font-bold transition-colors border border-slate-200 hover:border-slate-300 shadow-sm"
              >
                <Phone size={18} /> Call Salesperson
              </a>
            </div>
          </div>
        </aside>
        </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[9fr_5fr] gap-8">
        {/* ===== MAIN ===== */}
        <div className="space-y-12">
          {journey.highlights && journey.highlights.length > 0 && (
            <section>
              <span className="accent-label">Highlights</span>
              <h2 className="h3 text-[#1C1C1C] mt-3 mb-6">Key Experiences</h2>
              <div className="bg-[#2E8B8B]/5 rounded-3xl p-7 md:p-9 border border-[#2E8B8B]/10">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
                  {journey.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3.5 text-base font-medium text-[#1C1C1C] leading-[1.6]">
                      <BadgeCheck size={22} className="shrink-0 mt-0.5 text-[#2E8B8B]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {journey.overView && (
            <section>
              <span className="accent-label">Overview</span>
              <h2 className="h3 text-[#1C1C1C] mt-3 mb-6">About This Tour</h2>
              <div className="bg-white rounded-3xl p-7 md:p-9 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-base text-slate-600 leading-[1.8]">
                <RichContent html={journey.overView} />
              </div>
            </section>
          )}

          {journey.days && journey.days.length > 0 && (
            <section>
              <div>
                <span className="accent-label">Itinerary</span>
                <h2 className="h3 text-[#1C1C1C] mt-2 mb-8">Day-by-Day Itinerary</h2>
              </div>
              <div className="relative bg-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                {journey.days.map((day, i) => (
                  <DayItem
                    key={day.id}
                    index={i + 1}
                    day={day}
                  />
                ))}
              </div>
            </section>
          )}

          {(journey.inclusions?.length ?? 0) > 0 || (journey.exclusions?.length ?? 0) > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:gap-8">
              {(journey.inclusions?.length ?? 0) > 0 && (
                <div className="bg-emerald-50/40 border border-emerald-100 rounded-3xl p-7 md:p-9 shadow-[0_8px_30px_rgb(16,185,129,0.04)]">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-emerald-700 mb-6 flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-emerald-500" /> What's Included
                  </h3>
                  <ul className="space-y-4">
                    {(journey.inclusions ?? []).map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-[15.5px] font-bold text-emerald-950 leading-relaxed">
                        <CheckCircle2 size={20} className="text-emerald-500 mt-[2px] shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(journey.exclusions?.length ?? 0) > 0 && (
                <div className="bg-red-50/40 border border-red-100 rounded-3xl p-7 md:p-9 shadow-[0_8px_30px_rgb(239,68,68,0.04)]">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-red-700 mb-6 flex items-center gap-2.5">
                    <XCircle size={18} className="text-red-500" /> What's Excluded
                  </h3>
                  <ul className="space-y-4">
                    {(journey.exclusions ?? []).map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-[15.5px] font-medium text-red-950 leading-relaxed">
                        <XCircle size={20} className="text-red-500 mt-[2px] shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {(journey.whyChooseUs?.length ?? 0) > 0 && (
            <section>
              <span className="accent-label">Why Choose Us</span>
              <h2 className="h3 text-[#1C1C1C] mt-2 mb-6">Why Book With Us</h2>
              <div className="relative rounded-3xl bg-gradient-to-br from-white via-[#F8FAFA] to-[#EBF3F3] p-8 md:p-10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#2E8B8B]/10">
                {/* Background Watermark Icon */}
                <div className="absolute -top-8 -right-4 opacity-[0.05] pointer-events-none rotate-12">
                  <ShieldCheck className="w-56 h-56 md:w-64 md:h-64 text-[#2E8B8B]" />
                </div>
                {/* Subtle Glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#2E8B8B]/10 blur-[80px] rounded-full pointer-events-none" />

                <ul className="relative z-10 space-y-5 md:space-y-6">
                  {(journey.whyChooseUs ?? []).map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-[15.5px] md:text-base font-semibold text-slate-700 leading-[1.7]">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 border border-slate-100 shadow-sm">
                        <ShieldCheck size={18} className="text-[#2E8B8B]" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {(journey.faqs?.length ?? 0) > 0 && (
            <section>
              <span className="accent-label">FAQs</span>
              <h2 className="h3 text-[#1C1C1C] mt-2 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {(journey.faqs ?? []).map((f) => (
                  <FaqItem key={f.id} q={f.ques} a={f.ans} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ===== SIDEBAR ===== */}
        <aside className="space-y-8 lg:sticky lg:top-24 self-start">
          <div className="rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white border border-slate-100 overflow-hidden">
            <TourBookingForm embedded />
          </div>
          
          {(journey.bookingPolicyList?.length ?? 0) > 0 && (
            <div className="rounded-3xl bg-slate-50 border border-slate-100 p-7">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2E8B8B] mb-5 flex items-center gap-2">
                <Sparkles size={16} className="text-[#D4561A]" />
                Booking Policy
              </h4>
              <ul className="space-y-3.5">
                {(journey.bookingPolicyList ?? []).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] font-medium text-slate-600 leading-relaxed">
                    <BadgeCheck size={18} className="shrink-0 mt-[2px] text-[#2E8B8B]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {stateSlug && stateTitle && (
            <div className="rounded-2xl bg-[#1C1C1C] text-white p-6 text-center">
              <Star size={20} className="mx-auto text-[#F5B041] mb-2" />
              <p className="text-sm text-white/85">
                Discover more tours from <span className="font-bold">{stateTitle}</span>
              </p>
              <Link
                href={`/${countrySlug}/${stateSlug}`}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1C1C1C] text-sm font-semibold hover:bg-[#2E8B8B] hover:text-white transition-colors"
              >
                View All Tours <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </aside>
      </div>

      {/* ===== KNOW MORE (RAJASTHAN-STYLE FULL SECTION) ===== */}
      {(journey.seoDescription || journey.moreDescription) && (
        <section id="know-more" className="bg-[#f8f8f8] border-y border-slate-200/60 py-16 md:py-20">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
            <div className="max-w-5xl">
              <span className="accent-label">Know More</span>
              <h2 className="h3 text-[#1C1C1C] mt-2 mb-8">Everything About {journey.title}</h2>

              {journey.seoDescription && (
                <RichContent html={journey.seoDescription} />
              )}

              {journey.moreDescription && (
                <RichContent html={journey.moreDescription} className="mt-8" />
              )}
            </div>
          </div>
        </section>
      )}

      {lightboxOpen && (
        <JourneyLightbox
          open={lightboxOpen}
          index={lightboxIndex}
          close={() => setLightboxOpen(false)}
          slides={lightboxSlides}
        />
      )}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("rounded-2xl border transition-all duration-300 overflow-hidden", open ? "border-[#2E8B8B]/20 shadow-md bg-white" : "border-slate-100 bg-white hover:border-slate-200")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
      >
        <span className={cn("text-[15.5px] font-bold transition-colors", open ? "text-[#2E8B8B]" : "text-[#1C1C1C]")}>{stripHtml(q)}</span>
        <span className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300", open ? "bg-[#2E8B8B] text-white rotate-180" : "bg-slate-100 text-slate-500")}>
          <ChevronDown size={16} />
        </span>
      </button>
      <div className={cn("px-6 pb-6 text-[15.5px] text-slate-600 leading-relaxed", !open && "hidden")}>
        <RichContent html={a} />
      </div>
    </div>
  );
}

function DayItem({
  index,
  day,
}: {
  index: number;
  day: { id: number; day: string; description?: string; image?: string };
}) {
  const [open, setOpen] = useState(index === 1);

  return (
    <div className="relative pl-8 md:pl-12 py-4 md:py-5 first:pt-0 last:pb-0 group">
      {/* Timeline Line */}
      <div className="absolute left-[11px] md:left-[15px] top-0 bottom-0 w-[2px] bg-slate-200 group-last:bottom-auto group-last:h-full" />
      
      {/* Timeline Dot */}
      <div className="absolute left-0 md:left-0 top-3 md:top-4 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-[3px] border-[#2E8B8B] flex items-center justify-center shadow-sm z-10 transition-colors duration-300 group-hover:border-[#D4561A]">
        <span className="text-[10px] md:text-xs font-black text-[#2E8B8B] transition-colors duration-300 group-hover:text-[#D4561A]">{index}</span>
      </div>

      <div className="w-full">
        <button 
          type="button" 
          onClick={() => setOpen(!open)}
          className={cn("w-full flex items-center justify-between gap-4 pb-3 border-b text-left cursor-pointer group/btn", open ? "border-slate-100" : "border-slate-100/50")}
        >
          <h3 className="font-heading text-lg md:text-xl font-bold text-[#1C1C1C] transition-colors duration-300 group-hover/btn:text-[#D4561A]">
            <span className={cn("mr-2 transition-colors duration-300", open ? "text-[#D4561A]" : "text-[#2E8B8B] group-hover/btn:text-[#D4561A]")}>Day {index}:</span>
            {day.day}
          </h3>
          <span className={cn("w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300", open ? "text-[#D4561A] rotate-180" : "text-slate-400 group-hover/btn:text-[#D4561A]")}>
            <ChevronDown size={20} />
          </span>
        </button>
        
        {/* SEO Friendly Accordion Content using CSS Grid */}
        <div 
          className={cn(
             "grid transition-all duration-300",
             open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="pt-3 pb-4 md:pb-5">
              {day.description && (
                <div className="text-[15px] text-slate-600 leading-[1.8]">
                  <RichContent html={day.description} />
                </div>
              )}
              {day.image && (
                <img src={day.image} alt={day.day} className="mt-4 rounded-2xl w-full h-[200px] md:h-[280px] object-cover shadow-sm" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
