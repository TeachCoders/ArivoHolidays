import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() {
  const states = await prisma.state.findMany({ select: { title: true, seoTitle: true } });
  console.log("States:", JSON.stringify(states, null, 2));
  const countries = await prisma.country.findMany({ select: { title: true, seoTitle: true } });
  console.log("Countries:", JSON.stringify(countries, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
