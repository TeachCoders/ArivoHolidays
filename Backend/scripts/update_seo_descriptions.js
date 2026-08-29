import { prisma } from "../utils/prismaConnection.js";

const citySightseeing = {
  "kullu": "rafting on the Beas River and visit ancient temples",
  "kasauli": "walk through colonial architecture and pine forests",
  "malana": "trek to the ancient Himalayan village and meet the locals",
  "patiala": "visit the majestic Qila Mubarak and explore Royal Punjabi heritage",
  "bathinda": "relax by the lakes and visit the historic Qila Mubarak fort",
  "hemis monastery": "experience the vibrant Hemis festival and Buddhist culture",
  "ranthambore": "enjoy a thrilling jungle safari and spot wild Bengal tigers",
  "ludhiana": "explore the rich agricultural history and vibrant city life",
  "varanasi": "witness the mesmerizing evening Ganga Aarti and explore ancient ghats",
  "chamba": "admire ancient temples and beautiful Himalayan architecture",
  "firozpur": "pay respects at the historic martyr memorials",
  "gurugram": "enjoy modern entertainment, luxury shopping, and city life",
  "pahalgam": "ride horses through lush green valleys and visit Betaab Valley",
  "jaipur": "explore the majestic Amber Fort and vibrant pink city markets",
  "mumbai": "walk along Marine Drive and explore the Gateway of India",
  "sarnath": "visit ancient Buddhist stupas where Lord Buddha first taught",
  "rishikesh": "practice yoga by the Ganges and experience thrilling river rafting",
  "jim corbett national park": "go on an exciting jeep safari to spot wild elephants and tigers",
  "munsiyari": "trek through snow-capped peaks and enjoy stunning Himalayan views",
  "orchha": "visit the grand Jahangir Mahal and the holy Ram Raja Temple",
  "doodhpathri": "relax in the beautiful green meadows and pine forests",
  "kedarnath": "trek to the holy Shiva temple amidst breathtaking snowy mountains",
  "jalandhar": "experience rich Punjabi culture and traditional street food",
  "khajuraho": "marvel at the UNESCO world heritage temples and intricate carvings",
  "yusmarg": "enjoy peaceful walks through the mesmerizing Meadow of Jesus",
  "bikaner": "go on an unforgettable camel safari and visit Junagarh Fort",
  "bharatpur": "spot rare migratory birds at the Keoladeo National Park",
  "doda": "explore untouched natural beauty and serene Kashmiri landscapes",
  "mcleod ganj": "visit the Dalai Lama Temple and experience peaceful Tibetan culture",
  "spiti valley": "drive through the rugged Himalayan desert and visit ancient monasteries",
  "amritsar": "experience the divine beauty of the Golden Temple and Wagah Border",
  "anandpur sahib": "visit the holy Takht Sri Keshgarh Sahib and explore Sikh history",
  "udaipur": "enjoy a romantic boat ride on Lake Pichola and visit the City Palace",
  "almora": "explore the rich cultural heritage and beautiful Kumaoni temples",
  "chandigarh": "relax at the famous Rock Garden and enjoy the beautiful Sukhna Lake",
  "katra": "start your holy pilgrimage journey to the Vaishno Devi temple",
  "kausani": "enjoy breathtaking panoramic views of the great Himalayan peaks",
  "shimla": "stroll down the historic Mall Road and enjoy the beautiful colonial architecture",
  "agra": "experience the magic of the Taj Mahal and explore the grand Agra Fort",
  "kapurthala": "admire the French-style architecture of Jagatjit Palace",
  "pushkar": "visit the holy Pushkar Lake and the world-famous Brahma Temple",
  "fatehpur sikri tours": "explore the magnificent abandoned Mughal city of Emperor Akbar",
  "zanskar valley": "trek across frozen rivers and discover isolated Buddhist monasteries",
  "alchi monastery": "marvel at ancient 11th-century Buddhist frescoes and wood carvings",
  "kargil": "visit the Kargil War Memorial and experience the rugged mountain beauty",
  "manali": "enjoy thrilling snow activities in Solang Valley and relax in the beautiful Himalayas",
  "vrindavan": "experience the divine atmosphere of countless ancient Krishna temples",
  "srinagar": "enjoy a peaceful Shikara ride on the world-famous Dal Lake",
  "jodhpur": "explore the massive Mehrangarh Fort and the beautiful blue streets",
  "mussoorie": "enjoy scenic cable car rides and beautiful misty mountain views",
  "palampur": "walk through lush green tea gardens and enjoy the pleasant climate",
  "haridwar": "take a holy dip in the Ganges and witness the spectacular evening Aarti",
  "dalhousie": "explore beautiful colonial churches and peaceful pine tree forests",
  "alwar": "visit the historic Bhangarh Fort and explore the Sariska Tiger Reserve",
  "khardung la": "drive through one of the highest motorable mountain passes in the world",
  "mount abu": "visit the stunning Dilwara Temples and relax at Nakki Lake",
  "ajmer": "seek blessings at the holy Ajmer Sharif Dargah",
  "jammu": "explore the ancient Raghunath Temple and the grand Mubarak Mandi Palace",
  "dharamshala": "relax in the peaceful Himalayan mountains and explore Tibetan monasteries",
  "auli": "enjoy thrilling skiing adventures and beautiful snow-covered slopes",
  "prayagraj": "witness the holy Triveni Sangam where three sacred rivers meet",
  "dudhwa national park": "go on a thrilling jeep safari to spot the rare Indian rhinoceros",
  "kota": "visit the beautiful Seven Wonders Park and the historic Garh Palace",
  "ayodhya": "seek blessings at the holy Ram Janmabhoomi and explore sacred temples",
  "chittorgarh": "explore the largest fort in India and learn about brave Rajput history",
  "patnitop": "enjoy peaceful walks in lush meadows and thrilling paragliding flights",
  "jhansi": "visit the historic Jhansi Fort and learn about the brave Rani Lakshmi Bai",
  "kushinagar": "visit the sacred Mahaparinirvana Temple where Lord Buddha attained peace",
  "valley of flowers national park": "trek through a magical valley filled with thousands of colorful alpine flowers",
  "pathankot": "relax by the Ranjit Sagar Dam and explore the historic Nurpur Fort",
  "chopta": "trek to the holy Tungnath temple and enjoy stunning Himalayan views",
  "mathura": "celebrate the colorful festivals at the birthplace of Lord Krishna",
  "nainital": "enjoy a peaceful boat ride on Naini Lake and ride the scenic ropeway",
  "chitrakoot": "explore the sacred forests and holy temples associated with Lord Ram",
  "badrinath": "seek blessings at the holy Badrinath Temple in the beautiful Garhwal Himalayas",
  "pangong tso": "camp by the crystal-clear blue waters of the highest saltwater lake",
  "bir billing": "experience the thrill of tandem paragliding in the adventure capital of India",
  "shekhawati": "explore magnificent ancient havelis covered in beautiful traditional frescoes",
  "bundi": "discover beautiful ancient stepwells and the historic Taragarh Fort",
  "sonamarg": "trek to the stunning Thajiwas Glacier and enjoy the Meadow of Gold",
  "kasol": "relax by the Parvati River and enjoy the unique cafe culture",
  "lucknow": "taste delicious Awadhi cuisine and explore the grand Bara Imambara",
  "gulmarg": "ride the famous Gondola cable car and enjoy world-class skiing",
  "aharbal waterfall": "witness the powerful and majestic Niagara Falls of Kashmir",
  "aru valley": "trek through lush green meadows and camp by crystal clear rivers",
  "jaisalmer": "enjoy a magical camel safari and camp under the stars in the Thar Desert",
  "turtuk": "explore the unique Balti culture and beautiful apricot orchards",
  "nubra valley": "ride double-humped Bactrian camels across the cold desert sand dunes",
  "tso moriri lake": "relax by the peaceful and untouched high-altitude mountain lake",
  "magnetic hill": "experience the magic of a vehicle moving uphill with the engine off",
  "lamayuru monastery": "explore the fascinating lunar landscapes of the Moonland of Ladakh",
  "leh": "visit the majestic Leh Palace and explore vibrant Tibetan markets",
  "hemkund sahib": "trek to the holy Sikh pilgrimage site surrounded by glacial lakes",
  "ranikhet": "enjoy peaceful walks through beautiful pine forests and lush green meadows",
  "tirthan valley": "enjoy trout fishing and relax in the untouched beauty of Himachal",
  "kinnaur": "drive through spectacular rocky mountains and beautiful apple orchards",
  "delhi": "explore the historic Red Fort, India Gate, and the vibrant streets of Old Delhi",
  "delhi  ncr": "explore the historic Red Fort, India Gate, and the vibrant streets of Old Delhi",
  "rajasthan": "explore majestic royal forts, vast deserts, and vibrant Rajput culture",
  "himachal pradesh": "relax in beautiful hill stations and enjoy thrilling snow adventures",
  "uttarakhand": "visit holy pilgrimage sites and trek through the majestic Himalayas",
  "india tour": "explore the diverse culture, historic monuments, and beautiful landscapes",
  "punjab": "experience rich Sikh heritage, delicious food, and vibrant cultural festivals",
  "uttar pradesh": "visit the iconic Taj Mahal, holy Ganges, and ancient heritage sites",
  "jammu and kashmir": "enjoy peaceful shikara rides, snowy mountains, and heavenly valleys"
};

const verbs = [
  "Experience the magic of",
  "Explore the beauty of",
  "Discover the hidden wonders of",
  "Witness the incredible"
];

const adjectives = [
  "premium",
  "hassle-free",
  "perfect",
  "memorable",
  "unforgettable",
  "peaceful",
  "relaxing"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Starting Natural SEO Description Updates...");
  
  // 1. Process Cities
  const cities = await prisma.city.findMany();
  for (const city of cities) {
    const sight = citySightseeing[city.title.toLowerCase()];
    if (sight) {
      const verb = getRandom(verbs);
      const adj = getRandom(adjectives);
      const desc = `${verb} ${city.title} - ${sight}. Book the best ${city.title} tour packages in India with Arivo Holiday for a ${adj} trip!`;
      await prisma.city.update({
        where: { id: city.id },
        data: { seoDescription: desc }
      });
      console.log(`Updated City: ${city.title}`);
    }
  }

  // 2. Process States
  const states = await prisma.state.findMany();
  for (const state of states) {
    const sight = citySightseeing[state.title.toLowerCase()];
    if (sight) {
      const verb = getRandom(verbs);
      const adj = getRandom(adjectives);
      const desc = `${verb} ${state.title} - ${sight}. Book the best ${state.title} tour packages in India with Arivo Holiday for a ${adj} holiday!`;
      await prisma.state.update({
        where: { id: state.id },
        data: { seoDescription: desc }
      });
      console.log(`Updated State: ${state.title}`);
    }
  }

  // 3. Process Countries
  const countries = await prisma.country.findMany();
  for (const country of countries) {
    const sight = citySightseeing[country.title.toLowerCase()];
    if (sight) {
      const verb = getRandom(verbs);
      const adj = getRandom(adjectives);
      const desc = `${verb} ${country.title} - ${sight}. Book the best ${country.title} tour packages with Arivo Holiday for a ${adj} vacation!`;
      await prisma.country.update({
        where: { id: country.id },
        data: { seoDescription: desc }
      });
      console.log(`Updated Country: ${country.title}`);
    }
  }

  console.log("Natural SEO Descriptions Update Complete!");
}

main().then(() => prisma.$disconnect()).catch(console.error);
