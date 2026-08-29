"use client";

import React, { useState } from "react";
import { Sparkles, Send, CheckCircle } from "lucide-react";
import { successToast, errorToast } from "@/components/shared/tost";

export const CtaBanner: React.FC = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [destination, setDestination] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !destination) {
      errorToast("Please fill in destination and mobile number.");
      return;
    }
    successToast("Thank you! Our travel expert will call you shortly");
    setName(""); setMobile(""); setDestination("");
  };

  return (
    <section id="cta" className="py-16 relative overflow-hidden bg-navy">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 bg-teal" />

      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Content */}
            <div className="lg:col-span-6 space-y-4">
              {/* Tag */}
              <div
                className="tag-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Instant Travel Quotation</span>
              </div>

              <h2 className="h2 text-white leading-tight">
                Plan Your Customized Dream Trip
              </h2>

              <p className="text-base text-zinc-200 leading-relaxed">
                Tell us where you want to travel. Get custom day-wise itineraries, verified hotel choices, and best pricing directly on WhatsApp.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-sm font-bold text-zinc-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Free Cancellation Terms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Zero Consultancy Charge</span>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-6 bg-white text-zinc-900 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-extrabold text-zinc-900 mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-teal" />
                <span>Get Free Custom Quotation</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="form-label block mb-1">Your Full Name</label>
                  <input type="text" placeholder="e.g. Rahul Sharma" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#58a2ad]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label block mb-1">Mobile Number *</label>
                    <input type="tel" required placeholder="+91 9876543210" value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#58a2ad]" />
                  </div>
                  <div>
                    <label className="form-label block mb-1">Destination *</label>
                    <input type="text" required placeholder="e.g. Kashmir / Kerala" value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#58a2ad]" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-gold w-full mt-2 font-extrabold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Send Me Customized Plan</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
