import { prisma } from "../utils/prismaConnection.js";

async function main() {
  const experiences = await prisma.travelExperience.findMany();
  
  for (const exp of experiences) {
    let title = exp.seoTitle;
    
    // Remove " | Arivo Holiday" if it exists, since layout.tsx handles it
    title = title.replace(" | Arivo Holiday", "");
    
    // Add "India" if it's not already there
    if (!title.toLowerCase().includes("india")) {
      if (title.includes("|")) {
        const parts = title.split("|");
        title = `${parts[0].trim()} India | ${parts[1].trim()}`;
      } else if (title.includes(":")) {
        const parts = title.split(":");
        title = `${parts[0].trim()} India: ${parts[1].trim()}`;
      } else {
        title = `${title} India`;
      }
    }
    
    await prisma.travelExperience.update({
      where: { id: exp.id },
      data: { seoTitle: title }
    });
    console.log(`Updated: ${title}`);
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
