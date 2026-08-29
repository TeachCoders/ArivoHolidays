"use client";

import { ChevronDown } from "lucide-react";

export default function ShowMoreButton({
  remaining,
  onClick,
}: {
  remaining: number;
  onClick: () => void;
}) {
  return (
    <div className="mt-10 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-[#D4561A] bg-[#D4561A]/5 border border-[#D4561A]/30 hover:bg-[#D4561A]/10 rounded-xl transition-colors cursor-pointer"
      >
        <ChevronDown className="w-4 h-4" />
        Show More Tours ({remaining} remaining)
      </button>
    </div>
  );
}
