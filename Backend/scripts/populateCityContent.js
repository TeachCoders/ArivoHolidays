// Backend/populateCityContent.js
// Populate City records + banners from frontend/public/destination/city/*.txt
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../utils/prismaConnection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CITY_DIR = path.resolve(__dirname, "../frontend/public/destination/city");

function parseTxt(content) {
  const sections = {};
  let current = null;
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    const header = line.match(/^## (.+)$/);
    if (header) {
      current = header[1];
      sections[current] = [];
      continue;
    }
    if (current) sections[current].push(line);
  }
  const result = {};
  for (const [key, lines] of Object.entries(sections)) {
    result[key] = lines.filter(Boolean).join("\n");
  }
  return result;
}

function toHtmlList(famousFor) {
  const lines = famousFor.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => {
    const idx = line.indexOf("–");
    if (idx > 0) {
      const title = line.slice(0, idx).trim();
      let desc = line.slice(idx + 1).replace(/^[–-]\s*/, "").trim();
      if (desc && !/[.!?]$/.test(desc)) desc += ".";
      return `<li><p><strong>${title}</strong> – ${desc}</p></li>`;
    }
    let desc = line;
    if (desc && !/[.!?]$/.test(desc)) desc += ".";
    return `<li><p>${desc}</p></li>`;
  }).join("");
}

function toHtmlParagraphs(text) {
  return text.split(/\n+/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${p}</p>`).join("");
}

async function main() {
  const files = fs.readdirSync(CITY_DIR).filter((f) => f.endsWith(".txt"));
  console.log(`Found ${files.length} city files`);

  const allCities = await prisma.city.findMany({ select: { id: true, slug: true, title: true } });
  const slugToCity = new Map(allCities.map((c) => [c.slug.toLowerCase(), c]));

  const banners = await prisma.banner.findMany({
    where: { entityType: "City" },
    select: { id: true, entityId: true, images: true },
  });
  const bannerByCity = new Map(banners.map((b) => [b.entityId, b]));

  let updated = 0, unmatched = 0, bannersUpdated = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(CITY_DIR, file), "utf8");
    const data = parseTxt(content);
    const fileSlug = (data["Slug"] || file.replace(/\.txt$/, "")).trim();

    const city = slugToCity.get(fileSlug.toLowerCase());
    if (!city) {
      console.log(`SKIP (no match): ${file} -> slug "${fileSlug}"`);
      unmatched++;
      continue;
    }

    const updateData = {
      description: data["Description"] || undefined,
      shortDesc: data["Short Description"] || undefined,
      keyword: data["Keywords"] || undefined,
      attractions: data["Attractions"] || undefined,
      weather: data["Weather"] || undefined,
    };

    if (data["Famous For"]) updateData.famousFor = `<ul>${toHtmlList(data["Famous For"])}</ul>`;
    if (data["More Description"]) updateData.moreDescription = toHtmlParagraphs(data["More Description"]);

    if (city.slug !== fileSlug) {
      updateData.slug = fileSlug;
    }

    await prisma.city.update({
      where: { id: city.id },
      data: updateData,
    });
    updated++;

    const bannerTile = data["Banner Title"]?.trim();
    const bannerTag = data["Banner Tag"]?.trim();
    if (bannerTile || bannerTag) {
      const existing = bannerByCity.get(city.id);
      if (existing) {
        await prisma.banner.update({
          where: { id: existing.id },
          data: { bannerTile: bannerTile || existing.bannerTile, bannerTag: bannerTag || existing.bannerTag },
        });
      } else {
        await prisma.banner.create({
          data: { entityType: "City", entityId: city.id, bannerTile: bannerTile || "", bannerTag: bannerTag || "", images: [] },
        });
      }
      bannersUpdated++;
    }
  }

  console.log(`Updated ${updated} cities, ${bannersUpdated} banners, ${unmatched} unmatched`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
