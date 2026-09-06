import { prisma } from './utils/prismaConnection.js';
async function main() {
  const months = await prisma.month.findMany({
    include: {}
  });
  const banners = await prisma.banner.findMany({
    where: { entityType: "Month" }
  });
  console.log(JSON.stringify(banners, null, 2));
}
main().finally(() => prisma.$disconnect());
