import React from 'react';
import { Sparkles } from 'lucide-react';

interface OfferHeaderProps {
  discountBadge?: string;
}

export default function OfferHeader({ discountBadge }: OfferHeaderProps) {
  if (!discountBadge) return null;
  return (
    <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wide shadow-md">
          <Sparkles size={14} className="text-amber-400 animate-spin" />
          <span>{discountBadge}</span>
        </div>
      </div>
    </div>
  );
}
