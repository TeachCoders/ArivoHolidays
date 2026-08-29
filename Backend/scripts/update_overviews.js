import { prisma } from "../utils/prismaConnection.js";

function generateOverview(title, isHillStation) {
  const tripTypes = isHillStation ? "nature, honeymoon, or family adventure" : "heritage, honeymoon, or family culture";
  const feeling = isHillStation ? "like you are in a snowy paradise" : "like a royal king";
  const magicalLand = isHillStation ? "beautiful mountains and serene lakes" : "majestic forts and vibrant markets";

  return `<p><strong>Are you looking for a ${tripTypes} trip in ${title}? Do you want to feel ${feeling}?</strong></p>
<p>Then you are at the perfect place! Connect with <strong>Arivo Holiday</strong> and easily plan your dream trip to this magical land of ${magicalLand}. With our <strong>${title} tour packages</strong>, you can explore the most beautiful places and hidden gems.</p>
<p>We make your trip super easy and fun. We give you nice cars, good hotels, and friendly guides. Come and experience the best holidays with your loved ones!</p>
<p><strong>Explore our best hand-picked ${title} itineraries below and choose your perfect holiday today! 👇</strong></p>`;
}

const hillStationKeywords = ["Himachal", "Kashmir", "Srinagar", "Manali", "Shimla", "Gulmarg", "Pahalgam", "Uttarakhand", "Ladakh", "Leh", "Nainital", "Darjeeling"];

function isHill(title) {
  return hillStationKeywords.some(k => title.toLowerCase().includes(k.toLowerCase()));
}

async function main() {
  console.log("Starting Overview Update...");

  // Update States
  const states = await prisma.state.findMany();
  for (const state of states) {
    const html = generateOverview(state.title, isHill(state.title));
    await prisma.state.update({ where: { id: state.id }, data: { overView: html } });
  }
  console.log(`Updated ${states.length} States`);

  // Update Countries
  const countries = await prisma.country.findMany();
  for (const country of countries) {
    const html = generateOverview(country.title, false);
    await prisma.country.update({ where: { id: country.id }, data: { overView: html } });
  }
  console.log(`Updated ${countries.length} Countries`);

  // Update Cities
  const cities = await prisma.city.findMany();
  for (const city of cities) {
    const html = generateOverview(city.title, isHill(city.title));
    await prisma.city.update({ where: { id: city.id }, data: { overView: html } });
  }
  console.log(`Updated ${cities.length} Cities`);
  
  console.log("All Overviews Successfully Updated!");
}

main().then(() => prisma.$disconnect()).catch(console.error);
