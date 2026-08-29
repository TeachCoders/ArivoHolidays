// Backend/populateCanonicalUrls.js
// Backfill absolute canonical URLs for content entities where canonical is null/empty.
// Idempotent: only touches records with empty canonical.
import { prisma } from "../utils/prismaConnection.js";

const SITE_URL = (process.env.SITE_URL || "https://arivoholidays.com").replace(/\/$/, "");

function needsBackfill(canonical) {
  return !canonical || canonical.trim() === "";
}

async function main() {
  let total = 0;

  const journeys = await prisma.journey.findMany({
    include: { cities: { include: { state: { include: { country: true } } } } },
  });
  let count = 0;
  for (const j of journeys) {
    if (!needsBackfill(j.canonical)) continue;
    const firstCityId = Array.isArray(j.cityOrder) && j.cityOrder.length ? j.cityOrder[0] : null;
    const firstCity = firstCityId ? j.cities.find((c) => c.id === firstCityId) : j.cities[0];
    const countrySlug = firstCity?.state?.country?.slug;
    const path = countrySlug ? `/${countrySlug}/tour-packages/${j.slug}` : `/tour-packages/${j.slug}`;
    await prisma.journey.update({ where: { id: j.id }, data: { canonical: `${SITE_URL}${path}` } });
    count++;
  }
  console.log(`Journey updated: ${count}`);
  total += count;

  const countries = await prisma.country.findMany();
  count = 0;
  for (const c of countries) {
    if (!needsBackfill(c.canonical)) continue;
    await prisma.country.update({ where: { id: c.id }, data: { canonical: `${SITE_URL}/destinations/${c.slug}` } });
    count++;
  }
  console.log(`Country updated: ${count}`);
  total += count;

  const states = await prisma.state.findMany({ include: { country: true } });
  count = 0;
  for (const s of states) {
    if (!needsBackfill(s.canonical)) continue;
    const path = s.country?.slug ? `/destinations/${s.country.slug}/${s.slug}` : `/destinations/${s.slug}`;
    await prisma.state.update({ where: { id: s.id }, data: { canonical: `${SITE_URL}${path}` } });
    count++;
  }
  console.log(`State updated: ${count}`);
  total += count;

  const cities = await prisma.city.findMany({ include: { state: { include: { country: true } } } });
  count = 0;
  for (const c of cities) {
    if (!needsBackfill(c.canonical)) continue;
    const countrySlug = c.state?.country?.slug;
    const stateSlug = c.state?.slug;
    const path = countrySlug && stateSlug ? `/destinations/${countrySlug}/${stateSlug}/${c.slug}` : `/destinations/${c.slug}`;
    await prisma.city.update({ where: { id: c.id }, data: { canonical: `${SITE_URL}${path}` } });
    count++;
  }
  console.log(`City updated: ${count}`);
  total += count;

  const travels = await prisma.travelExperience.findMany();
  count = 0;
  for (const t of travels) {
    if (!needsBackfill(t.canonical)) continue;
    await prisma.travelExperience.update({ where: { id: t.id }, data: { canonical: `${SITE_URL}/travel-experiences/${t.slug}` } });
    count++;
  }
  console.log(`TravelExperience updated: ${count}`);
  total += count;

  const cmsPages = await prisma.cmsPage.findMany();
  count = 0;
  for (const p of cmsPages) {
    if (!needsBackfill(p.canonical)) continue;
    await prisma.cmsPage.update({ where: { id: p.id }, data: { canonical: `${SITE_URL}/${p.slug}` } });
    count++;
  }
  console.log(`CmsPage updated: ${count}`);
  total += count;

  const posts = await prisma.blogPost.findMany();
  count = 0;
  for (const p of posts) {
    if (!needsBackfill(p.canonical)) continue;
    await prisma.blogPost.update({ where: { id: p.id }, data: { canonical: `${SITE_URL}/blog/${p.slug}` } });
    count++;
  }
  console.log(`BlogPost updated: ${count}`);
  total += count;

  console.log(`Total updated: ${total}`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
