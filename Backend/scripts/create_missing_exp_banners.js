import { prisma } from "../utils/prismaConnection.js";

const experienceTags = {
  "heritage & culture": "Explore Rich Heritage",
  "spiritual": "Journey to Tranquility",
  "beach & lake": "Sun, Sand & Sea",
  "culinary (dishes / food tour)": "Taste of India",
  "honeymoon": "Romantic Couples Getaway",
  "wildlife": "Thrilling Jungle Safari",
  "weekend tours in india": "The Perfect Getaway",
  "taj mahal": "Symbol of Love",
  "golden triangle": "India's Golden Route",
  "hill station": "Majestic Mountain Escape",
  "ayurveda & yoga": "Relax and Rejuvenate",
  "family": "Memories Await You",
  "desert safari": "Golden Sand Dunes"
};

async function main() {
  console.log("Creating missing Travel Experience Banners...");
  
  const experiences = await prisma.travelExperience.findMany();
  let createdCount = 0;

  for (const exp of experiences) {
    const existingBanner = await prisma.banner.findFirst({
      where: {
        entityType: "TravelExperience",
        entityId: exp.id
      }
    });

    if (!existingBanner) {
      const tag = experienceTags[exp.title.toLowerCase()] || "Incredible India";
      
      await prisma.banner.create({
        data: {
          images: [], // Empty array since we don't have images yet
          bannerTitle: exp.title,
          bannerTag: tag,
          entityType: "TravelExperience",
          entityId: exp.id
        }
      });
      console.log(`Created Banner for: [${exp.title}] -> ${tag}`);
      createdCount++;
    }
  }
  
  console.log(`Successfully created ${createdCount} missing Travel Experience Banners!`);
}

main().then(() => prisma.$disconnect()).catch(console.error);
