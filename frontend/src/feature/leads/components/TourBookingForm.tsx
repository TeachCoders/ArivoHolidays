"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EMPTY_TOUR_BOOKING, TourBookingFormData } from "../type";
import { cn } from "@/lib/utils";
import { useTourBooking } from "../api/useLeeds";
import { successToast, errorToast } from "@/components/shared/tost";
import { ChevronDown } from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";
import { DarkDatePicker } from "@/components/shared/darkDatePicker";
import { COUNTRIES, HOTEL_CATEGORIES, detectGeoFromIP, stripDialCode, getCountryFlagEmoji } from "../data/countries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TourBookingForm({ embedded = false, hideHeader = false, onSuccess }: { embedded?: boolean; hideHeader?: boolean; onSuccess?: () => void }) {
  const router = useRouter();
  const [data, setData] = useState<TourBookingFormData>(EMPTY_TOUR_BOOKING);
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>();
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [selectedDialCode, setSelectedDialCode] = useState("+91");

  const { isLoading, createNewTourBooking } = useTourBooking();

  const embeddedHeader = embedded ? (
    <div className="mb-3">
      <span className="inline-block text-[10px] font-bold tracking-[0.3em] uppercase text-[#2E8B8B] mb-2">
        Book This Tour
      </span>
      <h3 className="h3 text-[#1C1C1C]">Plan Your Adventure</h3>
    </div>
  ) : (
    <div className="mb-10 text-center">
      <span className="inline-block text-[11px] font-bold tracking-[0.35em] uppercase text-indigo-500 mb-3">
        ✦ Tour Booking
      </span>
      <h1 className="h3 text-slate-900">
        Plan Your<br />
        <span className="text-brand-primary">Adventure</span>
      </h1>
      <p className="text-brand-neutral-muted text-sm mt-3 leading-relaxed">
        Please provide your details and tour preferences.
      </p>
    </div>
  );


  useEffect(() => {
    detectGeoFromIP().then((geo) => {
      if (!geo?.ip) return;
      setData((prev) => ({
        ...prev,
        ipAddress: geo.ip,
        location: geo.location,
        ...(geo.country ? { country: geo.country.name, countryId: geo.country.code, phone: geo.country.dialCode + " " } : {}),
      }));
      if (geo.country) setSelectedDialCode(geo.country.dialCode);
    });
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const country = COUNTRIES.find((c) => c.code === code);
    if (!country) return;
    setData((prev) => {
      const currentNumber = stripDialCode(prev.phone, selectedDialCode);
      return { ...prev, country: country.name, countryId: code, phone: country.dialCode + " " + currentNumber };
    });
    setSelectedDialCode(country.dialCode);
  };

  const onCountryCodeChange = (code: string) => {
    const country = COUNTRIES.find((c) => c.code === code);
    if (!country) return;
    setData((prev) => {
      const currentNumber = stripDialCode(prev.phone, selectedDialCode);
      return { ...prev, country: country.name, countryId: code, phone: country.dialCode + " " + currentNumber };
    });
    setSelectedDialCode(country.dialCode);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setData((prev: TourBookingFormData) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...data,
      pageReference: typeof window !== "undefined" ? window.location.href : "",
      travelStartDate: arrivalDate ? arrivalDate.toISOString().split("T")[0] : data.travelStartDate,
      travelEndDate: departureDate ? departureDate.toISOString().split("T")[0] : data.travelEndDate,
    };
    createNewTourBooking(payload, {
      onSuccess: () => {
        successToast("Tour booking submitted successfully");
        if (onSuccess) onSuccess();
        router.push("/thank-you?ref=" + encodeURIComponent(window.location.href));
      },
      onError: (e: any) => {
        errorToast(e.response?.data?.message || e.message || "Failed to submit booking");
      },
    });
  };

  return embedded ? (
    <div className="w-full">
      <div className={cn("p-4", !hideHeader && "bg-[#FFF4EE] border border-[#D4561A]/15 rounded-2xl shadow-sm")}>
        {!hideHeader && embeddedHeader}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field hideLabel label="Full Name" name="name" type="text" value={data.name} onChange={handleChange} placeholder="Full Name *" required />
          <Field hideLabel label="Email Address" name="email" type="email" value={data.email} onChange={handleChange} placeholder="Email Address *" required />

          <Select value={data.countryId} onValueChange={onCountryCodeChange}>
            <SelectTrigger className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 h-11 text-slate-800 text-sm focus:border-[#2E8B8B] focus:ring-1 focus:ring-[#2E8B8B]/30 font-medium shadow-none">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 z-50">
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="flex items-center gap-2">
                    <span>{getCountryFlagEmoji(c.code)}</span>
                    <span>{c.name} ({c.dialCode})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Select value={data.countryId} onValueChange={onCountryCodeChange}>
              <SelectTrigger className="w-[110px] sm:w-[130px] shrink-0 bg-white border border-slate-200 rounded-xl px-3 py-2.5 h-11 text-slate-800 text-sm focus:border-[#2E8B8B] focus:ring-1 focus:ring-[#2E8B8B]/30 font-medium shadow-none">
                <SelectValue>
                  {getCountryFlagEmoji(data.countryId || "IN")} {selectedDialCode}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 z-50">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span>{getCountryFlagEmoji(c.code)}</span>
                      <span>{c.dialCode} ({c.code})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="tel" name="phone"
              value={stripDialCode(data.phone, selectedDialCode)}
              onChange={(e) => setData((prev) => ({ ...prev, phone: selectedDialCode + " " + e.target.value }))}
              placeholder="Mobile Number *" required
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#2E8B8B] focus:ring-1 focus:ring-[#2E8B8B]/30 transition-all duration-150 font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              value={data.noOfPersons}
              onValueChange={(val) => setData((prev) => ({ ...prev, noOfPersons: val }))}
            >
              <SelectTrigger className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 h-11 text-slate-800 text-sm focus:border-[#2E8B8B] focus:ring-1 focus:ring-[#2E8B8B]/30 font-medium shadow-none">
                <SelectValue placeholder="No. of Persons" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                <SelectItem value="1">1 Person</SelectItem>
                <SelectItem value="2">2 Persons</SelectItem>
                <SelectItem value="3">3 Persons</SelectItem>
                <SelectItem value="4">4 Persons</SelectItem>
                <SelectItem value="5">5 Persons</SelectItem>
                <SelectItem value="6">6 Persons</SelectItem>
                <SelectItem value="7">7 Persons</SelectItem>
                <SelectItem value="8">8 Persons</SelectItem>
                <SelectItem value="9">9 Persons</SelectItem>
                <SelectItem value="10+">10+ Persons</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={data.noOfChildren}
              onValueChange={(val) => setData((prev) => ({ ...prev, noOfChildren: val }))}
            >
              <SelectTrigger className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 h-11 text-slate-800 text-sm focus:border-[#2E8B8B] focus:ring-1 focus:ring-[#2E8B8B]/30 font-medium shadow-none">
                <SelectValue placeholder="No. of Children" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                <SelectItem value="0">0 Children</SelectItem>
                <SelectItem value="1">1 Child</SelectItem>
                <SelectItem value="2">2 Children</SelectItem>
                <SelectItem value="3">3 Children</SelectItem>
                <SelectItem value="4">4 Children</SelectItem>
                <SelectItem value="5+">5+ Children</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select
            value={data.hotelCategory}
            onValueChange={(val) => setData((prev) => ({ ...prev, hotelCategory: val }))}
          >
            <SelectTrigger className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 h-11 text-slate-800 text-sm focus:border-[#2E8B8B] focus:ring-1 focus:ring-[#2E8B8B]/30 font-medium shadow-none">
              <SelectValue placeholder="Select Hotel Category" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl shadow-xl border border-slate-200 z-50">
              {HOTEL_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-3">
            <DarkDatePicker value={arrivalDate} onChange={setArrivalDate} />
            <DarkDatePicker value={departureDate} onChange={setDepartureDate} minDate={arrivalDate} />
          </div>

          <textarea name="travellerMessage" value={data.travellerMessage} onChange={handleChange} aria-label="Message"
            placeholder="Any special requests or details..." rows={2}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#2E8B8B] focus:ring-1 focus:ring-[#2E8B8B]/30 transition-all duration-150 resize-none font-medium" />

          <button type="submit" disabled={isLoading}
            className="w-full bg-[#D4561A] hover:bg-[#b84a16] text-white active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm uppercase tracking-wider py-3.5 rounded-xl transition-all duration-150 shadow-md shadow-[#D4561A]/20 flex items-center justify-center gap-2 mt-2">
            {isLoading ? (
              <>
                <PageLoader size="inline" />
                Submitting…
              </>
            ) : (
              "Submit Request →"
            )}
          </button>
        </form>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-brand-neutral-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <span className="inline-block text-[11px] font-bold tracking-[0.35em] uppercase text-indigo-500 mb-3">
            ✦ Tour Booking
          </span>
          <h1 className="h3 text-slate-900">
            Plan Your<br />
            <span className="text-brand-primary">Adventure</span>
          </h1>
          <p className="text-brand-neutral-muted text-sm mt-3 leading-relaxed">
            Please provide your details and tour preferences.
          </p>
        </div>

        <div className="bg-white border border-brand-neutral-border rounded-2xl p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Full Name" name="name" type="text" value={data.name} onChange={handleChange} placeholder="John Doe" required />
            <Field label="Email Address" name="email" type="email" value={data.email} onChange={handleChange} placeholder="john@example.com" required />

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">Country</label>
              <Select value={data.countryId} onValueChange={onCountryCodeChange}>
                <SelectTrigger className="w-full bg-white border border-brand-neutral-border rounded-lg px-4 py-2 text-brand-neutral-dark text-sm focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 font-medium shadow-none">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 z-50">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span>{getCountryFlagEmoji(c.code)}</span>
                        <span>{c.name} ({c.dialCode})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">
                Mobile Number<span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="flex gap-2">
                <Select value={data.countryId} onValueChange={onCountryCodeChange}>
                  <SelectTrigger className="w-[120px] shrink-0 bg-white border border-brand-neutral-border rounded-lg px-2 py-2 text-brand-neutral-dark text-sm focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 font-medium shadow-none">
                    <SelectValue>
                      {getCountryFlagEmoji(data.countryId || "IN")} {selectedDialCode}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 z-50">
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        <span className="flex items-center gap-2">
                          <span>{getCountryFlagEmoji(c.code)}</span>
                          <span>{c.dialCode} ({c.code})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="tel" name="phone"
                  value={stripDialCode(data.phone, selectedDialCode)}
                  onChange={(e) => setData((prev) => ({ ...prev, phone: selectedDialCode + " " + e.target.value }))}
                  placeholder="98765 43210" required
                  className="flex-1 bg-white border border-brand-neutral-border rounded-lg px-4 py-2 text-brand-neutral-dark text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 transition-all duration-150" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">No. of Persons</label>
                <Select
                  value={data.noOfPersons}
                  onValueChange={(val) => setData((prev) => ({ ...prev, noOfPersons: val }))}
                >
                  <SelectTrigger className="w-full bg-white border border-brand-neutral-border rounded-lg px-4 py-2 text-brand-neutral-dark text-sm focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 font-medium">
                    <SelectValue placeholder="Select Persons" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                    <SelectItem value="1">1 Person</SelectItem>
                    <SelectItem value="2">2 Persons</SelectItem>
                    <SelectItem value="3">3 Persons</SelectItem>
                    <SelectItem value="4">4 Persons</SelectItem>
                    <SelectItem value="5">5 Persons</SelectItem>
                    <SelectItem value="6">6 Persons</SelectItem>
                    <SelectItem value="7">7 Persons</SelectItem>
                    <SelectItem value="8">8 Persons</SelectItem>
                    <SelectItem value="9">9 Persons</SelectItem>
                    <SelectItem value="10+">10+ Persons</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">No. of Children</label>
                <Select
                  value={data.noOfChildren}
                  onValueChange={(val) => setData((prev) => ({ ...prev, noOfChildren: val }))}
                >
                  <SelectTrigger className="w-full bg-white border border-brand-neutral-border rounded-lg px-4 py-2 text-brand-neutral-dark text-sm focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 font-medium">
                    <SelectValue placeholder="Select Children" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                    <SelectItem value="0">0 Children</SelectItem>
                    <SelectItem value="1">1 Child</SelectItem>
                    <SelectItem value="2">2 Children</SelectItem>
                    <SelectItem value="3">3 Children</SelectItem>
                    <SelectItem value="4">4 Children</SelectItem>
                    <SelectItem value="5+">5+ Children</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">Hotel Category</label>
              <Select
                value={data.hotelCategory}
                onValueChange={(val) => setData((prev) => ({ ...prev, hotelCategory: val }))}
              >
                <SelectTrigger className="w-full bg-white border border-brand-neutral-border rounded-lg px-4 py-2 text-brand-neutral-dark text-sm focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 font-medium">
                  <SelectValue placeholder="Select hotel category" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                  {HOTEL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <DarkDatePicker value={arrivalDate} onChange={setArrivalDate} label="Arrival Date" />
              <DarkDatePicker value={departureDate} onChange={setDepartureDate} label="Departure Date" minDate={arrivalDate} />
            </div>

            <div>
              <label htmlFor="travellerMessage" className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">Message</label>
              <textarea id="travellerMessage" name="travellerMessage" value={data.travellerMessage} onChange={handleChange}
                placeholder="Any special requests or details..." rows={3}
                className="w-full bg-white border border-brand-neutral-border rounded-lg px-4 py-2 text-brand-neutral-dark text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 transition-all duration-150 resize-none" />
            </div>

            <button type="submit" disabled={isLoading}
              className="btn-primary mt-2 w-full active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-black text-sm uppercase tracking-widest py-4 rounded-xl transition-all duration-150 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <PageLoader size="inline" />
                  Submitting…
                </>
              ) : (
                "Submit Request  →"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hideLabel = false, name, type, value, onChange, placeholder, required }: {
  label: string; hideLabel?: boolean; name: string; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      {!hideLabel && (
        <label htmlFor={name} className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <input id={name} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required}
        className="w-full bg-white border border-brand-neutral-border rounded-lg px-4 py-2 text-brand-neutral-dark text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 transition-all duration-150" />
    </div>
  );
}
