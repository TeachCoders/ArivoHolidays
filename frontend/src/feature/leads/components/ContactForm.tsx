"use client";
import { useState, useEffect } from "react";
import { EMPTY, ContactFormData } from "../type";
import { useTravellerLead } from "../api/useLeeds";
import { successToast, errorToast } from "@/components/shared/tost";
import PageLoader from "@/components/shared/PageLoader";
import { DarkDatePicker } from "@/components/shared/darkDatePicker";
import { COUNTRIES, detectCountryFromIP, stripDialCode } from "../data/countries";

export default function ContactFormPage() {
  const [data, setData] = useState<ContactFormData>(EMPTY);
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>();
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [selectedDialCode, setSelectedDialCode] = useState("+91");

  const { isLoading, createNewTravellerLead } = useTravellerLead();

  useEffect(() => {
    detectCountryFromIP().then((country) => {
      if (country) {
        setData((prev) => ({
          ...prev,
          country: country.name,
          countryId: country.code,
          phone: country.dialCode + " ",
        }));
        setSelectedDialCode(country.dialCode);
      } else {
        fetch("https://api.ipify.org?format=json")
          .then((res) => res.json())
          .then((ipData) => {
            if (ipData.ip) {
              setData((prev) => ({ ...prev, countryId: ipData.ip }));
            }
          })
          .catch(console.error);
      }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setData((prev: ContactFormData) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...data,
      travelDate: arrivalDate ? arrivalDate.toISOString().split("T")[0] : data.travelDate,
    };
    createNewTravellerLead(payload, {
      onSuccess: () => {
        successToast("Contact details saved successfully");
        setData(EMPTY);
        setArrivalDate(undefined);
        setDepartureDate(undefined);
      },
      onError: (e: any) => {
        errorToast(e.response?.data?.message || e.message || "Failed to save details");
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <span className="inline-block text-[11px] font-bold tracking-[0.35em] uppercase text-indigo-500 mb-3">
            ✦ Step 1 of 1
          </span>
          <h1 className="h3 text-slate-900">
            Your Contact<br />
            <span className="text-indigo-600">Details</span>
          </h1>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            We&apos;ll use this information to confirm your booking and stay in touch.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Full Name" name="name" type="text" value={data.name} onChange={handleChange} placeholder="John Doe" required />
            <Field label="Email Address" name="email" type="email" value={data.email} onChange={handleChange} placeholder="john@example.com" required />

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-indigo-600 mb-1.5">
                Country<span className="text-rose-500 ml-0.5">*</span>
              </label>
              <select
                name="country" value={data.countryId} onChange={handleCountryChange} required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-150 appearance-none"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name} ({c.dialCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-indigo-600 mb-1.5">
                Mobile Number<span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={data.countryId} onChange={handleCountryChange} required
                  className="w-[120px] shrink-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-3 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-150 appearance-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.dialCode} {c.code}</option>
                  ))}
                </select>
                <input
                  type="tel" name="phone"
                  value={stripDialCode(data.phone, selectedDialCode)}
                  onChange={(e) => setData((prev) => ({ ...prev, phone: selectedDialCode + " " + e.target.value }))}
                  placeholder="98765 43210" required
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-150"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <DarkDatePicker value={arrivalDate} onChange={setArrivalDate} label="Arrival Date" />
              <DarkDatePicker value={departureDate} onChange={setDepartureDate} label="Departure Date" minDate={arrivalDate} />
            </div>

            <button
              type="submit" disabled={isLoading}
              className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl transition-all duration-150 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <PageLoader size="inline" />
                  Saving…
                </>
              ) : (
                "Save & Continue →"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          Your data is encrypted and never shared with third parties.
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, type, value, onChange, placeholder, required }: {
  label: string; name: string; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[11px] font-bold uppercase tracking-widest text-indigo-600 mb-1.5">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <input
        id={name} type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-150"
      />
    </div>
  );
}
