import { prisma } from "../utils/prismaConnection.js";
async function main() {
  const journeys = await prisma.journey.findMany({
    where: {
      travelExperiences: {
        some: {
          slug: "taj-mahal"
        }
      }
    },
    select: { id: true, title: true }
  });
  console.log("Journeys mapped to Taj Mahal:", journeys);
}
main().then(() => prisma.$disconnect());
