import { prisma } from "../utils/prismaConnection.js";
async function main() {
  await prisma.travelExperience.update({
    where: { slug: "honeymoon" },
    data: { seoTitle: "Honeymoon Tour Packages India: Best Couples Trip" }
  });
  console.log("Updated Honeymoon seoTitle");
}
main().then(() => prisma.$disconnect());
