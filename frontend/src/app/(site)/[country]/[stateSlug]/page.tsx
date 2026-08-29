import type { Metadata } from "next";
import StateDetail from "@/feature/destinations/components/StateDetail";
import CmsFallbackPage from "@/feature/cms/components/CmsFallbackPage";
import JsonLd from "@/components/shared/JsonLd";
import { breadcrumbSchema, touristDestinationSchema } from "@/lib/jsonLd";
import { fetchBySlug, fetchPublicJson } from "@/feature/destinations/api/public-server";
import { stripHtml } from "@/lib/utils";
import type { State } from "@/feature/state/type";
import type { Journey, PaginatedResponse } from "@/feature/journey/type";
import type { CmsPage } from "@/feature/cms/type";

type Props = { params: Promise<{ country: string; stateSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, stateSlug } = await params;
  const state = await fetchBySlug<State>("/state/by-slug", stateSlug);
  if (!state) {
    const cms = await fetchBySlug<CmsPage>("/cms/by-slug", `${country}/${stateSlug}`);
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
  const title = state.seoTitle || state.title;
  const seoDescription = stripHtml(state.seoDescription || state.overView).slice(0, 160);
  const canonical =
    state.canonical ||
    (state.country?.slug
      ? `/${state.country.slug}/${state.slug}`
      : `/${state.slug}`);
  return {
    title,
    description: seoDescription,
    keywords: state.seoKeyword,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description: seoDescription,
      url: canonical,
      images: state.thumbImg ? [{ url: state.thumbImg, alt: state.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seoDescription,
      images: state.thumbImg ? [state.thumbImg] : undefined,
    },
  };
}

export default async function StatePage({ params }: Props) {
  const { country, stateSlug } = await params;
  const state = await fetchBySlug<State>("/state/by-slug", stateSlug);
  if (!state) {
    return <CmsFallbackPage slug={`${country}/${stateSlug}`} />;
  }
  const initialJourneys =
    state?.journeys && state.journeys.length > 0
      ? null
      : await fetchPublicJson<PaginatedResponse<Journey>>(
          "/journey?limit=100&isActive=true"
        );
  const schema = state
    ? [
        touristDestinationSchema({
          name: state.title,
          description: state.seoDescription || state.overView || undefined,
          image: state.thumbImg || undefined,
          url: state.canonical || `/${state.country?.slug}/${state.slug}`,
        }),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          ...(state.country?.slug
            ? [{ name: state.country.title, path: `/${state.country.slug}` }]
            : []),
          { name: state.title, path: `/${state.country?.slug}/${state.slug}` },
        ]),
      ]
    : [];
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {schema.map((s, i) => (
        <JsonLd key={i} data={s} />
      ))}
      <main className="flex-1">
        <StateDetail slug={stateSlug} initialState={state} initialJourneys={initialJourneys} />
      </main>
    </div>
  );
}
