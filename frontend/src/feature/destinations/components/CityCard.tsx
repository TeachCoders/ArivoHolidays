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
    ? `/${country}/${stateSlug}/${city.slug}`
    : `/${stateSlug}/${city.slug}`;

  return (
    <DestinationCard
      title={city.title ?? ""}
      image={city.thumbImg ?? fallbackImage}
      subtitle={`${journeys} Tours`}
      href={href}
    />
  );
}
