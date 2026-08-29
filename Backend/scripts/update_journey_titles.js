import { prisma } from '../utils/prismaConnection.js';

const journeyUpdates = [
  { slug: '3-days-jim-corbett-wildlife-tour-from-delhi', title: '3 Days Jim Corbett Wildlife Tour from Delhi: Jungle Safari Package' },
  { slug: '10-days-golden-triangle-with-khajuraho-varanasi-tour', title: '10 Days Golden Triangle Tour with Khajuraho & Varanasi' },
  { slug: '8-days-golden-triangle-tour-with-pushkar', title: '8 Days Golden Triangle Tour with Pushkar & Taj Mahal' },
  { slug: 'same-day-agra-tour-by-car-from-delhi', title: 'Same Day Agra Tour by Car from Delhi: Taj Mahal & Agra Fort' },
  { slug: '8-days-golden-triangle-with-rishikesh-yoga-tour', title: '8 Days Golden Triangle with Rishikesh Yoga Tour & Taj Mahal' },
  { slug: '8-days-golden-triangle-tour-with-ranthambore-tiger-safari-tour', title: '8 Days Golden Triangle Tour with Ranthambore Tiger Safari' },
  { slug: 'mathura-vrindavan-tour-package-from-delhi', title: '2 Days Mathura Vrindavan Tour Package from Delhi' },
  { slug: '3-days-delhi-agra-weekend-tour', title: '3 Days Delhi & Agra Weekend Tour: Taj Mahal Sightseeing' },
  { slug: '3-days-delhi-agra-private-tour-with-tajmahal', title: '3 Days Delhi Agra Private Tour with Taj Mahal & Agra Fort' },
  { slug: '3-days-rishikesh-yoga-meditation-tour-from-delhi', title: '3 Days Rishikesh Yoga & Meditation Retreat from Delhi' },
  { slug: '2-days-varanasi-experience-tour-from-delhi', title: '2 Days Varanasi Experience Tour from Delhi: Ganga Aarti' },
  { slug: '2-days-delhi-to-amritsar-weekend-tour', title: '2 Days Delhi to Amritsar Weekend Tour: Golden Temple Trip' },
  { slug: '3-days-udaipur-cultural-tour-from-delhi', title: '3 Days Udaipur Cultural Tour from Delhi: Lake Pichola & Palaces' },
  { slug: '2-days-delhi-to-agra-weekend-tour', title: '2 Days Delhi to Agra Weekend Tour: Taj Mahal & Fort Package' },
  { slug: '3-days-jaipur-agra-tirp-from-delhi-golden-triangle', title: '3 Days Golden Triangle Tour from Delhi: Jaipur & Agra Trip' },
  { slug: '10-days-golden-triangle-with-kashmir-tour-package', title: '10 Days Golden Triangle with Kashmir Tour Package' },
  { slug: '5-days-delhi-agra-jaipur-golden-triangle-tour', title: '5 Days Delhi Agra Jaipur Tour by Road: Golden Triangle Package' },
  { slug: '8-days-golden-triangle-tour-with-rajasthan', title: '8 Days Golden Triangle Tour with Rajasthan Heritage' },
  { slug: '5-days-delhi-agra-jaipur-golden-triangle-tour-by-train', title: '5 Days Delhi Agra Jaipur Tour by Train: Golden Triangle' },
  { slug: '5-days-delhi-agra-amritsar-tour-package', title: '5 Days Delhi Agra Amritsar Tour Package: Taj & Golden Temple' }
];

async function updateJourneyTitles() {
  console.log(`Starting update for ${journeyUpdates.length} journeys...`);
  let successCount = 0;
  
  for (const j of journeyUpdates) {
    try {
      const result = await prisma.journey.updateMany({
        where: { slug: j.slug },
        data: { seoTitle: j.title }
      });
      if (result.count > 0) {
        console.log(`✅ Updated: ${j.slug}`);
        successCount++;
      } else {
        console.log(`⚠️ Not found/No update: ${j.slug}`);
      }
    } catch (e) {
      console.error(`❌ Error updating ${j.slug}:`, e.message);
    }
  }
  console.log(`\nUpdate completed! Successfully updated ${successCount} journeys.`);
}

updateJourneyTitles().finally(() => prisma.$disconnect());
