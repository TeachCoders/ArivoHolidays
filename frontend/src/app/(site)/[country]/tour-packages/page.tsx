import { redirect, notFound } from "next/navigation";
import { fetchBySlug } from "@/feature/destinations/api/public-server";
import type { Country } from "@/feature/country/type";

export const revalidate = 60;

type Props = { params: Promise<{ country: string }> };

export default async function OldCountryToursListingRedirect({ params }: Props) {
  const { country: slug } = await params;
  const country = await fetchBySlug<Country>("/country/by-slug", slug);
  if (!country) notFound();
  redirect(`/tour-packages/${country.slug}`);
}
