import type { Metadata } from "next";
import TourPackagesList from "@/feature/journey/components/TourPackagesList";
import { fetchJourneys, fetchCountryBySlug } from "@/feature/journey/public-server";
import JsonLd from "@/components/shared/JsonLd";
import { itemListSchema, breadcrumbSchema } from "@/lib/jsonLd";
import { journeyPackageHref } from "@/feature/journey/filterOptions";

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const title = `${country} Tour Packages | Arivo Holiday`;
  const seoDescription = `Browse all-inclusive ${country} tour packages, holiday itineraries, and vacation deals.`;
  return {
    title,
    description: seoDescription,
    alternates: { canonical: `/${country}/tour-packages` },
    openGraph: {
      type: "website",
      title,
      description: seoDescription,
      url: `/${country}/tour-packages`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seoDescription,
    },
  };
}

export default async function CountryTourPackagesPage({ params }: Props) {
  const { country } = await params;
  const [initialCountry, initialJourneys] = await Promise.all([
    fetchCountryBySlug(country),
    fetchJourneys(),
  ]);
  const schema = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: initialCountry?.title || country, path: `/${country}` },
      { name: "Tour Packages", path: `/${country}/tour-packages` },
    ]),
    ...(initialJourneys && initialJourneys.length > 0
      ? [
          itemListSchema(
            initialJourneys.map((j) => ({
              name: j.title,
              url: journeyPackageHref(j),
            }))
          ),
        ]
      : []),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {schema.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <main className="flex-1">
        <TourPackagesList
          countrySlug={country}
          initialCountry={initialCountry}
          initialJourneys={initialJourneys}
        />
      </main>
    </div>
  );
}
