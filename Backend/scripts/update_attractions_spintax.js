import { prisma } from "../utils/prismaConnection.js";

const hooks = [
  "Are you searching for the top attractions and best places to visit in {title}?",
  "Looking to explore the hidden gems and famous attractions of {title} with your loved ones?",
  "Are you planning a dream holiday to see the beautiful attractions of {title}?",
  "Ready for a magical vacation exploring the best sights in {title}?"
];

const intros = [
  "You are at the right place! <strong>Arivo Holiday</strong> has created the perfect tour packages for you, covering all the must-see attractions of {title}.",
  "Stop searching! <strong>Arivo Holiday</strong> brings you hand-crafted itineraries that include every beautiful attraction {title} has to offer.",
  "We are here to help! With <strong>Arivo Holiday</strong>, discovering the best attractions and places has never been easier.",
  "Your search ends here! Trust <strong>Arivo Holiday</strong> to guide you through a fantastic journey filled with top local attractions."
];

const offerings = [
  "We provide nice cars, great hotels, and very friendly guides to make your trip super fun and perfectly designed for you.",
  "Enjoy comfortable rides, clean stays, and expert local guides for a stress-free experience.",
  "We take care of everything—from comfortable cabs to top hotels—so you can just relax and enjoy the views.",
  "With our excellent cabs, premium hotels, and happy guides, your vacation will be perfectly smooth and memorable."
];

const ctas = [
  "<strong>Explore our best hand-picked {title} itineraries below and choose your favorite today! 👇</strong>",
  "<strong>Check out our top {title} tour packages below and book your dream trip now! 👇</strong>",
  "<strong>Scroll down to see the best {title} travel packages designed just for you! 👇</strong>",
  "<strong>Find your perfect holiday by exploring our amazing {title} itineraries below! 👇</strong>"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUniqueOverview(title) {
  const hook = getRandom(hooks).replace(/\{title\}/g, title);
  const intro = getRandom(intros).replace(/\{title\}/g, title);
  const offering = getRandom(offerings).replace(/\{title\}/g, title);
  const cta = getRandom(ctas).replace(/\{title\}/g, title);
  
  return `<p><strong>${hook}</strong></p>\n<p>${intro}</p>\n<p>${offering}</p>\n<p>${cta}</p>`;
}

async function main() {
  console.log("Starting Attractions Update...");

  // Update States
  const states = await prisma.state.findMany();
  for (const state of states) {
    const html = generateUniqueOverview(state.title);
    await prisma.state.update({ where: { id: state.id }, data: { overView: html } });
  }

  // Update Countries
  const countries = await prisma.country.findMany();
  for (const country of countries) {
    const html = generateUniqueOverview(country.title);
    await prisma.country.update({ where: { id: country.id }, data: { overView: html } });
  }

  // Update Cities
  const cities = await prisma.city.findMany();
  for (const city of cities) {
    const html = generateUniqueOverview(city.title);
    await prisma.city.update({ where: { id: city.id }, data: { overView: html } });
  }
  
  console.log("Attractions Update Complete!");
}

main().then(() => prisma.$disconnect()).catch(console.error);
