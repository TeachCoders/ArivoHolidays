// Seed: create/update the 12 travel months with their season category.
// Idempotent — upserts by slug.
import 'dotenv/config';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const gen = require('./generated/prisma/index.js');
const PrismaClient = gen.PrismaClient ?? gen.default?.PrismaClient ?? gen.default ?? gen;
const { PrismaPg } = require('@prisma/adapter-pg');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const WINTER = "winter";
const SPRING = "spring";
const MONSOON = "monsoon";

const MONTHS = [
  { month: "January", season: WINTER, displayOrder: 1, weather: "Cold and crisp, ideal for desert and heritage tours", note: "Peak season — pleasant daytime weather across north India." },
  { month: "February", season: WINTER, displayOrder: 2, weather: "Pleasant, with cool mornings and mild days", note: "Great time for forts, palaces and wildlife safaris." },
  { month: "March", season: WINTER, displayOrder: 3, weather: "Warming up, comfortable evenings", note: "Last leg of the peak winter travel season." },
  { month: "April", season: SPRING, displayOrder: 4, weather: "Warm days, blooming landscapes", note: "Spring blooms in the hills and fewer crowds." },
  { month: "May", season: SPRING, displayOrder: 5, weather: "Hot plains, cool hill stations", note: "Perfect for mountain escapes and scenic drives." },
  { month: "June", season: SPRING, displayOrder: 6, weather: "Early monsoon showers arrive", note: "Lush greenery as rains begin in many regions." },
  { month: "July", season: MONSOON, displayOrder: 7, weather: "Heavy rains, green valleys", note: "Monsoon scenery at hill stations and waterfalls." },
  { month: "August", season: MONSOON, displayOrder: 8, weather: "Rains continue, rivers full", note: "Best for monsoon-washed landscapes and adventure." },
  { month: "September", season: MONSOON, displayOrder: 9, weather: "Rains easing, fresh greenery", note: "Transition month — travel becomes comfortable again." },
  { month: "October", season: WINTER, displayOrder: 10, weather: "Pleasant start of the peak season", note: "Festival season begins — ideal for travel." },
  { month: "November", season: WINTER, displayOrder: 11, weather: "Clear skies, perfect weather", note: "One of the best months to explore India." },
  { month: "December", season: WINTER, displayOrder: 12, weather: "Cool and festive", note: "Snowfall in the hills, winter warmth in the deserts." },
];

const MONTH_DESC = {
  [WINTER]: "October to March — the peak travel season with clear skies and pleasant weather across India.",
  [SPRING]: "April to June — warm days, blooming landscapes and fewer crowds at popular spots.",
  [MONSOON]: "July to September — lush greenery and scenic rains, great for hill stations and waterfalls.",
};

async function main() {
  const results = [];
  for (const m of MONTHS) {
    const slug = m.month.toLowerCase();
    const data = {
      title: m.month,
      season: m.season,
      description: MONTH_DESC[m.season],
      shortDesc: `${m.month}: ${m.weather}.`,
      weather: m.weather,
      bestFor: m.note,
      isActive: true,
      displayOrder: m.displayOrder,
    };
    const existing = await prisma.month.findUnique({ where: { slug } });
    if (existing) {
      const updated = await prisma.month.update({ where: { slug }, data });
      results.push(`updated  ${slug} -> ${m.season}`);
    } else {
      await prisma.month.create({ data: { ...data, slug } });
      results.push(`created  ${slug} -> ${m.season}`);
    }
  }

  const count = await prisma.month.count();

  const byTitle = Object.fromEntries(MONTHS.map((m) => [m.month.toLowerCase(), m.season]));
  const noSeason = await prisma.month.findMany({ where: { season: null } });
  for (const m of noSeason) {
    const season = byTitle[m.title.toLowerCase()];
    if (season) {
      await prisma.month.update({ where: { id: m.id }, data: { season } });
      results.push(`backfill ${m.slug} (id ${m.id}) -> ${season}`);
    }
  }

  const finalCount = await prisma.month.count();
  console.log(results.join("\n"));
  console.log(`\nTotal months in DB: ${finalCount}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
