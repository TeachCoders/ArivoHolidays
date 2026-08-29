import { prisma } from "../utils/prismaConnection.js";
async function main() {
  const cities = await prisma.city.findMany({ select: { title: true } });
  console.log(cities.map(c => c.title).join(", "));
}
main().then(() => prisma.$disconnect());
