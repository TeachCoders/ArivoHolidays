"use client";

import { Phone, MessageCircle, Sparkles } from "lucide-react";
import { QuoteModal } from "@/components/shared/QuoteModal";

export default function MobileStickyActionBar() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210"; // Official WhatsApp
  const phone = process.env.NEXT_PUBLIC_SALES_PHONE || "+919876543210";

  return (
    <aside aria-label="Quick Actions" className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2.5 shadow-2xl">
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {/* Call Button */}
        <a
          href={`tel:${phone}`}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-all active:scale-95 border border-slate-700/60"
        >
          <Phone size={18} className="text-[#2E8B8B] mb-0.5" />
          <span className="text-[11px] font-bold">Call Now</span>
        </a>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Arivo Holidays, I want to inquire about a custom holiday tour package.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
        >
          <MessageCircle size={18} className="text-emerald-400 mb-0.5" />
          <span className="text-[11px] font-bold">WhatsApp</span>
        </a>

        {/* Instant Quote Button */}
        <QuoteModal>
          <button
            type="button"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#D4561A] text-white hover:bg-[#b84a16] transition-all active:scale-95 shadow-md shadow-[#D4561A]/30"
          >
            <Sparkles size={18} className="mb-0.5 animate-pulse" />
            <span className="text-[11px] font-bold">Get Quote</span>
          </button>
        </QuoteModal>
      </div>
    </aside>
  );
}
