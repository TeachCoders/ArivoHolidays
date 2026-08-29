export type SeasonKey = "winter" | "spring" | "monsoon";

export const SEASON_META: Record<string, { label: string; color: string }> = {
  winter: { label: "Winter Special", color: "#2E8B8B" },
  spring: { label: "Spring", color: "#D4561A" },
  monsoon: { label: "Monsoon", color: "#5B8DEF" },
};

export const SEASON_ORDER: SeasonKey[] = ["winter", "spring", "monsoon"];

const MONTH_SHORT: Record<string, string> = {
  january: "Jan",
  february: "Feb",
  march: "Mar",
  april: "Apr",
  may: "May",
  june: "Jun",
  july: "Jul",
  august: "Aug",
  september: "Sep",
  october: "Oct",
  november: "Nov",
  december: "Dec",
};

const MONTH_INDEX: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

export function monthShort(title: string): string {
  return MONTH_SHORT[title.toLowerCase()] || title.slice(0, 3);
}

export interface SeasonGroup {
  season: SeasonKey;
  label: string;
  color: string;
  range: string;
  months: string[];
}

export function groupMonthsBySeason(
  months: { title: string; season?: string | null }[]
): SeasonGroup[] {
  const groups: Record<string, string[]> = {};
  for (const m of months) {
    const key = m.season || "winter";
    (groups[key] ||= []).push(m.title);
  }
  return SEASON_ORDER.filter((s) => groups[s]).map((season) => {
    const titles = groups[season];
    const sorted = [...titles].sort(
      (a, b) => (MONTH_INDEX[a.toLowerCase()] || 13) - (MONTH_INDEX[b.toLowerCase()] || 13)
    );
    const range = sorted.length
      ? `${monthShort(sorted[0])} - ${monthShort(sorted[sorted.length - 1])}`
      : "";
    return {
      season,
      label: SEASON_META[season]?.label || season,
      color: SEASON_META[season]?.color || "#2E8B8B",
      range,
      months: titles,
    };
  });
}
