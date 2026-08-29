import { prisma } from '../utils/prismaConnection.js';

const cityUpdates = [
  { slug: 'pahalgam', title: 'Pahalgam Tour Packages: Explore Betaab Valley, Aru Valley & Scenic Landscapes' },
  { slug: 'doodhpathri', title: 'Doodhpathri Tour Packages: Enjoy Pine Forests, Meadows & River Streams' },
  { slug: 'yusmarg', title: 'Yusmarg Tour Packages: Experience Meadow of Jesus & Pine Valleys' },
  { slug: 'doda', title: 'Doda Tour Packages: Explore Untouched Beauty & Serene Landscapes' },
  { slug: 'katra', title: 'Katra Tour Packages: Start Your Holy Pilgrimage to Mata Vaishno Devi' },
  { slug: 'jammu', title: 'Jammu Tour Packages: Explore Raghunath Temple, Bahu Fort & Pilgrimage' },
  { slug: 'patnitop', title: 'Patnitop Tour Packages: Enjoy Paragliding, Pine Forests & Snow Mountains' },
  { slug: 'sonamarg', title: 'Sonamarg Tour Packages: Trek to Thajiwas Glacier & Meadow of Gold' },
  { slug: 'gulmarg', title: 'Gulmarg Tour Packages: Ride Gondola Cable Car & Enjoy Snow Skiing' },
  { slug: 'aharbal-waterfall', title: 'Aharbal Waterfall Tour Packages: Witness the Niagara Falls of Kashmir' },
  { slug: 'aru-valley', title: 'Aru Valley Tour Packages: Trek through Lush Meadows & Crystal Clear Rivers' },
  
  { slug: 'ranthambore', title: 'Ranthambore Tour Packages: Enjoy Jungle Safari & Spot Bengal Tigers' },
  { slug: 'bharatpur', title: 'Bharatpur Tour Packages: Explore Keoladeo National Park & Bird Watching' },
  { slug: 'bikaner', title: 'Bikaner Tour Packages: Explore Junagarh Fort, Karni Mata Temple & Deserts' },
  { slug: 'pushkar', title: 'Pushkar Tour Packages: Visit Brahma Temple, Pushkar Lake & Camel Safari' },
  { slug: 'jodhpur', title: 'Jodhpur Tour Packages: Explore Mehrangarh Fort, Umaid Bhawan & Blue City' },
  { slug: 'alwar', title: 'Alwar Tour Packages: Visit Bhangarh Fort, Sariska Tiger Reserve & Palaces' },
  { slug: 'mount-abu', title: 'Mount Abu Tour Packages: Explore Dilwara Temples, Nakki Lake & Hill Station' },
  { slug: 'ajmer', title: 'Ajmer Tour Packages: Visit Ajmer Sharif Dargah, Ana Sagar Lake & Mountains' },
  { slug: 'kota', title: 'Kota Tour Packages: Explore Seven Wonders Park, Garh Palace & Chambal River' },
  { slug: 'chittorgarh', title: 'Chittorgarh Tour Packages: Explore Chittorgarh Fort, Vijay Stambha & Rajput History' },
  { slug: 'shekhawati', title: 'Shekhawati Tour Packages: Discover Painted Havelis & Traditional Frescoes' },
  { slug: 'bundi', title: 'Bundi Tour Packages: Explore Taragarh Fort, Stepwells & Palaces' },
  { slug: 'jaisalmer', title: 'Jaisalmer Tour Packages: Enjoy Camel Safari, Thar Desert & Sonar Quila' },

  { slug: 'sarnath', title: 'Sarnath Tour Packages: Explore Buddhist Stupas & Ashoka Pillar' },
  { slug: 'fatehpur-sikri', title: 'Fatehpur Sikri Tour Packages: Explore Buland Darwaza & Mughal Architecture' },
  { slug: 'vrindavan', title: 'Vrindavan Tour Packages: Visit Banke Bihari, Prem Mandir & Holy Temples' },
  { slug: 'prayagraj', title: 'Prayagraj Tour Packages: Witness Triveni Sangam, Kumbh Mela & Temples' },
  { slug: 'dudhwa-national-park', title: 'Dudhwa National Park Tour Packages: Enjoy Wildlife Safari & Spot Rhinos' },
  { slug: 'ayodhya', title: 'Ayodhya Tour Packages: Visit Ram Janmabhoomi, Hanuman Garhi & Sarayu River' },
  { slug: 'jhansi', title: 'Jhansi Tour Packages: Visit Jhansi Fort & Learn about Rani Lakshmi Bai' },
  { slug: 'kushinagar', title: 'Kushinagar Tour Packages: Visit Mahaparinirvana Temple & Buddhist Pilgrimage' },
  { slug: 'mathura', title: 'Mathura Tour Packages: Explore Krishna Janmabhoomi & Holy Temples' },
  { slug: 'chitrakoot', title: 'Chitrakoot Tour Packages: Explore Sacred Forests, Ramghat & Holy Temples' },
  { slug: 'lucknow', title: 'Lucknow Tour Packages: Explore Bara Imambara, Rumi Darwaza & Awadhi Culture' },

  { slug: 'orchha', title: 'Orchha Tour Packages: Visit Jahangir Mahal, Ram Raja Temple & Forts' },
  { slug: 'khajuraho', title: 'Khajuraho Tour Packages: Explore UNESCO Heritage Temples & Sculptures' },

  { slug: 'amritsar', title: 'Amritsar Tour Packages: Visit Golden Temple, Jallianwala Bagh & Wagah Border' }
];

async function updateTitles() {
  console.log(`Starting update for ${cityUpdates.length} cities...`);
  let successCount = 0;
  
  for (const city of cityUpdates) {
    try {
      const result = await prisma.city.updateMany({
        where: { slug: city.slug },
        data: { seoTitle: city.title }
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
  console.log(`\nUpdate completed! Successfully updated ${successCount} cities.`);
}

updateTitles().finally(() => prisma.$disconnect());
