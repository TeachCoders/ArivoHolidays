import { prisma } from "../utils/prismaConnection.js";
import fs from "fs";

async function main() {
  const states = await prisma.state.findMany({ select: { id: true, title: true, overView: true } });
  const cities = await prisma.city.findMany({ select: { id: true, title: true, overView: true } });
  
  const stats = {
    states: {
      total: states.length,
      hasOverview: states.filter(s => s.overView && s.overView.length > 5).length
    },
    cities: {
      total: cities.length,
      hasOverview: cities.filter(c => c.overView && c.overView.length > 5).length
    }
  };
  
  console.log("Overview Stats:", JSON.stringify(stats, null, 2));
}

main().then(() => prisma.$disconnect());
