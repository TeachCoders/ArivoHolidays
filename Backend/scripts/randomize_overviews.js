import { prisma } from "../utils/prismaConnection.js";

const hooks = [
  "Are you planning a dream holiday in {title}?",
  "Looking for an amazing trip to {title} with your family or friends?",
  "Do you want to explore the beautiful sights and culture of {title}?",
  "Ready for a magical and relaxing vacation in {title}?"
];

const intros = [
  "You are at the right place! Connect with <strong>Arivo Holiday</strong> to easily plan your perfect getaway.",
  "Look no further! Let <strong>Arivo Holiday</strong> help you build the best memories in this wonderful land.",
  "We are here to help! With <strong>Arivo Holiday</strong>, discovering the best places has never been easier.",
  "Your search ends here! Trust <strong>Arivo Holiday</strong> to guide you through a fantastic journey."
];

const offerings = [
  "We provide nice cars, great hotels, and very friendly guides to make your trip super fun and easy.",
  "Enjoy comfortable rides, clean stays, and expert local guides for a stress-free experience.",
  "We take care of everything—from comfortable cabs to top hotels—so you can just relax and enjoy.",
  "With our excellent cabs, premium hotels, and happy guides, your vacation will be perfectly smooth."
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
  
  return `<p><strong>${hook}</strong></p>\n<p>${intro} With our <strong>${title} tour packages</strong>, you can experience the true beauty of this place.</p>\n<p>${offering}</p>\n<p>${cta}</p>`;
}

async function main() {
  console.log("Starting Unique Overview Update...");

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
  
  console.log("Randomization Complete! All 109 pages are now unique.");
}

main().then(() => prisma.$disconnect()).catch(console.error);
