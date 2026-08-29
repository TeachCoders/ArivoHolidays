import fs from 'fs';
import path from 'path';

const cities = [
  { city: 'Pahalgam', attraction: 'Betaab Valley', activity: "exploring Aru Valley's scenic landscapes" },
  { city: 'Ranthambore', attraction: 'National Park', activity: 'a thrilling Jungle Safari to spot Bengal Tigers' },
  { city: 'Bharatpur', attraction: 'Keoladeo National Park', activity: 'peaceful Bird Watching' },
  { city: 'Orchha', attraction: 'Jahangir Mahal', activity: 'exploring the ancient Forts' },
  { city: 'Sarnath', attraction: 'Buddhist Stupas', activity: 'seeing the historic Ashoka Pillar' },
  { city: 'Khajuraho', attraction: 'UNESCO Heritage Temples', activity: 'admiring ancient Sculptures' },
  { city: 'Doodhpathri', attraction: 'Pine Forests', activity: 'relaxing by the River Streams' },
  { city: 'Yusmarg', attraction: 'Meadow of Jesus', activity: 'walking through Pine Valleys' },
  { city: 'Bikaner', attraction: 'Junagarh Fort', activity: 'an exciting Camel Safari in the desert' },
  { city: 'Doda', attraction: 'untouched natural beauty', activity: 'experiencing serene landscapes' },
  { city: 'Amritsar', attraction: 'Golden Temple', activity: 'the patriotic Wagah Border ceremony' },
  { city: 'Katra', attraction: 'holy mountains', activity: 'starting your Pilgrimage to Mata Vaishno Devi' },
  { city: 'Pushkar', attraction: 'Brahma Temple', activity: 'an exciting Camel Safari near the Pushkar Lake' },
  { city: 'Fatehpur Sikri', attraction: 'Buland Darwaza', activity: 'exploring stunning Mughal Architecture' },
  { city: 'Vrindavan', attraction: 'Banke Bihari Temple', activity: 'experiencing the spiritual atmosphere' },
  { city: 'Jodhpur', attraction: 'Mehrangarh Fort', activity: 'exploring the vibrant Blue City streets' },
  { city: 'Alwar', attraction: 'Bhangarh Fort', activity: 'a thrilling Sariska Tiger Safari' },
  { city: 'Mount Abu', attraction: 'Dilwara Temples', activity: 'a peaceful boat ride on Nakki Lake' },
  { city: 'Ajmer', attraction: 'Ajmer Sharif Dargah', activity: 'a relaxing walk near Ana Sagar Lake' },
  { city: 'Kota', attraction: 'Seven Wonders Park', activity: 'exploring the Garh Palace by the Chambal River' },
  { city: 'Chittorgarh', attraction: 'massive Chittorgarh Fort', activity: 'learning about brave Rajput History' },
  { city: 'Shekhawati', attraction: 'Painted Havelis', activity: 'discovering Traditional Frescoes' },
  { city: 'Bundi', attraction: 'Taragarh Fort', activity: 'exploring ancient Stepwells' },
  { city: 'Jaisalmer', attraction: 'Sonar Quila', activity: 'a magical Camel Safari in the Thar Desert' },
  { city: 'Prayagraj', attraction: 'Triveni Sangam', activity: 'the holy Kumbh Mela atmosphere' },
  { city: 'Dudhwa National Park', attraction: 'deep jungles', activity: 'a Wildlife Safari to spot Rhinos' },
  { city: 'Ayodhya', attraction: 'Ram Janmabhoomi', activity: 'a peaceful evening by the Sarayu River' },
  { city: 'Jhansi', attraction: 'historic Jhansi Fort', activity: 'learning about the brave Rani Lakshmi Bai' },
  { city: 'Kushinagar', attraction: 'Mahaparinirvana Temple', activity: 'a peaceful Buddhist Pilgrimage' },
  { city: 'Mathura', attraction: 'Krishna Janmabhoomi', activity: 'experiencing the vibrant temple festivals' },
  { city: 'Chitrakoot', attraction: 'Sacred Forests', activity: 'the holy atmosphere at Ramghat' },
  { city: 'Lucknow', attraction: 'Bara Imambara', activity: 'experiencing the rich Awadhi Culture' },
  { city: 'Jammu', attraction: 'Raghunath Temple', activity: 'exploring the historic Bahu Fort' },
  { city: 'Patnitop', attraction: 'Snow Mountains', activity: 'thrilling Paragliding flights' },
  { city: 'Sonamarg', attraction: 'Thajiwas Glacier', activity: 'trekking through the Meadow of Gold' },
  { city: 'Gulmarg', attraction: 'Snow Mountains', activity: 'riding the famous Gondola Cable Car' },
  { city: 'Aharbal Waterfall', attraction: 'Niagara Falls of Kashmir', activity: 'enjoying the scenic beauty' },
  { city: 'Aru Valley', attraction: 'Lush Meadows', activity: 'trekking beside Crystal Clear Rivers' }
];

let mdContent = `# Comprehensive Page Overview Updates for Cities\n\n`;
mdContent += `As requested, here is the COMPLETE list of all 38 cities with their unique ` + '`' + `pageOverview` + '`' + ` content. Each overview has been perfectly tailored using the "Attraction + Activity" formula with the Arivo Holidays branding.\n\n`;

mdContent += `## User Review Required\n\n`;
mdContent += `> [!IMPORTANT]\n`;
mdContent += `> Please review the overviews for all 38 cities below. If you approve this exact wording and mapping, please reply with **"Approve"** and I will execute the script to bulk update the database.\n\n`;
mdContent += `---\n\n`;

cities.forEach(c => {
  mdContent += `### ${c.city}\n`;
  mdContent += "```html\n";
  mdContent += `<p><strong>Are you looking to visit the ${c.attraction} and experience ${c.activity} in ${c.city}?</strong></p>\n`;
  mdContent += `<p><strong>Arivo Holidays</strong> has created the best itinerary for you where you can explore the ${c.attraction} and enjoy ${c.activity}. This is planned specially and uniquely for you, ensuring a comfortable and memorable trip.</p>\n`;
  mdContent += `<p><strong>Scroll down to check out our hand-picked tour packages below and click to book your dream trip! 👇</strong></p>\n`;
  mdContent += "```\n\n";
});

const outPath = '/home/rajnish/.gemini/antigravity/brain/854f34e1-6f88-4cd9-a78a-cb6ab15cdb44/implementation_plan.md';
fs.writeFileSync(outPath, mdContent);
console.log('Successfully generated implementation_plan.md');
