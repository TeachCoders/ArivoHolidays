"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppWidget() {
  const whatsappNumber = "919876543210"; // Official WhatsApp
  const message = "Hi Arivo Holidays, I want to inquire about a custom holiday tour package.";

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="hidden md:flex fixed bottom-8 right-8 z-40 items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-3 px-4 rounded-full shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-300 group border border-emerald-400/40"
    >
      <MessageCircle size={22} className="fill-white text-emerald-500" />
      <span>Chat with Travel Expert</span>
    </a>
  );
}
