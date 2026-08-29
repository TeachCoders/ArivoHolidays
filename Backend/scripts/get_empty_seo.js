import { prisma } from "../utils/prismaConnection.js";
import fs from "fs";

async function main() {
  const states = await prisma.state.findMany({
    where: { seoTitle: null },
    select: { id: true, title: true }
  });
  const cities = await prisma.city.findMany({
    where: { seoTitle: null },
    select: { id: true, title: true }
  });
  const countries = await prisma.country.findMany({
    where: { seoTitle: null },
    select: { id: true, title: true }
  });
  
  const data = { states, cities, countries };
  fs.writeFileSync("empty_seo.json", JSON.stringify(data, null, 2));
  console.log("Written to empty_seo.json");
}

main().then(() => prisma.$disconnect());
