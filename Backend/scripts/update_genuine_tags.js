import { prisma } from "../utils/prismaConnection.js";

const genuineTags = {
  "kullu": "Valley of the Gods",
  "kasauli": "Colonial Hill Station",
  "malana": "Ancient Himalayan Village",
  "patiala": "City of Royals",
  "bathinda": "City of Lakes",
  "hemis monastery": "Largest Ladakh Monastery",
  "ranthambore": "Land of Bengal Tigers",
  "ludhiana": "Manchester of India",
  "varanasi": "The Spiritual Capital",
  "chamba": "Land of Antiquity",
  "firozpur": "City of Martyrs",
  "gurugram": "Millennium City",
  "pahalgam": "Valley of Shepherds",
  "jaipur": "The Pink City",
  "mumbai": "City of Dreams",
  "sarnath": "Birthplace of Buddhism",
  "rishikesh": "Yoga Capital of World",
  "jim corbett national park": "Oldest National Park",
  "munsiyari": "Little Kashmir",
  "orchha": "Land of Ram Raja",
  "doodhpathri": "Valley of Milk",
  "kedarnath": "Abode of Lord Shiva",
  "jalandhar": "Oldest City in Punjab",
  "khajuraho": "Temple City of India",
  "yusmarg": "Meadow of Jesus",
  "bikaner": "The Camel Country",
  "bharatpur": "Bird Sanctuary City",
  "doda": "Mini Kashmir",
  "mcleod ganj": "Little Lhasa of India",
  "spiti valley": "Middle Land of Himalayas",
  "amritsar": "The Golden Temple",
  "anandpur sahib": "The Holy City of Bliss",
  "udaipur": "City of Lakes",
  "almora": "Cultural Capital of Kumaon",
  "chandigarh": "The Beautiful City",
  "katra": "Gateway to Vaishno Devi",
  "kausani": "Switzerland of India",
  "shimla": "Queen of Hills",
  "agra": "Home of Taj Mahal",
  "kapurthala": "Paris of Punjab",
  "pushkar": "The Holy Lake City",
  "fatehpur sikri tours": "City of Victory",
  "zanskar valley": "Virgin Valleys of Ladakh",
  "alchi monastery": "Oldest Monastery in Ladakh",
  "kargil": "Land of Martyrs",
  "manali": "Valley of the Gods",
  "vrindavan": "City of Temples",
  "srinagar": "Heaven on Earth",
  "jodhpur": "The Blue City",
  "mussoorie": "Queen of the Hills",
  "palampur": "Tea Capital of Northwest",
  "haridwar": "Gateway to Gods",
  "dalhousie": "Little Switzerland of India",
  "alwar": "Tiger Gate of Rajasthan",
  "khardung la": "Highest Motorable Pass",
  "mount abu": "Oasis in the Desert",
  "ajmer": "Holy City of Khwaja",
  "jammu": "City of Temples",
  "dharamshala": "Winter Capital of HP",
  "auli": "Skiing Destination of India",
  "prayagraj": "City of Sangam",
  "dudhwa national park": "Terai Ecosystem Reserve",
  "kota": "Education City of India",
  "ayodhya": "Birthplace of Lord Ram",
  "chittorgarh": "The Largest Fort City",
  "patnitop": "Meadow of the Princess",
  "jhansi": "City of Rani Lakshmi",
  "kushinagar": "Parinirvana of Buddha",
  "valley of flowers national park": "Alpine Flower Paradise",
  "pathankot": "Gateway to J&K",
  "chopta": "Mini Switzerland",
  "mathura": "Birthplace of Lord Krishna",
  "nainital": "City of Lakes",
  "chitrakoot": "Hill of Many Wonders",
  "badrinath": "Abode of Lord Vishnu",
  "pangong tso": "Highest Saltwater Lake",
  "bir billing": "Paragliding Capital",
  "shekhawati": "Open Art Gallery",
  "bundi": "City of Stepwells",
  "sonamarg": "Meadow of Gold",
  "kasol": "Mini Israel of India",
  "lucknow": "City of Nawabs",
  "gulmarg": "Meadow of Flowers",
  "aharbal waterfall": "Niagara of Kashmir",
  "aru valley": "Base for Kolahoi",
  "jaisalmer": "The Golden City",
  "turtuk": "Village at the Border",
  "nubra valley": "Orchard of Ladakh",
  "tso moriri lake": "Mountain Lake",
  "magnetic hill": "Defy Gravity in Ladakh",
  "lamayuru monastery": "Moonland of Ladakh",
  "leh": "Land of High Passes",
  "hemkund sahib": "Sikh Pilgrimage Site",
  "ranikhet": "Queen's Meadow",
  "tirthan valley": "Secret of Himachal",
  "kinnaur": "Land of God",
  "delhi": "Heart of India",
  "delhi  ncr": "Heart of India",
  "rajasthan": "The Royal State",
  "himachal pradesh": "Land of Mountains",
  "uttarakhand": "Land of Gods",
  "india tour": "Incredible India",
  "punjab": "Land of Five Rivers",
  "uttar pradesh": "Heartland of India",
  "jammu and kashmir": "Heaven on Earth"
};

async function main() {
  console.log("Starting Genuine Banner Updates...");
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
    
    // Assign the genuine tag
    let bannerTag = genuineTags[lowerTitle];
    
    // If somehow missing, use a safe non-generic regional fallback
    if (!bannerTag) {
      if (lowerTitle.includes("tour")) bannerTag = "Incredible India";
      else bannerTag = "Rich Cultural Heritage";
    }

    await prisma.banner.update({
      where: { id: banner.id },
      data: { bannerTitle: cleanTitle, bannerTag: bannerTag }
    });
    console.log(`Assigned: ${cleanTitle} -> ${bannerTag}`);
  }

  console.log("All cities updated with Genuine Tags!");
}

main().then(() => prisma.$disconnect()).catch(console.error);
