import { redirect, notFound } from "next/navigation";
import { fetchBySlug } from "@/feature/destinations/api/public-server";
import type { Journey } from "@/feature/journey/type";

export const revalidate = 60;

type Props = { params: Promise<{ country: string; slug: string }> };

export default async function OldJourneyRedirectPage({ params }: Props) {
  const { slug } = await params;
  const journey = await fetchBySlug<Journey>("/journey/by-slug", slug);
  if (!journey) notFound();
  redirect(`/tour-packages/${journey.slug}`);
}
