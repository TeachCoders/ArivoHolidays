"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  createPageUrl?: (page: number) => string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, createPageUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const baseClasses =
    "inline-flex items-center justify-center min-w-10 h-10 px-3 text-sm font-semibold rounded-xl border transition-colors cursor-pointer";
  const disabledClasses = "opacity-40 cursor-not-allowed pointer-events-none";

  const renderItem = (pageNumber: number, content: React.ReactNode, isActive: boolean = false, isDisabled: boolean = false, ariaLabel?: string) => {
    const className = cn(
      baseClasses,
      isDisabled && disabledClasses,
      isActive
        ? "bg-[#D4561A] border-[#D4561A] text-white"
        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
    );

    if (createPageUrl && !isDisabled) {
      return (
        <Link href={createPageUrl(pageNumber)} scroll={false} aria-label={ariaLabel} aria-current={isActive ? "page" : undefined} className={className}>
          {content}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onPageChange?.(pageNumber)}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-current={isActive ? "page" : undefined}
        className={className}
      >
        {content}
      </button>
    );
  };

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {renderItem(currentPage - 1, <ChevronLeft className="w-4 h-4" />, false, currentPage === 1, "Previous page")}

      {pages.map((p) => (
        <React.Fragment key={p}>
          {renderItem(p, p, p === currentPage, false)}
        </React.Fragment>
      ))}

      {renderItem(currentPage + 1, <ChevronRight className="w-4 h-4" />, false, currentPage === totalPages, "Next page")}
    </div>
  );
}
