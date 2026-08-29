import { prisma } from "../utils/prismaConnection.js";

const naturalTags = {
  "heritage & culture": "Discover India's Royal History",
  "spiritual": "Find Peace and Inner Harmony",
  "beach & lake": "Relax on Pristine Beaches",
  "culinary (dishes / food tour)": "Taste the True Flavors of India",
  "honeymoon": "The Ultimate Romantic Getaway",
  "wildlife": "Thrilling Indian Jungle Safaris",
  "weekend tours in india": "Perfect Short Breaks in India",
  "taj mahal": "The Ultimate Symbol of Love",
  "golden triangle": "First choice of travel in India",
  "hill station": "Escape to the Himalayas",
  "ayurveda & yoga": "Rejuvenate Your Mind and Body",
  "family": "Create Unforgettable Family Memories",
  "desert safari": "Experience the Great Thar Desert"
};

async function main() {
  console.log("Updating Travel Experience Tags to Natural Slogans...");
  
  const banners = await prisma.banner.findMany({
    where: { entityType: "TravelExperience" }
  });

  for (const banner of banners) {
    const exp = await prisma.travelExperience.findUnique({
      where: { id: banner.entityId }
    });

    if (exp) {
      const tag = naturalTags[exp.title.toLowerCase()] || "Discover Incredible India";
      await prisma.banner.update({
        where: { id: banner.id },
        data: {
          bannerTag: tag
        }
      });
      console.log(`Updated [${exp.title}] -> ${tag}`);
    }
  }
  
  console.log("Successfully updated all Travel Experience Tags!");
}

main().then(() => prisma.$disconnect()).catch(console.error);
