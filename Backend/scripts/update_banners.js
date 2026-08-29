import { prisma } from "../utils/prismaConnection.js";

const customTags = {
  "orchha": "Land of Ram Raja",
  "kashmir": "Heaven on Earth",
  "jammu and kashmir": "Heaven on Earth",
  "srinagar": "Heaven on Earth",
  "jaipur": "The Pink City",
  "udaipur": "City of Lakes",
  "agra": "Home of Taj Mahal",
  "kerala": "God's Own Country",
  "jaisalmer": "The Golden City",
  "jodhpur": "The Blue City",
  "amritsar": "The Golden Temple",
  "varanasi": "The Spiritual Capital",
  "rishikesh": "Yoga Capital of World",
  "goa": "Sun, Sand & Beaches",
  "andaman": "Pristine Tropical Islands",
  "manali": "Valley of the Gods",
  "shimla": "Queen of Hills",
  "delhi": "Heart of India",
  "delhi  ncr": "Heart of India",
  "rajasthan": "The Royal State",
  "himachal pradesh": "Land of Mountains",
  "uttarakhand": "Land of Gods",
  "india tour": "Incredible India"
};

const randomTags = [
  "Hidden Natural Gem",
  "Peaceful Holiday Escape",
  "Majestic Scenic Beauty",
  "Explore Rich Heritage",
  "Untouched Nature Retreat",
  "The Perfect Getaway",
  "Serene & Beautiful Landscapes"
];

function getRandomTag() {
  return randomTags[Math.floor(Math.random() * randomTags.length)];
}

async function main() {
  console.log("Starting Banner Updates...");
  const banners = await prisma.banner.findMany();
  let updatedCount = 0;

  for (const banner of banners) {
    let entityTitle = banner.bannerTitle; // fallback

    // Fetch the correct title based on entityType
    if (banner.entityType === "State") {
      const state = await prisma.state.findUnique({ where: { id: banner.entityId } });
      if (state) entityTitle = state.title;
    } else if (banner.entityType === "City") {
      const city = await prisma.city.findUnique({ where: { id: banner.entityId } });
      if (city) entityTitle = city.title;
    } else if (banner.entityType === "Country") {
      const country = await prisma.country.findUnique({ where: { id: banner.entityId } });
      if (country) entityTitle = country.title;
    }

    // Determine bannerTag
    const cleanTitle = entityTitle.trim();
    const lowerTitle = cleanTitle.toLowerCase();
    
    // Check if we have a custom tag
    let bannerTag = customTags[lowerTitle];
    
    // If not, use random short tag
    if (!bannerTag) {
      bannerTag = getRandomTag();
    }

    // Update the banner
    await prisma.banner.update({
      where: { id: banner.id },
      data: {
        bannerTitle: cleanTitle,
        bannerTag: bannerTag
      }
    });

    updatedCount++;
    console.log(`Updated Banner for ${cleanTitle} -> ${bannerTag}`);
  }

  console.log(`Successfully updated ${updatedCount} Banners!`);
}

main().then(() => prisma.$disconnect()).catch(console.error);
