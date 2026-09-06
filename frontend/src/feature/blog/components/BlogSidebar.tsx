import Link from "next/link";
import { Search, CalendarDays, Tag, ArrowRight, Sparkles } from "lucide-react";
import type { BlogPost } from "@/feature/blog/type";
import { SERVER_API_BASE } from "@/feature/destinations/api/public-server";
import { journeyPackageHref } from "@/feature/journey/filterOptions";
import { FallbackImage } from "@/components/shared/FallbackImage";
import { QuoteModal } from "@/components/shared/QuoteModal";

const FALLBACK_IMAGE = "/destinationImage/image/agra-6.webp";

async function fetchRecent(excludeId?: number): Promise<BlogPost[]> {
  try {
    const url = `${SERVER_API_BASE}/blog?limit=6&isActive=true`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data || []).filter((p: BlogPost) => p.id !== excludeId).slice(0, 5);
  } catch {
    return [];
  }
}

async function fetchTopJourneys(): Promise<any[]> {
  try {
    const url = `${SERVER_API_BASE}/journey?limit=100&isActive=true`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    let journeys = json?.data || [];
    journeys = journeys.filter((j: any) => (j.displayOrder ?? 0) > 0);
    journeys.sort((a: any, b: any) => (a.displayOrder ?? Number.MAX_SAFE_INTEGER) - (b.displayOrder ?? Number.MAX_SAFE_INTEGER));
    return journeys.slice(0, 10);
  } catch {
    return [];
  }
}

export default async function BlogSidebar({
  excludeId,
  tags,
}: {
  excludeId?: number;
  tags?: string[];
}) {
  const recent = await fetchRecent(excludeId);
  const topJourneys = await fetchTopJourneys();

  return (
    <aside className="space-y-8">
      {/* ===== SEARCH ===== */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <h3 className="font-heading text-lg font-extrabold text-[#1C1C1C] mb-5 flex items-center gap-2">
          Search
        </h3>
        <form action="/blog" method="GET" className="relative">
          <input
            type="text"
            name="search"
            placeholder="Search articles..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-[#2E8B8B] focus:ring-4 focus:ring-[#2E8B8B]/10 focus:bg-white"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </form>
      </div>

      {/* ===== PLAN MY TRIP CTA CARD ===== */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#D4561A]/30 blur-2xl pointer-events-none" />
        <span className="text-[11px] font-black uppercase tracking-widest text-[#F5B041] mb-2 block">
          Customized Holiday Tour
        </span>
        <h4 className="font-heading text-xl font-extrabold text-white leading-snug">
          Planning a Trip to India?
        </h4>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          Get 100% customized tour itineraries with private cabs, handpicked hotels & 24/7 on-trip assistance.
        </p>
        <div className="mt-6">
          <QuoteModal>
            <button
              type="button"
              className="w-full btn-primary py-3 px-5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4561A]/30 active:scale-95 transition-all"
            >
              <Sparkles size={16} />
              <span>Get Free Itinerary Quote</span>
            </button>
          </QuoteModal>
        </div>
      </div>

      {/* ===== TAGS ===== */}
      {tags && tags.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <h3 className="font-heading text-lg font-extrabold text-[#1C1C1C] mb-5">Tags</h3>
          <div className="flex flex-wrap gap-2.5">
            {tags.map((t) => (
              <Link
                key={t}
                href={`/blog?search=${encodeURIComponent(t)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#2E8B8B] bg-[#2E8B8B]/5 border border-[#2E8B8B]/10 rounded-full transition-all hover:bg-[#2E8B8B] hover:text-white hover:shadow-md hover:-translate-y-0.5"
              >
                <Tag size={12} /> {t}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ===== TOP 10 TOUR PACKAGES ===== */}
      {topJourneys.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <h3 className="font-heading text-xs font-black uppercase tracking-[0.2em] text-[#2E8B8B] mb-5 flex items-center justify-between">
            Top 10 Tour Packages
            <span className="text-[10px] font-black text-[#D4561A] bg-[#D4561A]/10 px-2.5 py-0.5 rounded-full">
              {topJourneys.length}
            </span>
          </h3>
          <ol className="mt-2 space-y-1">
            {topJourneys.map((j, i) => (
              <li key={j.id}>
                <Link
                  href={journeyPackageHref(j)}
                  className="flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <span className="mt-[2px] w-[26px] h-[26px] shrink-0 rounded-full bg-slate-100 text-[#1C1C1C] text-[11px] font-black flex items-center justify-center group-hover:bg-[#2E8B8B] group-hover:text-white transition-colors shadow-sm">
                    {i + 1}
                  </span>
                  <span className="text-[14px] font-bold text-slate-700 group-hover:text-[#2E8B8B] transition-colors leading-relaxed line-clamp-2">
                    {j.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ===== RECENT POSTS ===== */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <h3 className="font-heading text-lg font-extrabold text-[#1C1C1C] mb-6">Recent Articles</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium">No posts yet.</p>
        ) : (
          <ul className="flex flex-col gap-6">
            {recent.map((p) => (
              <li key={p.id} className="group">
                <Link
                  href={`/blog/${p.slug}`}
                  className="flex items-center gap-4"
                >
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-100 bg-slate-100">
                    <FallbackImage
                      src={p.thumbImg}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/5 transition-opacity group-hover:opacity-0" />
                  </div>
                  
                  <div className="flex flex-col justify-center">
                    {p.publishedAt && (
                      <p className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <CalendarDays size={12} /> {p.publishedAt}
                      </p>
                    )}
                    <p className="text-[14px] font-bold text-[#1C1C1C] leading-snug transition-colors group-hover:text-[#2E8B8B] line-clamp-2">
                      {p.title}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
