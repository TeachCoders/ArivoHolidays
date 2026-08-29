"use client";

import React from "react";
import { ShieldCheck, Headphones, Award, CheckCircle, CreditCard } from "lucide-react";
import { SectionLabel } from "@/components/shared/SectionLabel";

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FEATURES: Feature[] = [
  { id: 1, title: "100% Customized Itineraries", description: "Modify hotel choices, vehicle models, and day plans according to your convenience.", icon: <Award className="w-5 h-5" /> },
  { id: 2, title: "Verified Hotels & Cabs", description: "Every hotel and cab driver is pre-verified to ensure maximum safety for families & couples.", icon: <ShieldCheck className="w-5 h-5" /> },
  { id: 3, title: "24/7 Dedicated Trip Manager", description: "Get a single point-of-contact trip assistant on WhatsApp & call during your whole journey.", icon: <Headphones className="w-5 h-5" /> },
  { id: 4, title: "No Hidden Costs", description: "Complete transparent breakdown of hotel taxes, driver allowances, toll charges, and GST.", icon: <CreditCard className="w-5 h-5" /> },
];

export const WhyChooseUsSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel>Why Book With Us</SectionLabel>
          <h2 className="h2 text-[#1C1C1C] mt-2">The Preferred Travel Partner For 50,000+ Guests</h2>
          <p className="mt-2 text-base text-[#555]">We simplify travel planning by combining verified local suppliers with round-the-clock customer support.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat) => (
            <div key={feat.id} className="bg-[#f8f8f8] rounded-xl p-6 border border-[#f0f0f0] hover:border-[#D4561A]/20 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white border border-[#e5e5e5] flex items-center justify-center mb-4 text-[#1C1C1C]">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-[#1C1C1C]">{feat.title}</h3>
                <p className="mt-2 text-sm text-[#555] leading-relaxed">{feat.description}</p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#e5e5e5] flex items-center gap-2 text-xs font-medium text-[#888]">
                <CheckCircle className="w-3.5 h-3.5 text-[#D4561A]" /><span>Guaranteed Satisfaction</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
