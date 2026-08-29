import { fetchPublic } from "@/feature/destinations/api/public-server";
import type { Journey } from "@/feature/journey/type";
import type { Country } from "@/feature/country/type";

export async function fetchJourneys(): Promise<Journey[]> {
  const data = await fetchPublic<Journey[]>("/journey?limit=100&isActive=true");
  return data || [];
}

export async function fetchCountryBySlug(slug: string): Promise<Country | null> {
  return fetchPublic<Country>(`/country/by-slug/${encodeURIComponent(slug)}`);
}
