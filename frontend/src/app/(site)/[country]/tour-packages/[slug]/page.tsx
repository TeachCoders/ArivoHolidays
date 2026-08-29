import type { Metadata } from "next";
import JourneyDetail from "@/feature/journey/components/JourneyDetail";
import { fetchBySlug } from "@/feature/destinations/api/public-server";
import JsonLd from "@/components/shared/JsonLd";
import { breadcrumbSchema, productSchema, faqSchema } from "@/lib/jsonLd";
import { stripHtml } from "@/lib/utils";
import type { Journey } from "@/feature/journey/type";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const journey = await fetchBySlug<Journey>("/journey/by-slug", slug);
  if (!journey) return { title: "Tour Package Not Found | Arivo Holiday" };
  const countrySlug = journey.cities?.[0]?.state?.country?.slug;
  const title = journey.seoTitle || journey.title;
  const seoDescription = stripHtml(
    journey.seoDescription || journey.overView
  ).slice(0, 160);
  const canonical =
    journey.canonical ||
    (countrySlug
      ? `/${countrySlug}/tour-packages/${journey.slug}`
      : `/tour-packages/${journey.slug}`);
  return {
    title,
    description: seoDescription,
    keywords: journey.seoKeyword,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description: seoDescription,
      url: canonical,
      images: journey.thumbImg ? [{ url: journey.thumbImg, alt: journey.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seoDescription,
      images: journey.thumbImg ? [journey.thumbImg] : undefined,
    },
  };
}

export default async function JourneyPackagePage({ params }: Props) {
  const { slug } = await params;
  const journey = await fetchBySlug<Journey>("/journey/by-slug", slug);
  const countrySlug = journey?.cities?.[0]?.state?.country?.slug;
  const countryTitle = journey?.cities?.[0]?.state?.country?.title;
  const canonical =
    journey?.canonical ||
    (countrySlug
      ? `/${countrySlug}/tour-packages/${slug}`
      : `/tour-packages/${slug}`);

  const schema = journey
    ? [
        productSchema({
          name: journey.title,
          description: journey.seoDescription || journey.overView || undefined,
          image: journey.thumbImg || undefined,
          price: journey.discountPrice ?? journey.pricePerPerson ?? 0,
          originalPrice:
            journey.discountPrice && journey.discountPrice < (journey.pricePerPerson || 0)
              ? journey.pricePerPerson
              : undefined,
          url: canonical,
        }),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: countryTitle || "Tour Packages", path: countrySlug ? `/${countrySlug}/tour-packages` : "/packages" },
          { name: journey.title, path: canonical },
        ]),
        ...(journey.faqs && journey.faqs.length > 0
          ? [faqSchema(journey.faqs.map(f => ({ question: f.ques, answer: f.ans })))]
          : []),
      ]
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {schema.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <main className="flex-1">
        <JourneyDetail slug={slug} initialJourney={journey} />
      </main>
    </div>
  );
}
