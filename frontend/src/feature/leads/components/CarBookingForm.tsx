"use client";
import { useState, useEffect } from "react";
import { CarBookingFormData, EMPTY_CAR_BOOKING } from "../type";
import { useCarBooking } from "../api/useLeeds";
import { successToast, errorToast } from "@/components/shared/tost";
import PageLoader from "@/components/shared/PageLoader";
import { COUNTRIES, detectGeoFromIP, stripDialCode } from "../data/countries";

const SERVICE_OPTIONS = [
  { value: "oneway", label: "One-Way Transfer", icon: "➡️" },
  { value: "roundway", label: "Round Trip", icon: "🔄" },
  { value: "pickup_drop", label: "Pick-up & Drop", icon: "📍" },
  { value: "sightseeing", label: "Sightseeing", icon: "🏛️" },
];

const VEHICLE_OPTIONS = [
  { group: "Sedan", vehicles: ["Maruti Dzire", "Honda City", "Hyundai Verna", "Hyundai Aura", "Toyota Etios", "Skoda Slavia"] },
  { group: "SUV", vehicles: ["Hyundai Creta", "Maruti Brezza", "Mahindra XUV700", "Kia Seltos", "Tata Harrier", "MG Hector"] },
  { group: "MUV / Innova", vehicles: ["Toyota Innova Crysta", "Toyota Innova Hycross", "Maruti Ertiga", "Kia Carens", "Mahindra Marazzo"] },
  { group: "Premium / Luxury", vehicles: ["Toyota Fortuner", "Toyota Camry", "Mercedes-Benz E-Class", "BMW 5 Series", "Audi A6", "Mercedes-Benz GLC"] },
  { group: "Tempo Traveller", vehicles: ["Tempo Traveller 9-Seater", "Tempo Traveller 12-Seater", "Tempo Traveller 17-Seater", "Force Urbania 17-Seater", "Tempo Traveller 20-Seater", "Mini Bus 26-Seater"] },
  { group: "Hatchback", vehicles: ["Maruti Swift", "Hyundai i20", "Maruti Baleno", "Tata Altroz", "Honda Amaze"] },
  { group: "Bus / Group", vehicles: ["AC Mini Bus 21-Seater", "AC Bus 27-Seater", "AC Bus 35-Seater", "AC Bus 49-Seater", "Volvo Bus 45-Seater"] },
];

export default function CarBookingPage() {
  const [data, setData] = useState<CarBookingFormData>(EMPTY_CAR_BOOKING);
  const [selectedDialCode, setSelectedDialCode] = useState("+91");
  const [showOther, setShowOther] = useState(false);
  const { isLoading, createNewCarBooking } = useCarBooking();

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createNewCarBooking(data, {
      onSuccess: () => {
        successToast("Car booking submitted successfully");
        setData(EMPTY_CAR_BOOKING);
        setShowOther(false);
      },
      onError: (e: any) => {
        errorToast(e.response?.data?.message || e.message || "Failed to submit car booking");
      },
    });
  };

  return (
    <div className="min-h-screen bg-brand-neutral-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl mx-auto">
        <div className="mb-10 text-center">
          <span className="inline-block text-[11px] font-bold tracking-[0.35em] uppercase text-indigo-500 mb-3">
            ✦ Vehicle Booking
          </span>
          <h1 className="h3 text-slate-900">
            Book a <span className="text-brand-primary">Car</span>
          </h1>
          <p className="text-brand-neutral-muted text-sm mt-3 leading-relaxed">
            Choose your vehicle and service for a smooth, on-time ride.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section icon="👤" title="Traveller Details">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Full Name" name="name" type="text" value={data.name} onChange={handleChange} placeholder="John Doe" required />
                <TextField label="Email Address" name="email" type="email" value={data.email} onChange={handleChange} placeholder="john@example.com" required />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">
                  Country<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <select name="country" value={data.countryId} onChange={handleCountryChange} required
                  className="w-full bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-brand-neutral-dark text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 transition-all duration-150 appearance-none">
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name} ({c.dialCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">
                  Mobile Number<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <div className="flex gap-2">
                  <select value={data.countryId} onChange={handleCountryChange} required
                    className="w-[120px] shrink-0 bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-2 py-3 text-brand-neutral-dark text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 transition-all duration-150 appearance-none">
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.dialCode} {c.code}</option>
                    ))}
                  </select>
                  <input type="tel" name="phone"
                    value={stripDialCode(data.phone, selectedDialCode)}
                    onChange={(e) => setData((prev) => ({ ...prev, phone: selectedDialCode + " " + e.target.value }))}
                    placeholder="98765 43210" required
                    className="flex-1 bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-brand-neutral-dark text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 transition-all duration-150" />
                </div>
              </div>

            </div>
          </Section>

          <Section icon="🚗" title="Vehicle Details" subtitle="optional">
            <div className="space-y-4">
                <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">Vehicle Name / Model</label>
                <select
                  value={showOther ? "__other__" : data.vehicleName}
                  onChange={(e) => {
                    if (e.target.value === "__other__") {
                      setShowOther(true);
                      setData((p) => ({ ...p, vehicleName: "" }));
                    } else {
                      setShowOther(false);
                      setData((p) => ({ ...p, vehicleName: e.target.value }));
                    }
                  }}
                  className="w-full bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-brand-neutral-dark text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 transition-all duration-150 appearance-none"
                >
                  <option value="">Select vehicle</option>
                  {VEHICLE_OPTIONS.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.vehicles.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="__other__">Other (type manually)</option>
                </select>
                {showOther && (
                  <input
                    type="text"
                    name="vehicleName"
                    value={data.vehicleName}
                    onChange={handleChange}
                    placeholder="Enter vehicle name"
                    autoFocus
                    className="mt-2 w-full bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-brand-neutral-dark text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 transition-all duration-150"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-2">Service Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => setData((p) => ({ ...p, serviceType: p.serviceType === opt.value ? "" : opt.value }))}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-semibold transition-all ${
                        data.serviceType === opt.value
                          ? "bg-brand-primary-light border-indigo-300 text-brand-primary scale-[1.02]"
                          : "bg-white border-brand-neutral-border text-brand-neutral-muted hover:border-slate-300 hover:text-brand-neutral"
                      }`}>
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section icon="💬" title="Message" subtitle="optional">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">Pickup Address / Notes</label>
              <textarea name="travellerMessage" value={data.travellerMessage} onChange={handleChange} rows={3}
                placeholder="Pickup location, drop address, flight number, special requirements…"
                className="w-full bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-brand-neutral-dark text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 transition-all duration-150 resize-none" />
            </div>
          </Section>

          <button type="submit" disabled={isLoading}
            className="btn-primary w-full active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-black text-sm uppercase tracking-widest py-4 rounded-xl transition-all duration-150 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <PageLoader size="inline" />
                Submitting…
              </>
            ) : (
              "Submit Car Booking →"
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-xs mt-8">
          Your data is encrypted and never shared with third parties.
        </p>
      </div>
    </div>
  );
}

function Section({ icon, title, subtitle, children }: { icon: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-brand-neutral-border rounded-2xl p-6 shadow-lg shadow-slate-200/40">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl">{icon}</span>
        <h2 className="text-sm font-black uppercase tracking-widest text-brand-neutral-dark">{title}</h2>
        {subtitle && <span className="text-slate-400 text-xs">({subtitle})</span>}
        <div className="flex-1 h-px bg-slate-100 ml-2" />
      </div>
      {children}
    </div>
  );
}

function TextField({ label, name, type, value, onChange, placeholder, required }: {
  label: string; name: string; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <input id={name} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required}
        className="w-full bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-brand-neutral-dark text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-brand-primary/30 transition-all duration-150" />
    </div>
  );
}
