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
  console.log("Updating Travel Experience Banners...");
  
  const banners = await prisma.banner.findMany({
    where: { entityType: "TravelExperience" }
  });

  for (const banner of banners) {
    const exp = await prisma.travelExperience.findUnique({
      where: { id: banner.entityId }
    });

    if (exp) {
      const tag = experienceTags[exp.title.toLowerCase()] || "Incredible India";
      await prisma.banner.update({
        where: { id: banner.id },
        data: {
          bannerTitle: exp.title,
          bannerTag: tag
        }
      });
      console.log(`Updated [${exp.title}] -> ${tag}`);
    }
  }
  
  console.log(`Updated ${banners.length} Travel Experience Banners!`);
}

main().then(() => prisma.$disconnect()).catch(console.error);
