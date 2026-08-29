import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Heart,
  Landmark,
  UtensilsCrossed,
  Flower2,
  Route,
  Mountain,
  Waves,
  Compass,
  ArrowRight,
  Crown,
} from "lucide-react";
import { stripHtml } from "@/lib/utils";
import { SERVER_API_BASE } from "@/feature/destinations/api/public-server";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Travel Experiences | Arivo Holiday",
    description:
      "Hand-picked travel experiences across India — honeymoons, heritage, culinary, yoga, nature & more. Book your perfect trip with Arivo Holiday.",
    alternates: { canonical: "/travel-experiences" },
  };
}

async function fetchExperiences() {
  const url = `${SERVER_API_BASE}/holidays?isActive=true`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch experiences");
  const json = await res.json();
  return json?.data || [];
}

async function fetchAllJourneys() {
  const url = `${SERVER_API_BASE}/journey?limit=200&isActive=true`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data || [];
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=1000&auto=format&fit=crop";

const THEMES: {
  match: string[];
  icon: React.ReactNode;
  image: string;
}[] = [
  {
    match: ["honeymoon", "couple", "romance"],
    icon: <Heart size={20} />,
    image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=1000&auto=format&fit=crop",
  },
  {
    match: ["heritage", "culture", "historical", "monument"],
    icon: <Landmark size={20} />,
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop",
  },
  {
    match: ["culinary", "food", "dishes"],
    icon: <UtensilsCrossed size={20} />,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
  },
  {
    match: ["ayurveda", "yoga", "wellness"],
    icon: <Flower2 size={20} />,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
  },
  {
    match: ["taj", "golden triangle"],
    icon: <Landmark size={20} />,
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1000&auto=format&fit=crop",
  },
  {
    match: ["spiritual", "temple", "pilgrim"],
    icon: <Sparkles size={20} />,
    image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=1000&auto=format&fit=crop",
  },
  {
    match: ["nature", "wildlife"],
    icon: <Mountain size={20} />,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop",
  },
  {
    match: ["beach", "lake"],
    icon: <Waves size={20} />,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
  },
];

function resolveTheme(title: string) {
  const t = title.toLowerCase();
  const found = THEMES.find((th) => th.match.some((m) => t.includes(m)));
  return found || { icon: <Compass size={20} />, image: FALLBACK_IMAGE };
}

export default async function TravelExperiencesPage() {
  const [experiences, journeys] = await Promise.all([
    fetchExperiences(),
    fetchAllJourneys(),
  ]);

  const real = experiences.filter(
    (e: any) => !/^test\b/i.test(e.title || "")
  );

  const tourCount = (id: number) =>
    journeys.filter((j: any) =>
      (j.travelExperiences || []).some((e: any) => e.id === id)
    ).length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <main className="flex-1 px-6 py-12 md:py-16 max-w-[1600px] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="accent-label inline-flex items-center gap-1.5">
            <Sparkles size={12} /> Curated by Arivo
          </span>
          <h1 className="font-heading text-2xl md:text-4xl font-extrabold text-[#1C1C1C] tracking-tight mt-4 leading-tight">
            Travel Experiences
          </h1>
          <p className="mt-4 text-slate-500 text-base md:text-lg leading-relaxed">
            From romantic honeymoons to soulful heritage trails — pick the vibe that matches you and let us craft the perfect trip.
          </p>
        </div>

        {real.length === 0 ? (
          <p className="text-center text-slate-500 py-20">No travel experiences yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {real.map((e: any) => {
              const theme = resolveTheme(e.title);
              const image =
                e.thumbImg || e.banner?.images?.[0] || theme.image;
              const count = tourCount(e.id);
              return (
                <Link
                  key={e.id}
                  href={`/travel-experiences/${e.slug}`}
                  className="group relative block overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_24px_60px_rgba(46,139,139,0.18)] hover:-translate-y-1.5 transition-all duration-500"
                >
                  <div className="relative h-64 md:h-72 w-full overflow-hidden">
                    <img
                      src={image}
                      alt={e.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white">
                        {theme.icon}
                      </span>
                    </div>
                    {count > 0 && (
                      <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4561A] text-white text-[11px] font-bold shadow-lg">
                        <Crown size={12} /> {count} Tours
                      </span>
                    )}
                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="font-heading text-2xl font-extrabold text-white tracking-tight drop-shadow-lg leading-snug">
                        {e.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {stripHtml(e.overView || e.seoDescription)}
                    </p>
                    <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#1C1C1C] group-hover:text-[#2E8B8B] transition-colors">
                        Explore Tours
                        <ArrowRight
                          size={16}
                          className="text-[#D4561A] transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
