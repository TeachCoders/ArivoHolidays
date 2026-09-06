"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, AlertCircle, Loader2, User, Mail, Phone, MessageSquare, Globe } from "lucide-react";
import apiClient, { fetchCsrfToken } from "@/lib/apiClient";
import { COUNTRIES, detectGeoFromIP } from "@/feature/leads/data/countries";
import { successToast, errorToast } from "@/components/shared/tost";

export default function ContactFormClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "India",
    countryCode: "IN",
    phone: "",
    message: "",
    ipAddress: "",
    location: "",
  });

  const [selectedDialCode, setSelectedDialCode] = useState("+91");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch CSRF Token and Auto-detect country from IP on mount
  useEffect(() => {
    fetchCsrfToken();

    detectGeoFromIP().then((geo) => {
      if (!geo?.ip) return;
      setFormData((prev) => ({
        ...prev,
        ipAddress: geo.ip,
        location: geo.location,
        ...(geo.country ? { country: geo.country.name, countryCode: geo.country.code } : {}),
      }));
      if (geo.country) setSelectedDialCode(geo.country.dialCode);
    });
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const country = COUNTRIES.find((c) => c.code === code);
    if (!country) return;

    setFormData((prev) => ({
      ...prev,
      country: country.name,
      countryCode: code,
    }));
    setSelectedDialCode(country.dialCode);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // Ensure CSRF token is refreshed before sending
      await fetchCsrfToken();

      const fullPhoneNumber = `${selectedDialCode} ${formData.phone.trim()}`;

      // Submit lead using apiClient which automatically attaches X-CSRF-Token and credentials
      const res = await apiClient.post("/traveller-lead", {
        name: formData.name,
        email: formData.email,
        phone: fullPhoneNumber,
        country: formData.country,
        countryId: formData.countryCode,
        travellerMessage: formData.message,
        ipAddress: formData.ipAddress,
        location: formData.location,
        pageReference: typeof window !== "undefined" ? `Contact Us Page - ${window.location.href}` : "Contact Us Page",
      });

      if (res.data?.success === false) {
        throw new Error(res.data?.message || "Failed to submit message.");
      }

      // Show toast success message and redirect to thank-you page
      successToast("Your message has been sent successfully!");
      
      const currentRef = typeof window !== "undefined" ? window.location.href : "";
      router.push("/thank-you?ref=" + encodeURIComponent(currentRef));
    } catch (err: any) {
      console.error("Contact Form Submission Error:", err);
      const serverMsg = err.response?.data?.message || err.message || "Something went wrong. Please try again.";
      setErrorMsg(serverMsg);
      errorToast(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-md space-y-6">
      <div className="space-y-1">
        <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
          Send Us a Message
        </h3>
        <p className="text-slate-500 text-sm">
          Fill out the details below and we will get back to you promptly.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} className="text-[#2E8B8B]" />
            <span>Full Name <span className="text-rose-500">*</span></span>
          </label>
          <input
            id="contact-name"
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#2E8B8B] focus:ring-2 focus:ring-[#2E8B8B]/20 outline-none text-sm text-slate-800 transition-all bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={14} className="text-[#2E8B8B]" />
            <span>Email Address <span className="text-rose-500">*</span></span>
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. john@example.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#2E8B8B] focus:ring-2 focus:ring-[#2E8B8B]/20 outline-none text-sm text-slate-800 transition-all bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Country Selection */}
        <div className="space-y-1.5">
          <label htmlFor="contact-country" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Globe size={14} className="text-[#2E8B8B]" />
            <span>Country <span className="text-rose-500">*</span></span>
          </label>
          <select
            id="contact-country"
            name="countryCode"
            value={formData.countryCode}
            onChange={handleCountryChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#2E8B8B] focus:ring-2 focus:ring-[#2E8B8B]/20 outline-none text-sm text-slate-800 transition-all bg-slate-50/50 focus:bg-white appearance-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.dialCode})
              </option>
            ))}
          </select>
        </div>

        {/* Dial Code + Phone Number */}
        <div className="space-y-1.5">
          <label htmlFor="contact-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={14} className="text-[#2E8B8B]" />
            <span>Mobile / WhatsApp Number <span className="text-rose-500">*</span></span>
          </label>
          <div className="flex gap-2">
            <select
              aria-label="Country Dial Code"
              value={formData.countryCode}
              onChange={handleCountryChange}
              required
              className="w-[110px] shrink-0 px-3 py-3 rounded-xl border border-slate-200 focus:border-[#2E8B8B] focus:ring-2 focus:ring-[#2E8B8B]/20 outline-none text-sm text-slate-800 transition-all bg-slate-50/50 focus:bg-white appearance-none"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.dialCode} {c.code}
                </option>
              ))}
            </select>

            <input
              id="contact-phone"
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 98765 43210"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#2E8B8B] focus:ring-2 focus:ring-[#2E8B8B]/20 outline-none text-sm text-slate-800 transition-all bg-slate-50/50 focus:bg-white"
            />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare size={14} className="text-[#2E8B8B]" />
            <span>Message <span className="text-rose-500">*</span></span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="Write your message, travel inquiry, or questions here..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#2E8B8B] focus:ring-2 focus:ring-[#2E8B8B]/20 outline-none text-sm text-slate-800 transition-all bg-slate-50/50 focus:bg-white resize-y"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 rounded-2xl bg-[#D4561A] hover:bg-[#b84814] text-white font-bold text-base transition-colors duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Sending Message...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Send Message</span>
          </>
        )}
      </button>
      <p className="text-center text-xs text-slate-400">
        🔒 We respect your privacy. Your contact info is safe with us.
      </p>
    </form>
  );
}
