import { prisma } from '../utils/prismaConnection.js';

async function checkRemainingCities() {
  const allCities = await prisma.city.findMany({
    where: { isActive: true },
    select: { slug: true, title: true, seoTitle: true, overView: true }
  });
  
  console.log(`Total active cities in DB: ${allCities.length}`);
  
  const updatedSlugs = [
    'pahalgam', 'ranthambore', 'bharatpur', 'orchha', 'sarnath', 'khajuraho', 
    'doodhpathri', 'yusmarg', 'bikaner', 'doda', 'amritsar', 'katra', 'pushkar', 
    'fatehpur-sikri', 'vrindavan', 'jodhpur', 'alwar', 'mount-abu', 'ajmer', 
    'kota', 'chittorgarh', 'shekhawati', 'bundi', 'jaisalmer', 'prayagraj', 
    'dudhwa-national-park', 'ayodhya', 'jhansi', 'kushinagar', 'mathura', 
    'chitrakoot', 'lucknow', 'jammu', 'patnitop', 'sonamarg', 'gulmarg', 
    'aharbal-waterfall', 'aru-valley'
  ];
  
  const remainingCities = allCities.filter(c => !updatedSlugs.includes(c.slug));
  
  console.log(`\nRemaining cities not updated in the last batch (${remainingCities.length}):`);
  remainingCities.forEach(c => {
    console.log(`- ${c.slug} | ${c.title} | SEO Title: ${c.seoTitle}`);
  });
}

checkRemainingCities().catch(console.error).finally(() => prisma.$disconnect());
