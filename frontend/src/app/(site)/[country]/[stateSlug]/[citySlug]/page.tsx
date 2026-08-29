import type { Metadata } from "next";
import CityDetail from "@/feature/destinations/components/CityDetail";
import CmsFallbackPage from "@/feature/cms/components/CmsFallbackPage";
import JsonLd from "@/components/shared/JsonLd";
import { breadcrumbSchema, touristDestinationSchema } from "@/lib/jsonLd";
import { fetchBySlug, fetchPublicJson } from "@/feature/destinations/api/public-server";
import { stripHtml } from "@/lib/utils";
import type { City } from "@/feature/city/type";
import type { Journey, PaginatedResponse as JourneyPage } from "@/feature/journey/type";
import type { CmsPage } from "@/feature/cms/type";

type Props = { params: Promise<{ country: string; stateSlug: string; citySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, stateSlug, citySlug } = await params;
  const city = await fetchBySlug<City>("/city/by-slug", citySlug);
  if (!city) {
    const cms = await fetchBySlug<CmsPage>(
      "/cms/by-slug",
      `${country}/${stateSlug}/${citySlug}`
    );
    if (cms) {
      const seoDescription = stripHtml(cms.seoDescription || cms.moreDescription || "").slice(0, 160);
      return {
        title: cms.seoTitle || cms.title,
        description: seoDescription || undefined,
        keywords: cms.seoKeyword || undefined,
        alternates: { canonical: cms.canonical || `/${cms.slug}` },
      };
    }
    return { title: "Destination Not Found | Arivo Holiday" };
  }
  const title = city.seoTitle || city.title;
  const seoDescription = stripHtml(city.seoDescription || city.overView).slice(0, 160);
  const canonical =
    city.canonical ||
    (city.state?.country?.slug
      ? `/${city.state.country.slug}/${city.state.slug}/${city.slug}`
      : `/${city.state?.slug}/${city.slug}`);
  return {
    title,
    description: seoDescription,
    keywords: city.seoKeyword,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description: seoDescription,
      url: canonical,
      images: city.thumbImg ? [{ url: city.thumbImg, alt: city.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seoDescription,
      images: city.thumbImg ? [city.thumbImg] : undefined,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { country, stateSlug, citySlug } = await params;
  const city = await fetchBySlug<City>("/city/by-slug", citySlug);
  if (!city) {
    return <CmsFallbackPage slug={`${country}/${stateSlug}/${citySlug}`} />;
  }
  const initialJourneys = await fetchPublicJson<JourneyPage<Journey>>(
    "/journey?limit=100&isActive=true"
  );
  const schema = city
    ? [
        touristDestinationSchema({
          name: city.title,
          description: city.seoDescription || city.overView || undefined,
          image: city.thumbImg || undefined,
          url: city.canonical || `/${city.state?.country?.slug}/${city.state?.slug}/${city.slug}`,
        }),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          ...(city.state?.country?.slug
            ? [{ name: city.state.country.title, path: `/${city.state.country.slug}` }]
            : []),
          ...(city.state?.slug
            ? [{ name: city.state.title, path: `/${city.state.country?.slug}/${city.state.slug}` }]
            : []),
          { name: city.title, path: `/${city.state?.country?.slug}/${city.state?.slug}/${city.slug}` },
        ]),
      ]
    : [];
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {schema.map((s, i) => (
        <JsonLd key={i} data={s} />
      ))}
      <main className="flex-1">
        <CityDetail citySlug={citySlug} initialCity={city} initialJourneys={initialJourneys} />
      </main>
    </div>
  );
}
