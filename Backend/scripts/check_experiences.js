import { prisma } from "../utils/prismaConnection.js";
async function main() {
  const exps = await prisma.travelExperience.findMany({ select: { id: true, title: true, slug: true } });
  console.log("Experiences:", JSON.stringify(exps, null, 2));
}
main().then(() => prisma.$disconnect());
