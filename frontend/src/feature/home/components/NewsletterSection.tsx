"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle } from "lucide-react";
import { successToast, errorToast } from "@/components/shared/tost";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { ref, isVisible } = useScrollReveal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return errorToast("Please enter your email.");
    setSubmitted(true);
    successToast("You're subscribed! Check your inbox for a welcome gift");
    setEmail("");
  };

  return (
    <section ref={ref} className="py-20 bg-zinc-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand-teal/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-brand-gold/5 blur-3xl" />

      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className={`bg-white rounded-3xl border border-zinc-200 shadow-xl p-8 lg:p-14 flex flex-col lg:flex-row items-center gap-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {/* Left */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal/10 text-brand-teal font-bold text-xs uppercase tracking-wider mb-4">
              <Mail className="w-3.5 h-3.5" />
              <span>Travel Newsletter</span>
            </div>
            <h2 className="h3 text-zinc-900">
              Get Exclusive Deals & Travel Tips
            </h2>
            <p className="mt-3 text-base text-zinc-600 leading-relaxed">
              Join 12,000+ travellers who receive weekly handpicked deals, destination guides, and early-bird discounts straight to their inbox.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-zinc-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-teal" />
                <span>No spam, ever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-teal" />
                <span>Unsubscribe anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-teal" />
                <span>Exclusive member pricing</span>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="w-full lg:w-[420px] shrink-0">
            {submitted ? (
              <div className="bg-brand-teal/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-brand-teal" />
                </div>
                <h3 className="text-lg font-extrabold text-zinc-900">You&apos;re In!</h3>
                <p className="text-sm text-zinc-600 mt-2">Welcome aboard. Check your inbox for a special welcome gift.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-sm font-bold text-brand-teal hover:underline">
                  Subscribe another email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="form-label block mb-1">Your Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full py-3.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Subscribe for Deals</span>
                </button>
                <p className="text-xs text-zinc-400 text-center">
                  By subscribing, you agree to our Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
