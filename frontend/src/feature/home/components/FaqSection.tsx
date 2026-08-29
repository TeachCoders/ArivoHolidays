"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { HOME_FAQS, type FaqItem } from "@/lib/homeFaqs";

interface FaqSectionProps {
  faqs?: FaqItem[];
  heading?: string;
  subtitle?: string;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  faqs,
  heading = "Frequently Asked Questions",
  subtitle = "Simple answers about booking, payments, trip plans and help during your holiday.",
}) => {
  const [openId, setOpenId] = useState<number | null>(1);
  const toggleFaq = (id: number) => setOpenId(openId === id ? null : id);
  const faqData = faqs && faqs.length > 0 ? faqs : HOME_FAQS;

  return (
    <section id="faq" className="py-20 bg-[#f8f8f8]">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left - Header + Info */}
          <div className="lg:sticky lg:top-24">
            <SectionLabel icon={<HelpCircle className="w-4 h-4" />}>Got Questions?</SectionLabel>
            <h2 className="h2 text-[#1C1C1C] mt-2">{heading}</h2>
            <p className="mt-3 text-base text-[#555] leading-relaxed">{subtitle}</p>

            <div className="mt-8 p-5 rounded-xl bg-white border border-[#e5e5e5]">
              <p className="text-sm font-semibold text-[#1C1C1C] mb-2">Still have questions?</p>
              <p className="text-sm text-[#555] mb-4">Can&apos;t find your answer? Chat with our travel experts — we&apos;re here 24/7.</p>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
                <button className="btn-primary px-5 py-2.5 text-sm font-medium">Chat on WhatsApp</button>
              </a>
            </div>
          </div>

          {/* Right - FAQ Accordion */}
          <div className="space-y-3">
            {faqData.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id}
                  className={`bg-white rounded-xl border overflow-hidden transition-all ${
                    isOpen ? "border-[#D4561A]/30 shadow-sm" : "border-[#e5e5e5] hover:border-[#D4561A]/15"
                  }`}>
                  <button onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none">
                    <div className="flex items-center gap-3">
                      {faq.category && (
                        <span className="text-xs font-semibold text-[#D4561A] bg-[#D4561A]/8 px-2 py-1 rounded-md shrink-0">{faq.category}</span>
                      )}
                      <span className="text-sm sm:text-base font-bold text-[#1C1C1C]">{faq.question}</span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? "bg-[#D4561A] text-white" : "bg-[#f0f0f0] text-[#555]"
                    }`}>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-sm text-[#555] leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
