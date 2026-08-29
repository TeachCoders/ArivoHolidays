import { prisma } from '../utils/prismaConnection.js';

async function checkRajasthan() {
  const cities = await prisma.city.findMany({
    where: { 
      slug: { in: ['jaipur', 'udaipur', 'pushkar', 'jodhpur', 'jaisalmer'] } 
    },
    select: { slug: true, overView: true }
  });
  
  console.log("=== RAJASTHAN CITIES OVERVIEW ===");
  cities.forEach(c => {
    console.log(`\n--- ${c.slug} ---`);
    console.log(c.overView);
  });
}

checkRajasthan().catch(console.error).finally(() => prisma.$disconnect());
