import { prisma } from "../utils/prismaConnection.js";

const experienceMapping = {
  "heritage-and-culture": {
    destinations: "Jaipur, Agra, Varanasi, and Khajuraho",
    seoTitle: "Best Heritage & Culture Tour Packages | Arivo Holiday",
    seoDescription: "Book Heritage and Culture tour packages to explore the majestic forts of Jaipur, the iconic Taj Mahal in Agra, and the ancient temples of Varanasi."
  },
  "spiritual": {
    destinations: "Varanasi, Haridwar, Rishikesh, and Amritsar",
    seoTitle: "Top Spiritual Tour Packages in India | Arivo Holiday",
    seoDescription: "Find peace with our Spiritual tour packages. Visit holy cities like Varanasi, Haridwar, Rishikesh, and the Golden Temple in Amritsar."
  },
  "beach-and-lake": {
    destinations: "Goa, Andaman, and Kerala Backwaters",
    seoTitle: "Beach & Lake Tour Packages | Goa, Andaman, Kerala",
    seoDescription: "Relax on the sandy shores of Goa, explore the pristine islands of Andaman, or cruise the beautiful backwaters of Kerala with our Beach tour packages."
  },
  "culinary": {
    destinations: "Delhi, Punjab, and Lucknow",
    seoTitle: "Culinary & Food Tour Packages in India | Arivo Holiday",
    seoDescription: "Taste the rich flavors of India! Book our Culinary food tours to experience the street food of Delhi, the rich curries of Punjab, and the kebabs of Lucknow."
  },
  "honeymoon": {
    destinations: "Kerala, Kashmir, Udaipur, and Goa",
    seoTitle: "Romantic Honeymoon Tour Packages | Best Couples Trip",
    seoDescription: "Plan your dream romantic getaway with Arivo Holiday. Book exclusive Honeymoon tour packages for Kerala, Kashmir, Udaipur, and Goa."
  },
  "wildlife": {
    destinations: "Ranthambore, Jim Corbett, and Bandhavgarh",
    seoTitle: "Wildlife Safari Tour Packages in India | Arivo Holiday",
    seoDescription: "Experience the thrill of a jungle safari. Book Wildlife tour packages to explore Ranthambore, Jim Corbett, and spot tigers in Bandhavgarh."
  },
  "weekend-tours-in-india": {
    destinations: "Delhi NCR, Lonavala, Jaipur, and Agra",
    seoTitle: "Best Weekend Tours in India | Short Getaway Packages",
    seoDescription: "Need a quick break? Book our Weekend Tour Packages from Delhi NCR, Mumbai, and explore nearby destinations like Jaipur, Agra, and Lonavala."
  },
  "taj-mahal": {
    destinations: "Agra and Fatehpur Sikri",
    seoTitle: "Taj Mahal Tour Packages & Agra Sightseeing",
    seoDescription: "Visit the symbol of love! Book Taj Mahal tour packages to explore the iconic marble monument, Agra Fort, and the historical Fatehpur Sikri."
  },
  "golden-triangle": {
    destinations: "Delhi, Agra, and Jaipur",
    seoTitle: "Golden Triangle Tour Packages: Delhi, Agra, Jaipur",
    seoDescription: "Explore India's most popular tourist circuit. Book Golden Triangle tour packages covering the historical sights of Delhi, Agra, and Jaipur."
  },
  "hill-station": {
    destinations: "Manali, Shimla, Darjeeling, and Kashmir",
    seoTitle: "Hill Station Tour Packages | Mountains & Snow",
    seoDescription: "Escape to the mountains! Book Hill Station tour packages for beautiful destinations like Manali, Shimla, Darjeeling, and Kashmir."
  },
  "ayurveda-yoga": {
    destinations: "Kerala and Rishikesh",
    seoTitle: "Ayurveda & Yoga Tour Packages | Wellness Retreats",
    seoDescription: "Rejuvenate your mind and body. Book Ayurveda and Yoga tour packages to experience traditional healing in Kerala and spiritual wellness in Rishikesh."
  },
  "family": {
    destinations: "Rajasthan, Kerala, and Himachal Pradesh",
    seoTitle: "Family Tour Packages | Holiday Trips in India",
    seoDescription: "Plan the perfect family vacation! Book Family tour packages to explore the royal forts of Rajasthan, the beaches of Kerala, and the hills of Himachal."
  },
  "desert-safari": {
    destinations: "Jaisalmer, Bikaner, and Jodhpur",
    seoTitle: "Desert Safari Tour Packages | Rajasthan Sand Dunes",
    seoDescription: "Experience the magic of the golden sands. Book Desert Safari tour packages to enjoy camel rides, cultural nights, and camping in Jaisalmer and Bikaner."
  }
};

const hooks = [
  "Are you searching for the top attractions and best {title} experiences?",
  "Looking to explore the hidden gems and enjoy a perfect {title} trip?",
  "Are you planning a dream holiday to experience the best {title} tours?",
  "Ready for a magical vacation exploring the best {title} attractions?"
];

const intros = [
  "You are at the right place! <strong>Arivo Holiday</strong> has created the perfect tour packages for you, covering all the must-see destinations like {destinations}.",
  "Stop searching! <strong>Arivo Holiday</strong> brings you hand-crafted itineraries that include the best places like {destinations}.",
  "We are here to help! With <strong>Arivo Holiday</strong>, discovering beautiful locations like {destinations} has never been easier.",
  "Your search ends here! Trust <strong>Arivo Holiday</strong> to guide you through a fantastic journey across famous places like {destinations}."
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

function generateUniqueOverview(title, destinations) {
  const hook = getRandom(hooks).replace(/\{title\}/g, title);
  const intro = getRandom(intros).replace(/\{destinations\}/g, destinations);
  const offering = getRandom(offerings);
  const cta = getRandom(ctas).replace(/\{title\}/g, title);
  
  return `<p><strong>${hook}</strong></p>\n<p>${intro}</p>\n<p>${offering}</p>\n<p>${cta}</p>`;
}

async function main() {
  console.log("Starting Travel Experiences Update...");

  const experiences = await prisma.travelExperience.findMany();
  let updatedCount = 0;

  for (const exp of experiences) {
    const map = experienceMapping[exp.slug];
    if (map) {
      const overView = generateUniqueOverview(exp.title, map.destinations);
      await prisma.travelExperience.update({
        where: { id: exp.id },
        data: {
          seoTitle: map.seoTitle,
          seoDescription: map.seoDescription,
          overView: overView
        }
      });
      updatedCount++;
      console.log(`Updated: ${exp.title}`);
    } else {
      console.log(`Skipped: ${exp.title} (No mapping found)`);
    }
  }
  
  console.log(`Travel Experiences Update Complete! Updated ${updatedCount} records.`);
}

main().then(() => prisma.$disconnect()).catch(console.error);
