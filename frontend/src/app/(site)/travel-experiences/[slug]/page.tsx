import type { Metadata } from "next";
import TravelExperienceDetail from "@/feature/travelExperience/components/TravelExperienceDetail";
import JsonLd from "@/components/shared/JsonLd";
import { breadcrumbSchema } from "@/lib/jsonLd";
import { fetchBySlug } from "@/feature/destinations/api/public-server";
import { stripHtml, absoluteUrl } from "@/lib/utils";
import type { TravelExperience } from "@/feature/travelExperience/type";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchBySlug<TravelExperience>("/holidays/by-slug", slug);
  if (!data) return { title: "Travel Experience Not Found | Arivo Holidays" };
  const title = data.seoTitle || data.title;
  const seoDescription = stripHtml(data.seoDescription || data.moreDescription || "").slice(0, 160);
  const canonical = canonicalFor(data, slug);
  const ogImage = absoluteUrl(data.thumbImg);
  return {
    title,
    description: seoDescription,
    keywords: data.seoKeyword,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description: seoDescription,
      url: canonical,
      images: ogImage ? [{ url: ogImage, alt: data.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seoDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function canonicalFor(
  data: { canonical?: string | null; slug: string },
  paramSlug: string
): string {
  const derived = `/travel-experiences/${data.slug || paramSlug}`;
  if (!data.canonical) return derived;
  const base = data.canonical.includes("://")
    ? data.canonical.slice(data.canonical.indexOf("/", data.canonical.indexOf("://") + 3))
    : data.canonical;
  return base.startsWith("/travel-experiences/") ? base : derived;
}

export default async function TravelExperiencePage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchBySlug<TravelExperience>("/holidays/by-slug", slug);
  const breadcrumbData = data
    ? breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Travel Experiences", path: "/travel-experiences" },
        { name: data.title, path: `/travel-experiences/${data.slug}` },
      ])
    : null;
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {breadcrumbData && <JsonLd data={breadcrumbData} />}
      <main className="flex-1">
        <TravelExperienceDetail slug={slug} initialExperience={data} />
      </main>
    </div>
  );
}
