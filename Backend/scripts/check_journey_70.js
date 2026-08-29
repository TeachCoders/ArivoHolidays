import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const journey = await prisma.journey.findUnique({
    where: { id: 70 },
    include: { days: { orderBy: { dayNumber: 'asc' } } }
  });
  console.log(`Journey ID 70: ${journey?.title}`);
  console.log(`Number of days in DB: ${journey?.days?.length}`);
  if (journey?.days?.length > 0) {
    console.log(journey.days.map(d => `Day ${d.dayNumber}: ${d.title}`));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
