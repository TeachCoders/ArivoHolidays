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
    ? `/tour-packages/${country}/${state.slug}`
    : `/tour-packages/${state.slug}`;

  return (
    <DestinationCard
      title={state.title}
      image={state.thumbImg}
      subtitle={
        <span className="inline-flex items-center justify-center gap-1.5">
          <span>{cities} {cities === 1 ? "City" : "Cities"}</span>
          <span className="opacity-60">•</span>
          <span>{journeys} {journeys === 1 ? "Tour" : "Tours"}</span>
        </span>
      }
      href={href}
    />
  );
}
