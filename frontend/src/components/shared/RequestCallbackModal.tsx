"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { PhoneCall, ShieldCheck } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { successToast, errorToast } from "@/components/shared/tost";
import PageLoader from "@/components/shared/PageLoader";
import { COUNTRIES, detectGeoFromIP, getCountryFlagEmoji } from "@/feature/leads/data/countries";

interface RequestCallbackModalProps {
  children: ReactNode;
  destinationName?: string;
}

export function RequestCallbackModal({ children, destinationName = "Holiday Package" }: RequestCallbackModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("+91");
  const [callTime, setCallTime] = useState("Immediately (within 10 mins)");
  const [isLoading, setIsLoading] = useState(false);
  const [geoMeta, setGeoMeta] = useState<{ ip: string; location: string } | null>(null);

  useEffect(() => {
    detectGeoFromIP().then((geo) => {
      if (!geo?.ip) return;
      setGeoMeta({ ip: geo.ip, location: geo.location });
      if (geo.country) setDialCode(geo.country.dialCode);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return errorToast("Please enter your name");
    if (!phone.trim() || phone.length < 5) return errorToast("Please enter a valid phone number");

    const fullPhoneNumber = `${dialCode} ${phone.trim()}`;

    setIsLoading(true);
    try {
      await apiClient.post("/traveller-lead", {
        name: name.trim(),
        phone: fullPhoneNumber,
        ipAddress: geoMeta?.ip,
        location: geoMeta?.location,
        country: destinationName,
        travellerMessage: `Requested Callback for Price Inquiry (${destinationName}) - Preferred Time: ${callTime}`,
        pageReference: typeof window !== "undefined" ? `Price Callback (${window.location.pathname})` : "Price Callback Request",
      });

      successToast("Callback request sent! Our travel expert will call/WhatsApp you shortly with live rates.");
      setOpen(false);
      setName("");
      setPhone("");
    } catch (err: any) {
      errorToast(err?.response?.data?.message || "Failed to submit request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl md:max-w-2xl w-[95vw] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
        <DialogTitle className="sr-only">Request Best Price Callback</DialogTitle>

        <div className="relative p-6 sm:p-8 bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-white">


          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
            Get Custom Quote & Pricing for <span className="text-orange-600">{destinationName}</span>
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
            Enter your number below & our travel specialist will call you within <strong className="text-slate-900">5-10 minutes</strong> with customized stay & trip options.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Mobile / WhatsApp Number *
              </label>
              <div className="flex gap-2">
                <select
                  value={dialCode}
                  onChange={(e) => setDialCode(e.target.value)}
                  aria-label="Country Code"
                  className="w-[180px] sm:w-[200px] shrink-0 px-3 py-3 text-xs sm:text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                      {getCountryFlagEmoji(c.code)} {c.dialCode} ({c.name})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  required
                  placeholder="Phone / WhatsApp Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d+-\s]/g, ""))}
                  className="flex-1 px-4 py-3 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                When should we call you?
              </label>
              <select
                value={callTime}
                onChange={(e) => setCallTime(e.target.value)}
                className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition shadow-sm"
              >
                <option value="Immediately (within 10 mins)">⚡ Immediately (within 10 mins)</option>
                <option value="Morning (9 AM - 12 PM)">🌅 Morning (9 AM - 12 PM)</option>
                <option value="Afternoon (12 PM - 4 PM)">☀️ Afternoon (12 PM - 4 PM)</option>
                <option value="Evening (4 PM - 8 PM)">🌆 Evening (4 PM - 8 PM)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl shadow-lg shadow-orange-500/25 transition transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wider mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <PageLoader size="inline" />
                  Requesting Callback...
                </>
              ) : (
                <>
                  <PhoneCall size={18} />
                  <span>Request Call Back For Quote →</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>100% Free Consultation • Zero Spam Guarantee</span>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
