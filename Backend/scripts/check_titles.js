import { prisma } from '../utils/prismaConnection.js';

async function check() {
  const states = await prisma.state.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, title: true, seoTitle: true }
  });
  console.log("=== STATES ===");
  states.filter(s => s.seoTitle?.includes("Best Places")).forEach(s => console.log(`${s.slug} | ${s.title} | ${s.seoTitle}`));

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, title: true, seoTitle: true }
  });
  console.log("\n=== CITIES ===");
  cities.filter(c => c.seoTitle?.includes("Best Places") || !c.seoTitle || c.seoTitle.trim() === '').forEach(c => console.log(`${c.slug} | ${c.title} | ${c.seoTitle}`));
}

check().catch(console.error).finally(() => prisma.$disconnect());
