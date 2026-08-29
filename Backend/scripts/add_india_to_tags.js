import { prisma } from "../utils/prismaConnection.js";

async function main() {
  const banners = await prisma.banner.findMany();
  let updatedCount = 0;

  for (const banner of banners) {
    let tag = banner.bannerTag;
    
    // Only append if it doesn't already have 'India'
    if (!tag.toLowerCase().includes("india") && !tag.toLowerCase().includes("indian")) {
      
      // Some grammatically correct mappings
      if (tag === "God's Own Country") tag = "God's Own Country, India";
      else if (tag === "Heaven on Earth") tag = "Heaven on Earth in India";
      else if (tag === "Home of Taj Mahal") tag = "Home of Taj Mahal, India";
      else if (tag.includes("City")) tag = tag + " of India";
      else if (tag.includes("Capital")) tag = tag + " of India";
      else if (tag.includes("State")) tag = tag + " of India";
      else tag = tag + " in India";
      
      await prisma.banner.update({
        where: { id: banner.id },
        data: { bannerTag: tag }
      });
      console.log(`Appended India: ${banner.bannerTag} -> ${tag}`);
      updatedCount++;
    }
  }

  console.log(`Added 'India' to ${updatedCount} banners!`);
}

main().then(() => prisma.$disconnect()).catch(console.error);
