"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, Phone, X } from "lucide-react";

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919136739178";
const SALES_PHONE = process.env.NEXT_PUBLIC_SALES_PHONE || "+918447273005";

export const WhatsAppButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const tip = setTimeout(() => setShowTooltip(true), 4000);
    return () => clearTimeout(tip);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {showTooltip && (
        <div className="relative bg-white rounded-2xl shadow-xl border border-zinc-200 px-4 py-3 max-w-[220px] animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-1.5 right-1.5 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-sm font-semibold text-zinc-800 pr-4">
            Need help planning your trip? 💬
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Chat with us on WhatsApp
          </p>
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-zinc-200 rotate-45" />
        </div>
      )}

      {showActions && (
        <div className="flex flex-col items-end gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <a
            href={`tel:${SALES_PHONE}`}
            className="flex items-center gap-2 bg-white rounded-full shadow-lg border border-zinc-200 pl-3.5 pr-5 py-2.5 hover:shadow-xl transition-shadow"
          >
            <span className="w-9 h-9 bg-[#D4561A] rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </span>
            <span className="text-sm font-semibold text-zinc-800">
              Call Salesperson
            </span>
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              `Hi! I need help with travel planning.\n\nPage: ${pageUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white rounded-full shadow-lg border border-zinc-200 pl-3.5 pr-5 py-2.5 hover:shadow-xl transition-shadow"
          >
            <span className="w-9 h-9 bg-[#2E8B8B] rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </span>
            <span className="text-sm font-semibold text-zinc-800">
              Chat on WhatsApp
            </span>
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setShowActions(!showActions);
          setShowTooltip(false);
        }}
        aria-label="Contact us"
        className="group relative w-16 h-16 bg-[#2E8B8B] rounded-full flex items-center justify-center shadow-xl shadow-[#2E8B8B]/30 hover:shadow-[#2E8B8B]/50 hover:scale-110 transition-all duration-300 cursor-pointer"
      >
        <div className="absolute inset-0 rounded-full bg-[#2E8B8B] animate-ping opacity-20" />
        {showActions ? (
          <X className="w-7 h-7 text-white relative z-10" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white relative z-10" />
        )}
      </button>
    </div>
  );
};

export default WhatsAppButton;
