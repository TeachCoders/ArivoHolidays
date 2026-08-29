import { prisma } from "../utils/prismaConnection.js";

async function main() {
  console.log("Starting Private Keywords Injection...");
  let count = 0;

  // Process Cities
  const cities = await prisma.city.findMany();
  for (const city of cities) {
    let keywords = city.seoKeyword || "";
    
    // Custom overrides
    if (city.title.toLowerCase() === "jaipur") {
      keywords = "jaipur elephant ride, private jaipur tour packages, amber fort tour, pink city sightseeing, hawa mahal trip, best jaipur holiday trip, jaipur travel packages in india, book private jaipur sightseeing";
    } else {
      // General Private Append
      if (!keywords.includes("private")) {
        keywords = `private ${city.title.toLowerCase()} tour packages, ${keywords}`;
      }
    }

    await prisma.city.update({
      where: { id: city.id },
      data: { seoKeyword: keywords }
    });
    
    // Print example for a few random cities
    if (count % 20 === 0 || city.title.toLowerCase() === "jaipur") {
      console.log(`Example [${city.title}]: ${keywords}`);
    }
    count++;
  }

  // Process Experiences
  const experiences = await prisma.travelExperience.findMany();
  for (const exp of experiences) {
    let keywords = exp.seoKeyword || "";

    // Custom overrides
    if (exp.slug === "honeymoon") {
      keywords = "honeymoon in goa, honeymoon in kerala, private honeymoon tours, romantic honeymoon tour packages in india, best honeymoon holiday trips, book private honeymoon vacation, honeymoon travel packages india";
    } else {
      // General Private Append
      if (!keywords.includes("private")) {
        keywords = `private ${exp.title.toLowerCase()} tours in india, ${keywords}`;
      }
    }

    await prisma.travelExperience.update({
      where: { id: exp.id },
      data: { seoKeyword: keywords }
    });

    if (exp.slug === "honeymoon" || exp.slug === "wildlife") {
      console.log(`Example [${exp.title}]: ${keywords}`);
    }
  }

  console.log(`Successfully injected 'Private' into all locations!`);
}

main().then(() => prisma.$disconnect()).catch(console.error);
