import DestinationCard from "@/components/shared/DestinationCard";
import type { City } from "@/feature/city/type";

export default function CityCard({
  city,
  stateSlug,
  countrySlug,
  journeyCount,
  fallbackImage,
}: {
  city: Partial<City>;
  stateSlug: string;
  countrySlug?: string;
  journeyCount?: number;
  fallbackImage?: string;
}) {
  const journeys = city._count?.journeys ?? city.journeys?.length ?? journeyCount ?? 0;
  const country = countrySlug ?? city.state?.country?.slug;
  const href = country
    ? `/tour-packages/${country}/${stateSlug}/${city.slug}`
    : `/tour-packages/${stateSlug}/${city.slug}`;

  return (
    <DestinationCard
      title={city.title ?? ""}
      image={city.thumbImg ?? fallbackImage}
      subtitle={`${journeys} ${journeys === 1 ? 'Tour Package' : 'Tour Packages'}`}
      tag={journeys >= 5 ? "Popular Circuit" : undefined}
      href={href}
    />
  );
}
