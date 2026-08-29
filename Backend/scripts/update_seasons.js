import { prisma } from '../utils/prismaConnection.js';

async function run() {
  console.log("Deleting existing months...");
  await prisma.month.deleteMany({});
  
  const seasons = [
    { title: "☀️ Summer (April - June)", slug: "summer", seoDescription: "Summer travel season from April to June." },
    { title: "🌧️ Monsoon (July - September)", slug: "monsoon", seoDescription: "Monsoon travel season from July to September." },
    { title: "❄️ Winter (November - February)", slug: "winter", seoDescription: "Winter travel season from November to February." },
    { title: "🌸 Spring (February - March)", slug: "spring", seoDescription: "Spring travel season from February to March." }
  ];

  console.log("Inserting seasons...");
  for (let i = 0; i < seasons.length; i++) {
    await prisma.month.create({
      data: {
        ...seasons[i],
        displayOrder: i + 1,
        season: "winter", // just a fallback
      }
    });
  }
  
  console.log("Done.");
  await prisma.$disconnect();
}
run().catch(e => { console.error(e); prisma.$disconnect(); });
