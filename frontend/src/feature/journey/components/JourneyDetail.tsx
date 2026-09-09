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
  Snowflake,
  Sun,
  CloudRain,
  Moon,
  SunMoon,
  Timer,
} from "lucide-react";
import { useEffect, useState, Fragment } from "react";
import dynamic from "next/dynamic";
import { useJourneyBySlug } from "@/feature/journey/api/useJourney";
import type { Journey } from "@/feature/journey/type";
import { groupMonthsBySeason } from "@/components/shared/seasonUtils";
import PageLoader from "@/components/shared/PageLoader";
import TourBookingForm from "@/feature/leads/components/TourBookingForm";
import { travelExperienceIcon } from "@/components/shared/TravelExperiencePills";
import RichContent from "@/components/shared/RichContent";
import { QuoteModal } from "@/components/shared/QuoteModal";
import { cn, stripHtml } from "@/lib/utils";

const JourneyLightbox = dynamic(() => import("./JourneyLightbox"), { ssr: false });

export default function JourneyDetail({ slug, initialJourney }: { slug: string; initialJourney?: Journey | null }) {
  const { journey, isLoading } = useJourneyBySlug(slug, initialJourney);
  const [openDays, setOpenDays] = useState<number[]>([1]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const toggleAllDays = () => {
    if (journey?.days && openDays.length === journey.days.length) {
      setOpenDays([]);
    } else {
      setOpenDays(journey?.days?.map((_, i) => i + 1) || []);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const WHATSAPP_NUMBER =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919136739178";
  const SALES_PHONE = process.env.NEXT_PUBLIC_SALES_PHONE || "+919136739178";

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

  const pageH1 = journey.h1Title || journey.title;
  const durationText =
    journey.duration || (journey.noDays > 0 ? `${journey.noDays} Days` : "");
  const cleanJourneyTitle = (journey.title || "").split("|")[0].trim();

  const breadcrumbNavItems = [
    { label: "Home", href: "/" },
    { label: "Tour Packages", href: "/tour-packages" },
  ];

  if (countrySlug && countryTitle) {
    breadcrumbNavItems.push({
      label: countryTitle.replace(/\s*Tour$/i, ""),
      href: `/tour-packages/${countrySlug}`,
    });
  }

  if (stateSlug && stateTitle && countrySlug) {
    breadcrumbNavItems.push({
      label: stateTitle,
      href: `/tour-packages/${countrySlug}/${stateSlug}`,
    });
  }

  return (
    <div className="pb-20 lg:pb-0">
      {/* ===== BREADCRUMB ===== */}
      <nav aria-label="Breadcrumb" className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 py-2.5 flex flex-wrap items-center gap-1.5 text-[14px] text-slate-500">
          {breadcrumbNavItems.map((item, idx) => (
            <Fragment key={idx}>
              {idx > 0 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
              <Link href={item.href} className="hover:text-[#2E8B8B] transition-colors shrink-0">
                {item.label}
              </Link>
            </Fragment>
          ))}
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
          <span className="text-[#1C1C1C] font-semibold truncate max-w-[320px] md:max-w-none">
            {cleanJourneyTitle}
          </span>
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
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#2E8B8B] bg-teal-50/80 border border-teal-200/80 px-3 py-1 rounded-xl shrink-0">
                  <Route size={15} className="text-[#2E8B8B]" />
                  <span>Journey Route:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(journey.route && journey.route.length > 0
                    ? journey.route.map((c) => c.title)
                    : journey.destination.split("-").map((s) => s.trim())
                  ).map((city, idx, arr) => (
                    <Fragment key={idx}>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100/90 text-slate-800 text-[13px] font-bold border border-slate-200/70 shadow-2xs">
                        {city}
                      </span>
                      {idx < arr.length - 1 && (
                        <ChevronRight size={14} className="text-slate-400 shrink-0" />
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>
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

                  {/* 2. Quick Facts / Trip Overview */}
                  <div className="mb-6 relative z-10 space-y-5">
                    <h3 className="text-[17px] font-extrabold text-[#1C1C1C] flex items-center gap-2">
                      <Sparkles size={18} className="text-[#D4561A]" />
                      Trip Overview
                    </h3>

                    <div className="space-y-4">
                      {/* Duration */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-2 text-[14.5px] text-slate-600 font-semibold">
                          <SunMoon size={16} className="text-[#2E8B8B]" />
                          Duration
                        </span>
                        <span className="text-[15.5px] font-extrabold text-[#1C1C1C]">
                          {journey.duration ||
                            (journey.noDays > 0
                              ? `${journey.noDays > 1 ? `${journey.noDays - 1} Nights / ` : ""}${journey.noDays} Days`
                              : "—")}
                        </span>
                      </div>

                      {/* Best Season to Visit */}
                      {(journey.months?.length ?? 0) > 0 && (
                        <div className="pt-4 border-t border-slate-100/80 flex flex-col gap-2.5">
                          <h4 className="text-[14.5px] font-bold text-[#1C1C1C] flex items-center gap-2">
                            <CalendarDays size={16} className="text-[#2E8B8B]" />
                            Best Season to Visit
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {groupMonthsBySeason(journey.months!).map((g) => {
                              const rangeText = formatSeasonRange(g);
                              return (
                                <div
                                  key={g.season}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12.5px] font-bold border transition-all shadow-2xs",
                                    getSeasonStyles(g.season)
                                  )}
                                >
                                  {getSeasonIcon(g.season)}
                                  <div className="flex items-center gap-1">
                                    <span>{g.label}</span>
                                    {rangeText && (
                                      <span className="opacity-75 font-medium text-[10.5px]">({rangeText})</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Ideal For */}
                  {(journey.travelExperiences?.length ?? 0) > 0 && (
                    <div className="relative z-10 pt-4 border-t border-slate-100/80">
                      <h4 className="text-[14.5px] font-bold text-[#1C1C1C] mb-3 flex items-center gap-2">
                        <Star size={16} className="text-[#F5B041] fill-[#F5B041]" />
                        Ideal For
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {journey.travelExperiences!.map((e) => (
                          <span
                            key={e.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50/80 hover:bg-orange-50/60 text-slate-700 hover:text-[#D4561A] text-[12.5px] font-bold border border-slate-200/80 hover:border-orange-200 transition-all shadow-2xs"
                          >
                            <span className="text-[#2E8B8B] shrink-0">{travelExperienceIcon(e.title)}</span>
                            <span>{e.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Booking & WhatsApp Action Bar (High-Converting 2-Column Row) */}
                <div className="p-6 lg:p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-4 relative z-10">
                  {!(journey.pricePerPerson ?? 0) && (
                    <div>
                      <h3 className="text-[18px] font-extrabold text-[#1C1C1C] mb-1 leading-[1.3]">Interested in this tour?</h3>
                      <p className="text-[14px] text-slate-500 leading-relaxed font-medium">
                        Get in touch with our travel experts for a customized itinerary and instant best quote.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    {/* WhatsApp CTA Button */}
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `Hi! I'm interested in "${journey.title}". Please share the best price and availability.\n\nTour Page: ${pageUrl}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#2E8B8B] hover:bg-[#247070] active:scale-95 text-white text-[14.5px] font-bold shadow-md shadow-[#2E8B8B]/20 transition-all text-center"
                    >
                      <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.659-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                      </svg>
                      <span>Get Best Price</span>
                    </a>

                    {/* Booking / Request Quote CTA Button */}
                    <QuoteModal>
                      <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#D4561A] hover:bg-[#b84513] active:scale-95 text-white text-[14.5px] font-bold shadow-md shadow-[#D4561A]/20 transition-all text-center cursor-pointer"
                      >
                        <CalendarDays size={18} className="shrink-0" />
                        <span>Book Now</span>
                      </button>
                    </QuoteModal>
                  </div>

                  {/* Trust Badges Micro Row */}
                  <div className="pt-2 flex items-center justify-around text-center text-[11px] font-bold text-slate-500 border-t border-slate-200/60 mt-1">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Star size={12} className="text-[#F5B041] fill-[#F5B041]" />
                      4.9 (200+ Reviews)
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <ShieldCheck size={13} className="text-[#2E8B8B]" />
                      100% Customized
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock size={12} className="text-slate-400" />
                      &lt;15m Response
                    </span>
                  </div>
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
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                  <span className="accent-label">Itinerary</span>
                  <h2 className="h3 text-[#1C1C1C] mt-2">Day-by-Day Itinerary</h2>
                </div>
                <button
                  type="button"
                  onClick={toggleAllDays}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {openDays.length === journey.days.length ? "Collapse All" : "Expand All"}
                </button>
              </div>
              <div className="relative bg-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                {journey.days.map((day, i) => (
                  <DayItem
                    key={day.id}
                    index={i + 1}
                    day={day}
                    isOpen={openDays.includes(i + 1)}
                    onToggle={() => {
                      if (openDays.includes(i + 1)) {
                        setOpenDays(openDays.filter((d) => d !== i + 1));
                      } else {
                        setOpenDays([...openDays, i + 1]);
                      }
                    }}
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
                href={`/tour-packages/${countrySlug}/${stateSlug}`}
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

      {/* ===== MOBILE FLOATING ACTION BAR ===== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md p-3 border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex items-center gap-2.5">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            `Hi! I'm interested in "${journey.title}". Please share the best price and availability.\n\nTour Page: ${pageUrl}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-[#2E8B8B] hover:bg-[#247070] active:scale-95 text-white text-[13.5px] font-bold shadow-sm transition-all"
        >
          <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.659-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
          <span>Get Best Price</span>
        </a>

        <QuoteModal>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-[#D4561A] hover:bg-[#b84513] active:scale-95 text-white text-[13.5px] font-bold shadow-sm transition-all cursor-pointer"
          >
            <CalendarDays size={16} className="shrink-0" />
            <span>Book Now</span>
          </button>
        </QuoteModal>
      </div>
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
  isOpen,
  onToggle,
}: {
  index: number;
  day: { id: number; day: string; description?: string; image?: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
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
          onClick={onToggle}
          className={cn("w-full flex items-center justify-between gap-4 pb-3 border-b text-left cursor-pointer group/btn", isOpen ? "border-slate-100" : "border-slate-100/50")}
        >
          <h3 className="font-heading text-lg md:text-xl font-bold text-[#1C1C1C] transition-colors duration-300 group-hover/btn:text-[#D4561A]">
            <span className={cn("mr-2 transition-colors duration-300", isOpen ? "text-[#D4561A]" : "text-[#2E8B8B] group-hover/btn:text-[#D4561A]")}>Day {index}:</span>
            {day.day}
          </h3>
          <span className={cn("w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300", isOpen ? "text-[#D4561A] rotate-180" : "text-slate-400 group-hover/btn:text-[#D4561A]")}>
            <ChevronDown size={20} />
          </span>
        </button>

        {/* SEO Friendly Accordion Content using CSS Grid */}
        <div
          className={cn(
            "grid transition-all duration-300",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
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

function formatSeasonRange(g: { range: string }) {
  if (!g.range) return "";
  const parts = g.range.split(" - ").map((p) => p.trim());
  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
    return "";
  }
  return g.range;
}

function getSeasonIcon(seasonKey: string) {
  switch (seasonKey.toLowerCase()) {
    case "winter":
      return <Snowflake size={13} className="text-sky-600 shrink-0" />;
    case "spring":
      return <Sun size={13} className="text-amber-600 shrink-0" />;
    case "monsoon":
      return <CloudRain size={13} className="text-blue-600 shrink-0" />;
    default:
      return <Sparkles size={13} className="text-[#2E8B8B] shrink-0" />;
  }
}

function getSeasonStyles(seasonKey: string) {
  switch (seasonKey.toLowerCase()) {
    case "winter":
      return "bg-sky-50 text-sky-900 border-sky-200/90 shadow-sky-500/5";
    case "spring":
      return "bg-amber-50 text-amber-900 border-amber-200/90 shadow-amber-500/5";
    case "monsoon":
      return "bg-blue-50 text-blue-900 border-blue-200/90 shadow-blue-500/5";
    default:
      return "bg-teal-50 text-teal-900 border-teal-200/90 shadow-teal-500/5";
  }
}
