import type { Metadata } from "next";
import AllDestinations from "@/feature/destinations/components/AllDestinations";
import JsonLd from "@/components/shared/JsonLd";
import { breadcrumbSchema, itemListSchema } from "@/lib/jsonLd";
import { fetchPublicJson } from "@/feature/destinations/api/public-server";
import type { Country } from "@/feature/country/type";
import type { State } from "@/feature/state/type";
import type { City } from "@/feature/city/type";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Destinations | Arivo Holiday",
  description:
    "Explore all holiday destinations across countries, states and cities. Browse curated tour packages, hotels, cabs and travel guides across India and worldwide.",
  alternates: { canonical: "/destinations" },
  openGraph: {
    type: "website",
    title: "All Destinations | Arivo Holiday",
    description:
      "Explore all holiday destinations across countries, states and cities.",
    url: "/destinations",
  },
};

interface PageResponse<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  for (;;) {
    const res = await fetchPublicJson<PageResponse<T>>(
      `${path}?page=${page}&limit=100`
    );
    const data = res?.data ?? [];
    items.push(...data);
    const totalPages = res?.pagination?.totalPages ?? 1;
    if (page >= totalPages || data.length === 0) break;
    page += 1;
  }
  return items;
}

export default async function DestinationsPage() {
  const [countries, states, cities] = await Promise.all([
    fetchAllPages<Country>("/country"),
    fetchAllPages<State>("/state"),
    fetchAllPages<City>("/city"),
  ]);

  const countryCount = countries.length;
  const stateCount = states.length;
  const cityCount = cities.length;

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Destinations", path: "/destinations" },
  ]);

  const itemList = itemListSchema(
    countries.map((c) => ({ name: c.title, url: `/${c.slug}` }))
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f8f8] font-sans">
      <JsonLd data={breadcrumb} />
      <JsonLd data={itemList} />
      <main className="flex-1">
        <AllDestinations
          countries={countries}
          states={states}
          cities={cities}
          totals={{ countries: countryCount, states: stateCount, cities: cityCount }}
        />
      </main>
    </div>
  );
}
