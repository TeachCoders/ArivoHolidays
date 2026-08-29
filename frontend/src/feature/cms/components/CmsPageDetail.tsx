import Link from "next/link";
import { ChevronRight } from "lucide-react";
import RichContent from "@/components/shared/RichContent";
import TrackMissingContent from "@/components/shared/TrackMissingContent";
import type { CmsPage } from "@/feature/cms/type";

export default function CmsPageDetail({ page }: { page: CmsPage }) {
  const title = page.h1Title || page.title;
  const hasThumb = Boolean(page.thumbImg);
  const hasContent = Boolean(page.seoDescription) || Boolean(page.moreDescription);

  return (
    <div>
      {/* Track rendered-but-empty pages (data not found) under 404 analytics */}
      {!hasContent && <TrackMissingContent />}
      {/* ===== HERO / HEADER ===== */}
      <section
        className={`relative ${hasThumb ? "h-[360px] md:h-[440px]" : "bg-[#1C1C1C]"} overflow-hidden`}
      >
        {hasThumb ? (
          <>
            <img
              src={page.thumbImg}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30" />
          </>
        ) : (
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='white' stroke-width='0.5'%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3Ccircle cx='40' cy='40' r='18'/%3E%3Cpath d='M40 12 L40 4 M40 68 L40 76 M12 40 L4 40 M68 40 L76 40'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        )}

        <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 h-full flex flex-col justify-center">
          <nav className="flex flex-wrap items-center gap-1.5 text-white/70 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-white/95">{title}</span>
          </nav>
          {page.h1Title && (
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg max-w-3xl">
            {page.h1Title}
          </h1>
          )}
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <section className="max-w-[900px] mx-auto px-6 sm:px-8 lg:px-10 py-14 md:py-20">
        {page.seoDescription && (
          <RichContent
            html={page.seoDescription}
            className="text-[15px] text-[#555] leading-relaxed [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-[#555]"
          />
        )}

        {page.moreDescription && (
          <div className="mt-10">
            <RichContent html={page.moreDescription} />
          </div>
        )}

        <div className="mt-14 pt-8 border-t border-slate-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E8B8B] hover:text-[#D4561A] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
