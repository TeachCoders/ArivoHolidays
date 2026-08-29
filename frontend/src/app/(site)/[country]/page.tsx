import type { Metadata } from "next";
import CountryDetail from "@/feature/destinations/components/CountryDetail";
import CmsFallbackPage from "@/feature/cms/components/CmsFallbackPage";
import JsonLd from "@/components/shared/JsonLd";
import { breadcrumbSchema, touristDestinationSchema } from "@/lib/jsonLd";
import { fetchBySlug, fetchPublicJson } from "@/feature/destinations/api/public-server";
import { stripHtml } from "@/lib/utils";
import type { Country } from "@/feature/country/type";
import type { State, PaginatedResponse as StatePage } from "@/feature/state/type";
import type { Journey, PaginatedResponse as JourneyPage } from "@/feature/journey/type";
import type { CmsPage } from "@/feature/cms/type";

export const revalidate = 60;

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const data = await fetchBySlug<Country>("/country/by-slug", country);
  if (!data) {
    const cms = await fetchBySlug<CmsPage>("/cms/by-slug", country);
    if (cms) {
      const seoDescription = stripHtml(cms.seoDescription || cms.moreDescription || "").slice(0, 160);
      return {
        title: cms.seoTitle || cms.title,
        description: seoDescription || undefined,
        keywords: cms.seoKeyword || undefined,
        alternates: { canonical: cms.canonical || `/${cms.slug}` },
      };
    }
    return { title: "Page Not Found | Arivo Holiday" };
  }
  const title = data?.title?.replace(/\s*Tour$/i, "") || data?.title || country;
  const seoDescription = stripHtml(data?.seoDescription || data?.overView) || undefined;
  const canonical = data?.canonical || `/${country}`;
  return {
    title: title,
    description: seoDescription,
    keywords: data?.seoKeyword,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: title,
      description: seoDescription,
      url: canonical,
      images: data?.thumbImg ? [{ url: data.thumbImg, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: seoDescription,
      images: data?.thumbImg ? [data.thumbImg] : undefined,
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { country } = await params;
  const data = await fetchBySlug<Country>("/country/by-slug", country);
  if (!data) {
    return <CmsFallbackPage slug={country} />;
  }
  const [initialStates, initialJourneys] = await Promise.all([
    data
      ? fetchPublicJson<StatePage<State>>(`/state?limit=100&countryId=${data.id}`)
      : null,
    fetchPublicJson<JourneyPage<Journey>>("/journey?limit=100&isActive=true"),
  ]);
  
  const schema = data
    ? [
        touristDestinationSchema({
          name: data.title,
          description: data.seoDescription || data.overView || undefined,
          image: data.thumbImg || undefined,
          url: data.canonical || `/${data.slug}`,
        }),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: data.title, path: `/${data.slug}` },
        ]),
      ]
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {schema.map((s, i) => (
        <JsonLd key={i} data={s} />
      ))}
      <main className="flex-1">
        <CountryDetail
          slug={country}
          initialCountry={data}
          initialStates={initialStates}
          initialJourneys={initialJourneys}
        />
      </main>
    </div>
  );
}
