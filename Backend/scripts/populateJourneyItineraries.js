// Backend/populateJourneyItineraries.js
// Populate Journey records + JourneyDay itineraries from frontend/public/itinerary-document/*.txt
// Usage: node populateJourneyItineraries.js [--dry-run]
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../utils/prismaConnection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TXT_DIR = path.resolve(__dirname, "../frontend/public/itinerary-document");

const DRY_RUN = process.argv.includes("--dry-run");

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseTxt(content) {
  const lines = content.split(/\r?\n/).map((l) => l.trim());

  const titleLine = lines[0] || "";
  const daysMatch = titleLine.match(/^(\d+)\s*DAY/i);

  const meta = { pageUrl: "", pageTitle: "" };
  const intro = [];
  let highlights = [];
  let route = "";
  let section = "";
  const days = [];

  const setMeta = (key, value) => {
    meta[key] = value;
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const seoTitle = line.match(/^SEO Title:\s*(.+)$/);
    if (seoTitle) continue;
    const metaDesc = line.match(/^Meta Description:\s*(.+)$/);
    if (metaDesc) continue;
    const keyword = line.match(/^Keyword:\s*(.+)$/);
    if (keyword) continue;
    const pageUrl = line.match(/^Page URL:\s*(.+)$/);
    if (pageUrl) { setMeta("pageUrl", pageUrl[1].trim()); continue; }
    const pageTitle = line.match(/^Page Title:\s*(.+)$/);
    if (pageTitle) { setMeta("pageTitle", pageTitle[1].trim()); continue; }
    const travelExp = line.match(/^Travel Experience:\s*(.+)$/);
    if (travelExp) continue;

    if (/^-{5,}$/.test(line)) {
      if (section === "itinerary" || section === "route") section = "meta";
      else section = "intro";
      continue;
    }

    if (line === "HIGHLIGHTS OF THE JOURNEY") { section = "highlights"; continue; }
    if (/^JOURNEY ROUTE/.test(line)) { section = "route"; continue; }
    if (/^DAY-BY-DAY ITINERARY/.test(line)) { section = "itinerary"; continue; }
    if (line === "INCLUSIONS" || line === "EXCLUSIONS" || /^FREQUENTLY ASKED/.test(line)) { section = "meta"; continue; }

    if (section === "highlights") {
      if (line.startsWith("-")) highlights.push(line.replace(/^-\s*/, ""));
      continue;
    }

    if (section === "route") {
      if (line && !line.startsWith("-")) {
        route = route ? `${route} ${line}` : line;
      }
      continue;
    }

    if (section === "itinerary") {
      const dayMatch = line.match(/^DAY\s+(\d+):\s*(.+)$/i);
      if (dayMatch) {
        days.push({ dayNum: parseInt(dayMatch[1], 10), title: dayMatch[2].trim(), summary: "", bullets: [] });
        continue;
      }
      const current = days[days.length - 1];
      if (!current) continue;
      if (line.startsWith("-")) {
        current.bullets.push(line.replace(/^-\s*/, "").trim());
      } else if (!current.summary) {
        current.summary = line;
      }
      continue;
    }

    if (section === "intro") {
      if (line) intro.push(line);
    }
  }

  return { titleLine, daysMatch, meta, intro, highlights, route, days };
}

async function main() {
  const files = fs.readdirSync(TXT_DIR).filter((f) => f.endsWith(".txt"));
  console.log(`Found ${files.length} itinerary files${DRY_RUN ? " (DRY RUN)" : ""}`);

  const cities = await prisma.city.findMany({ select: { id: true, slug: true, title: true } });
  const cityIndex = new Map();
  for (const c of cities) {
    cityIndex.set(c.slug.toLowerCase(), c);
    cityIndex.set(c.title.toLowerCase(), c);
  }
  const findCity = (name) => {
    if (!name) return null;
    return cityIndex.get(name.trim().toLowerCase()) || cityIndex.get(slugify(name).toLowerCase()) || null;
  };

  let created = 0, updated = 0, skipped = 0, dayCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(TXT_DIR, file), "utf8");
    const data = parseTxt(content);

    const slug = data.meta.pageUrl || slugify(data.meta.pageTitle || data.titleLine);
    if (!slug || data.days.length === 0) {
      console.log(`SKIP (no slug/days): ${file}`);
      skipped++;
      continue;
    }

    const title = data.meta.pageTitle || data.titleLine.split("|")[0].trim();
    const noDays = data.daysMatch ? parseInt(data.daysMatch[1], 10) : data.days.length;
    const description = (data.intro.reduce((best, l) => (l.length > best.length ? l : best), "") || "").slice(0, 500);

    const routeCities = data.route
      .split("->")
      .map((c) => c.trim().replace(/[()&/]/g, "").replace(/\s+/g, " "))
      .filter(Boolean);
    const titleTokens = data.titleLine
      .split("|")[0]
      .split(/\s+/)
      .map((w) => w.replace(/['’]/g, "").toLowerCase());
    const connected = [...new Set([...routeCities, ...titleTokens].map(findCity).filter(Boolean))];

    const days = data.days
      .sort((a, b) => a.dayNum - b.dayNum)
      .map((d) => {
        const descriptionParts = [];
        if (d.summary) descriptionParts.push(d.summary);
        if (d.bullets.length > 0) descriptionParts.push(d.bullets.map((b) => `- ${b}`).join("\n"));
        return {
          day: `DAY ${d.dayNum}: ${d.title}`,
          description: descriptionParts.join("\n"),
          image: "",
        };
      });

    const payload = {
      title,
      slug,
      description,
      noDays: Math.max(1, noDays),
      duration: `${noDays} Days`,
      destination: connected.length ? connected.map((c) => c.title).join(" -> ") : (routeCities[0] || ""),
      cityOrder: connected.map((c) => c.id),
      cities: connected.length ? { set: connected.map((c) => ({ id: c.id })) } : undefined,
      highlights: [],
    };

    if (DRY_RUN) {
      console.log(`\n=== ${file}`);
      console.log(`  slug=${slug} title=${title} noDays=${noDays}`);
      console.log(`  description="${description}"`);
      console.log(`  cities=[${connected.map((c) => c.title).join(", ") || "none"}]`);
      console.log(`  days=${days.length} (first day: ${days[0]?.day})`);
      continue;
    }

    const existing = await prisma.journey.findUnique({ where: { slug } });
    if (existing) {
      await prisma.journeyDay.deleteMany({ where: { journeyId: existing.id } });
      if (days.length > 0) {
        await prisma.journeyDay.createMany({ data: days.map((d) => ({ ...d, journeyId: existing.id })) });
      }
      await prisma.journey.update({
        where: { id: existing.id },
        data: {
          title,
          description,
          noDays: payload.noDays,
          duration: payload.duration,
          destination: payload.destination,
          cityOrder: payload.cityOrder,
          ...(payload.cities ? { cities: payload.cities } : {}),
        },
      });
      updated++;
    } else {
      await prisma.journey.create({
        data: {
          title,
          slug,
          description,
          noDays: payload.noDays,
          duration: payload.duration,
          destination: payload.destination,
          highlights: [],
          cityOrder: payload.cityOrder,
          ...(payload.cities ? { cities: { connect: payload.cities.set } } : {}),
          days: { create: days },
        },
      });
      created++;
    }

    dayCount += days.length;
    process.stdout.write(`✓ ${slug} (${days.length} days)\n`);
  }

  if (DRY_RUN) {
    console.log(`\nDry-run complete. ${files.length} files parsed.`);
    return;
  }

  console.log(`\nDone. ${created} created, ${updated} updated, ${skipped} skipped, ${dayCount} itinerary days inserted.`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
