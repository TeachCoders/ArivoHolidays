import { prisma } from "../utils/prismaConnection.js";
async function main() {
  const banners = await prisma.banner.findMany();
  console.log("Total Banners:", banners.length);
  console.log(banners.slice(0, 3));
}
main().then(() => prisma.$disconnect());
