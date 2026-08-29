import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const banners = await prisma.banner.findMany({
    where: { entityType: 'State' },
  });
  console.log("State Banners:", JSON.stringify(banners, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
