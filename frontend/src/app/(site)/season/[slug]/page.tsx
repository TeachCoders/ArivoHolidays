import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeasonDetail from "@/feature/season/components/SeasonDetail";
import JsonLd from "@/components/shared/JsonLd";
import { breadcrumbSchema, touristDestinationSchema } from "@/lib/jsonLd";
import { fetchBySlug, fetchPublicJson } from "@/feature/destinations/api/public-server";
import { stripHtml } from "@/lib/utils";
import type { Season } from "@/feature/season/type";
import type { Journey, PaginatedResponse as JourneyPage } from "@/feature/journey/type";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function absoluteUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//.test(src)) return src;
  return `${SITE_URL}${src.startsWith("/") ? src : `/${src}`}`;
}

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const season = await fetchBySlug<Season>("/season/by-slug", slug);

  if (!season) return { title: "Page Not Found | Arivo Holiday" };

  const title = season.seoTitle || season.title;
  const seoDescription = stripHtml(season.seoDescription || season.overView || "").slice(0, 160) || undefined;
  const canonical = season.canonical || `/season/${season.slug}`;
  const ogImage = absoluteUrl(season.thumbImg || season.banner?.images?.[0]);

  return {
    title,
    description: seoDescription,
    keywords: season.seoKeyword,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description: seoDescription,
      url: canonical,
      images: ogImage ? [{ url: ogImage, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seoDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function SeasonPage({ params }: Props) {
  const { slug } = await params;
  const season = await fetchBySlug<Season>("/season/by-slug", slug);

  if (!season) return notFound();

  const initialJourneys = await fetchPublicJson<JourneyPage<Journey>>("/journey?limit=100&isActive=true");

  const schema = [
    touristDestinationSchema({
      name: season.title,
      description: season.seoDescription || season.overView || undefined,
      image: season.thumbImg || undefined,
      url: `/season/${season.slug}`,
    }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: season.title, path: `/season/${season.slug}` },
    ]),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {schema.map((s, i) => (
        <JsonLd key={i} data={s} />
      ))}
      <main className="flex-1">
        <SeasonDetail slug={season.slug} initialSeason={season} initialJourneys={initialJourneys} />
      </main>
    </div>
  );
}
