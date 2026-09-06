import type { Journey } from "@/feature/journey/type";

export function journeyPackageHref(journey: Journey): string {
  return `/tour-packages/${journey.slug}`;
}

export const DURATION_BUCKETS = [
  { id: "1-3", label: "Weekend (1-3 days)", min: 1, max: 3 },
  { id: "4-6", label: "Short Trip (4-6 days)", min: 4, max: 6 },
  { id: "7-10", label: "Week Long (7-10 days)", min: 7, max: 10 },
  { id: "11+", label: "Extended (11+ days)", min: 11, max: Infinity },
];

export function travelExperienceOptions(journeys: Journey[]) {
  const map = new Map<string, { value: string; label: string; count: number }>();
  for (const j of journeys) {
    for (const exp of j.travelExperiences ?? []) {
      const entry = map.get(exp.title);
      if (entry) entry.count += 1;
      else map.set(exp.title, { value: exp.title, label: exp.title, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function durationOptions(journeys: Journey[]) {
  return DURATION_BUCKETS.map((b) => ({
    value: b.id,
    label: b.label,
    count: journeys.filter(
      (j) => (j.noDays || 0) >= b.min && (j.noDays || 0) <= b.max
    ).length,
  }));
}

export function journeyMatchesDuration(j: Journey, selected: string[]) {
  if (selected.length === 0) return true;
  return selected.some((id) => {
    const b = DURATION_BUCKETS.find((x) => x.id === id);
    return b && (j.noDays || 0) >= b.min && (j.noDays || 0) <= b.max;
  });
}

export function journeyMatchesExperiences(j: Journey, selected: string[]) {
  if (selected.length === 0) return true;
  const titles = new Set((j.travelExperiences ?? []).map((e) => e.title));
  return selected.some((t) => titles.has(t));
}

export function cityOptions(
  journeys: Journey[],
  cityFilter?: (city: NonNullable<Journey["cities"]>[number]) => boolean
) {
  const map = new Map<number, { value: string; label: string; count: number }>();
  for (const j of journeys) {
    for (const c of j.cities ?? []) {
      if (cityFilter && !cityFilter(c)) continue;
      const entry = map.get(c.id);
      if (entry) entry.count += 1;
      else map.set(c.id, { value: String(c.id), label: c.title, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function journeyMatchesCities(j: Journey, selected: string[]) {
  if (selected.length === 0) return true;
  const ids = new Set((j.cities ?? []).map((c) => String(c.id)));
  return selected.some((id) => ids.has(id));
}

export function seasonOptions(journeys: Journey[]) {
  const map = new Map<string, { value: string; label: string; count: number }>();
  for (const j of journeys) {
    for (const m of j.months ?? []) {
      const label = m.season ? `${m.title} (${m.season})` : m.title;
      const entry = map.get(m.title);
      if (entry) entry.count += 1;
      else map.set(m.title, { value: m.title, label, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function journeyMatchesSeasons(j: Journey, selected: string[]) {
  if (selected.length === 0) return true;
  const seasonsAndMonths = new Set<string>();
  for (const m of j.months ?? []) {
    seasonsAndMonths.add(m.title.toLowerCase());
    if (m.season) seasonsAndMonths.add(m.season.toLowerCase());
    if (m.slug) seasonsAndMonths.add(m.slug.toLowerCase());
  }
  return selected.some((s) => seasonsAndMonths.has(s.toLowerCase()));
}

