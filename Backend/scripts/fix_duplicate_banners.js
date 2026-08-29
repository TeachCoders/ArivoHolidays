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

const massiveRandomTags = [
  "Hidden Natural Gem", "Peaceful Holiday Escape", "Majestic Scenic Beauty", 
  "Explore Rich Heritage", "Untouched Nature Retreat", "The Perfect Getaway", 
  "Serene & Beautiful Landscapes", "Ultimate Relaxation Spot", "A True Paradise", 
  "Discover Hidden Wonders", "Breathtaking Views Await", "Wonders of Nature", 
  "Escape to Paradise", "Unforgettable Travel Experience", "Magical Holiday Destination", 
  "Nature's Best Secret", "Rich Culture & History", "Explore Pristine Valleys", 
  "A Picturesque Retreat", "Where Nature Meets Soul", "Journey to Tranquility", 
  "The Ultimate Holiday", "Discover True Beauty", "Soothing Natural Vibes", 
  "Explore Uncharted Paths", "Beautiful Memories Await", "Experience The Magic", 
  "Serenity at its Best", "Captivating Scenic Wonders", "Your Dream Destination", 
  "Relax and Rejuvenate", "Vibrant & Colorful Culture", "A Royal Experience", 
  "Scenic Mountain Escape", "Lush Green Paradise", "Timeless Heritage Charm", 
  "A Heavenly Retreat", "Pure Nature Calling", "Spectacular Scenic Views", 
  "Beyond Your Imagination", "Exquisite Travel Destination", "Feel The Serenity",
  "Unwind and Explore", "A Beautiful Oasis", "A Photographer's Dream",
  "Enchanting Local Charm", "Your Next Adventure", "Discover The Unknown"
];

let usedTags = [];

function getUniqueRandomTag() {
  if (usedTags.length === massiveRandomTags.length) {
    usedTags = []; // Reset if we used all of them
  }
  let availableTags = massiveRandomTags.filter(t => !usedTags.includes(t));
  let tag = availableTags[Math.floor(Math.random() * availableTags.length)];
  usedTags.push(tag);
  return tag;
}

async function main() {
  console.log("Starting Mass Variety Banner Updates...");
  const banners = await prisma.banner.findMany();

  for (const banner of banners) {
    let entityTitle = banner.bannerTitle;

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

    const cleanTitle = entityTitle.trim();
    const lowerTitle = cleanTitle.toLowerCase();
    
    let bannerTag = customTags[lowerTitle];
    if (!bannerTag) {
      bannerTag = getUniqueRandomTag();
    }

    await prisma.banner.update({
      where: { id: banner.id },
      data: { bannerTitle: cleanTitle, bannerTag: bannerTag }
    });
  }

  console.log("Variety Update Complete! Duplicates fixed.");
}

main().then(() => prisma.$disconnect()).catch(console.error);
