import { prisma } from '../utils/prismaConnection.js';

async function checkAll() {
  const exps = await prisma.travelExperience.findMany({
    where: { isActive: true },
    select: { title: true, seoTitle: true }
  });
  console.log("=== TRAVEL EXPERIENCES ===");
  exps.forEach(e => console.log(`${e.title} | ${e.seoTitle}`));
}
checkAll().catch(console.error).finally(() => prisma.$disconnect());
