import { prisma } from '../utils/prismaConnection.js';

const overviews = [
  { slug: 'varanasi', html: "<p><strong>Are you looking to visit the sacred Ghats and experience the divine Ganga Aarti in Varanasi?</strong></p>\n<p><strong>Arivo Holidays</strong> has crafted the ultimate itinerary for you to explore the sacred Ghats and comfortably experience the divine Ganga Aarti. This spiritual journey is specially and uniquely planned just for you.</p>\n<p><strong>Scroll down to check out our hand-picked tour packages below and click to book your dream trip! 👇</strong></p>" },
  { slug: 'rishikesh', html: "<p><strong>Are you eager to visit the holy river Ganga and experience Yoga & Adventure sports in Rishikesh?</strong></p>\n<p>With <strong>Arivo Holidays</strong>, you get an exceptional itinerary to seamlessly explore the holy river Ganga and enjoy thrilling Yoga & Adventure sports. This trip is uniquely planned specially for you.</p>\n<p><strong>Browse our top-rated tour packages below and choose your favorite today! 👇</strong></p>" },
  { slug: 'jaipur', html: "<p><strong>Are you planning to visit the majestic Amber Fort and experience exploring the Hawa Mahal & Pink City in Jaipur?</strong></p>\n<p><strong>Arivo Holidays</strong> brings you the perfect itinerary where you can freely explore the majestic Amber Fort and truly enjoy exploring the Hawa Mahal & Pink City. This royal travel plan is designed exclusively for you.</p>\n<p><strong>Check out our premium tour packages below and book your ideal trip! 👇</strong></p>" },
  { slug: 'udaipur', html: "<p><strong>Are you dreaming of visiting the grand City Palace and experiencing the peaceful Lakes & Romance in Udaipur?</strong></p>\n<p><strong>Arivo Holidays</strong> has created a magical itinerary where you can explore the grand City Palace and deeply enjoy the peaceful Lakes & Romance. This beautiful holiday is uniquely structured for your maximum comfort.</p>\n<p><strong>Scroll below to see our exclusive tour packages and book your dream getaway! 👇</strong></p>" },
  { slug: 'agra', html: "<p><strong>Are you excited to visit the iconic Taj Mahal and experience exploring the Agra Fort & Mughal Heritage in Agra?</strong></p>\n<p>Trust <strong>Arivo Holidays</strong> to provide an incredible itinerary where you can discover the iconic Taj Mahal and enjoy exploring the Agra Fort & Mughal Heritage. This package is uniquely planned for your complete peace of mind.</p>\n<p><strong>Scroll down to explore our hand-crafted tour list and book your perfect holiday! 👇</strong></p>" },
  { slug: 'srinagar', html: "<p><strong>Are you hoping to visit the famous Dal Lake and experience staying in Houseboats & Gardens in Srinagar?</strong></p>\n<p><strong>Arivo Holidays</strong> offers the most authentic itinerary for you to comfortably explore the famous Dal Lake and enjoy staying in Houseboats & Gardens. Every detail is planned specially and uniquely for your enjoyment.</p>\n<p><strong>Find the best tour packages waiting for you below and click to book! 👇</strong></p>" },
  { slug: 'delhi', html: "<p><strong>Are you looking to visit the historic India Gate and experience exploring the Qutub Minar & vibrant Markets in Delhi?</strong></p>\n<p>Let <strong>Arivo Holidays</strong> guide you with a perfect itinerary where you can easily explore the historic India Gate and enjoy exploring the Qutub Minar & vibrant Markets. We have designed this trip uniquely for you.</p>\n<p><strong>Scroll down and click on our premium tour packages to book your next adventure! 👇</strong></p>" }
];

async function updateRemainingCities() {
  console.log(`Starting pageOverview update for the remaining ${overviews.length} major cities...`);
  let successCount = 0;
  
  for (const city of overviews) {
    try {
      const result = await prisma.city.updateMany({
        where: { slug: city.slug },
        data: { overView: city.html }
      });
      if (result.count > 0) {
        console.log(`✅ Updated: ${city.slug}`);
        successCount++;
      } else {
        console.log(`⚠️ Not found/No update: ${city.slug}`);
      }
    } catch (e) {
      console.error(`❌ Error updating ${city.slug}:`, e.message);
    }
  }
  console.log(`\nUpdate completed! Successfully updated ${successCount} major cities.`);
}

updateRemainingCities().finally(() => prisma.$disconnect());
