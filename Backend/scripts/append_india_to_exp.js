import { prisma } from "../utils/prismaConnection.js";

async function main() {
  console.log("Appending 'India' to Travel Experience Tags...");
  
  const banners = await prisma.banner.findMany({
    where: { entityType: "TravelExperience" }
  });

  for (const banner of banners) {
    let tag = banner.bannerTag;
    
    if (!tag.toLowerCase().includes("india")) {
      if (tag === "Relax on Pristine Beaches") tag = "Relax on Pristine Beaches of India";
      else if (tag === "Escape to the Himalayas") tag = "Escape to the Himalayas of India";
      else if (tag === "Experience the Great Thar Desert") tag = "Experience the Great Thar Desert of India";
      else tag = tag + " in India";
      
      await prisma.banner.update({
        where: { id: banner.id },
        data: {
          bannerTag: tag
        }
      });
      console.log(`Updated -> ${tag}`);
    }
  }
  
  console.log("Successfully added 'India' to all Travel Experience Tags!");
}

main().then(() => prisma.$disconnect()).catch(console.error);
