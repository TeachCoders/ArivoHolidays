import { prisma } from '../utils/prismaConnection.js';

async function checkJourneys() {
  const journeys = await prisma.journey.findMany({
    where: { isActive: true },
    select: { slug: true, title: true, seoTitle: true }
  });
  
  console.log("=== JOURNEYS WITH MISSING SEO TITLES ===");
  journeys
    .filter(j => !j.seoTitle || j.seoTitle.trim() === '')
    .forEach(j => console.log(`${j.slug} | ${j.title}`));
}

checkJourneys().catch(console.error).finally(() => prisma.$disconnect());
