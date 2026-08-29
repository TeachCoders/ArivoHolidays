import { prisma } from '../utils/prismaConnection.js';

async function checkStates() {
  const states = await prisma.state.findMany({
    where: { isActive: true },
    select: { slug: true, title: true, seoTitle: true }
  });
  
  console.log(`=== ACTIVE STATES (${states.length}) ===`);
  states.forEach(s => {
    console.log(`${s.slug} | ${s.title} | ${s.seoTitle}`);
  });
}

checkStates().catch(console.error).finally(() => prisma.$disconnect());
