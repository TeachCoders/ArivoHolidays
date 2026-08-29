import { prisma } from "../utils/prismaConnection.js";
async function main() {
  const banners = await prisma.banner.findMany({ where: { entityType: "TravelExperience" } });
  console.log("TravelExperience Banners:", banners.length);
  if(banners.length > 0) {
    console.log(banners[0]);
  }
}
main().then(() => prisma.$disconnect());
