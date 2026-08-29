"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import ContactForm from "../../feature/leads/components/ContactForm";
import TourBookingForm from "../../feature/leads/components/TourBookingForm";
import CarBookingForm from "../../feature/leads/components/CarBookingForm";
import { useGetJourneys } from "@/feature/journey/api/useJourney";
import { JourneyCard } from "@/feature/journey/components/PackagesExplorer";

const sections = [
  { id: "contact", label: "Contact Form", component: <ContactForm /> },
  { id: "tour", label: "Tour Booking", component: <TourBookingForm /> },
  { id: "car", label: "Car Booking", component: <CarBookingForm /> },
];

export default function BookingPage() {
  const [active, setActive] = useState<string>("tour");
  const { journeys, isLoading } = useGetJourneys({ limit: 5, isActive: "true" });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <section className="relative h-56 md:h-64 overflow-hidden bg-[#1C1C1C]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E8B8B] via-[#1C1C1C] to-[#D4561A]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 h-full flex flex-col justify-center">
          <span className="mb-3 inline-flex self-start text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-sm">
            Book Your Trip
          </span>
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Bookings
          </h1>
          <p className="mt-3 text-white/85 text-sm sm:text-base max-w-2xl">
            Fill in the form below and our travel experts will craft your perfect holiday itinerary.
          </p>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-3">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={
                  active === s.id
                    ? "px-5 py-2.5 rounded-xl bg-[#2E8B8B] text-white text-sm font-semibold shadow-lg shadow-[#2E8B8B]/20"
                    : "px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:border-[#2E8B8B]/40 hover:text-[#2E8B8B] transition-colors"
                }
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            {sections.find((s) => s.id === active)?.component}
          </div>
        </main>

        <aside className="space-y-6 lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#1C1C1C] mb-1">
              <span className="text-[#2E8B8B]">●</span>
              Popular Tour Packages
            </h3>
            <p className="text-slate-500 text-xs mb-5">Hand-picked itineraries loved by travellers</p>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[#2E8B8B]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
                {journeys.map((j) => (
                  <JourneyCard key={j.id} journey={j} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-600">
              Need help planning? Call us or WhatsApp for instant assistance.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E8B8B] text-white text-sm font-semibold hover:bg-[#247777] transition-colors"
            >
              Contact Us <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
