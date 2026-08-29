import { fetchPublic } from "@/feature/destinations/api/public-server";

export interface PublicTourPackage {
  id: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  bannerImageUrl?: string[] | string;
  destination?: string;
  duration?: string;
  pricePerPerson?: number;
  discountPrice?: number;
  isBestSelling?: boolean;
  purchaseCount?: number;
  itinerary?: { day: number; title: string; content: string }[];
  hotelDetails?: unknown[];
  carDetails?: unknown[];
  guideDetails?: unknown[];
  includes?: string[];
  excludes?: string[];
}

export async function fetchPackages(): Promise<PublicTourPackage[]> {
  const data = await fetchPublic<{ data: PublicTourPackage[] }>("/tour-packages?limit=100");
  return data?.data || [];
}

export async function fetchPackageBySlug(slug: string): Promise<PublicTourPackage | null> {
  return fetchPublic<PublicTourPackage>(`/tour-packages/by-slug/${encodeURIComponent(slug)}`);
}
