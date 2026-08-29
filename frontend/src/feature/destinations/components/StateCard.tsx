import DestinationCard from "@/components/shared/DestinationCard";
import type { State } from "@/feature/state/type";

export default function StateCard({
  state,
  countrySlug,
  journeyCount,
}: {
  state: State;
  countrySlug?: string;
  journeyCount?: number;
}) {
  const cities = state._count?.cities ?? state.cities?.length ?? 0;
  const journeys = journeyCount ?? state.journeys?.length ?? 0;
  const country = countrySlug ?? state.country?.slug;
  const href = country
    ? `/${country}/${state.slug}`
    : `/${state.slug}`;

  return (
    <DestinationCard
      title={state.title}
      image={state.thumbImg}
      subtitle={
        <span className="inline-flex items-center justify-center gap-1.5">
          <span>{cities} Cities</span>
          <span className="opacity-60">•</span>
          <span>{journeys} Tours</span>
        </span>
      }
      href={href}
    />
  );
}
