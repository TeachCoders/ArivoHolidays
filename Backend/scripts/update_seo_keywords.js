import { prisma } from "../utils/prismaConnection.js";

const cityKeywords = {
  "agra": "taj mahal tour, agra fort trip",
  "jaipur": "amber fort tour, pink city sightseeing, hawa mahal trip",
  "udaipur": "lake pichola boat ride, city palace tour, romantic udaipur trip",
  "varanasi": "ganga aarti tour, kashi vishwanath trip, varanasi ghats sightseeing",
  "ranthambore": "tiger safari tour, jungle safari ranthambore, wildlife trip india",
  "manali": "solang valley snow trip, rohtang pass tour, manali honeymoon trip",
  "srinagar": "dal lake shikara ride, gulmarg snow tour, srinagar houseboats",
  "jaisalmer": "camel safari thar desert, jaisalmer fort tour, desert camping rajasthan",
  "jodhpur": "mehrangarh fort tour, blue city sightseeing",
  "rishikesh": "river rafting rishikesh, yoga retreat india, ganga camping",
  "jim corbett national park": "corbett tiger safari, jungle safari uttarakhand",
  "kerala": "backwaters houseboat tour, munnar tea gardens, kerala ayurveda trip",
  "mcleod ganj": "dalai lama temple tour, dharamshala sightseeing, triund trek",
  "bikaner": "camel festival bikaner, junagarh fort trip",
  "pushkar": "brahma temple tour, pushkar camel fair, holy lake pushkar",
  "amritsar": "golden temple tour, wagah border trip, punjab culture tour",
  "delhi": "red fort tour, india gate sightseeing, old delhi heritage walk",
  "khajuraho": "khajuraho temples tour, heritage sightseeing india",
  "andaman": "havelock island tour, scuba diving andaman, pristine beach holidays",
  "goa": "goa beach holidays, water sports goa, romantic goa trip",
  "leh": "pangong lake tour, nubra valley trip, khardung la pass ride",
  "ayodhya": "ram mandir tour, ayodhya pilgrimage, holy sarayu river trip",
  "mathura": "krishna janmabhoomi tour, vrindavan temples trip",
  "kushinagar": "buddhist pilgrimage india, mahaparinirvana temple tour",
  "bodh gaya": "mahabodhi temple tour, buddhist circuit india"
};

function generateKeywords(title, isExperience = false) {
  const baseTitle = title.toLowerCase();
  
  if (isExperience) {
    return `${baseTitle} tour packages in india, best ${baseTitle} holiday trips, book ${baseTitle} vacation, ${baseTitle} travel packages india`;
  }

  const generic = `${baseTitle} tour packages, best ${baseTitle} holiday trip, ${baseTitle} travel packages in india, book ${baseTitle} sightseeing tour, ${baseTitle} vacation packages`;
  
  const custom = cityKeywords[baseTitle];
  if (custom) {
    return `${custom}, ${generic}`;
  }
  
  return generic;
}

async function main() {
  console.log("Starting SEO Keyword Updates...");
  let count = 0;

  // Process Cities
  const cities = await prisma.city.findMany();
  for (const city of cities) {
    const keywords = generateKeywords(city.title, false);
    await prisma.city.update({
      where: { id: city.id },
      data: { seoKeyword: keywords }
    });
    count++;
  }

  // Process States
  const states = await prisma.state.findMany();
  for (const state of states) {
    const keywords = generateKeywords(state.title, false);
    await prisma.state.update({
      where: { id: state.id },
      data: { seoKeyword: keywords }
    });
    count++;
  }

  // Process Countries
  const countries = await prisma.country.findMany();
  for (const country of countries) {
    const keywords = generateKeywords(country.title, false);
    await prisma.country.update({
      where: { id: country.id },
      data: { seoKeyword: keywords }
    });
    count++;
  }

  // Process Experiences
  const experiences = await prisma.travelExperience.findMany();
  for (const exp of experiences) {
    const keywords = generateKeywords(exp.title, true);
    await prisma.travelExperience.update({
      where: { id: exp.id },
      data: { seoKeyword: keywords }
    });
    count++;
  }

  console.log(`Updated SEO Keywords for ${count} locations!`);
}

main().then(() => prisma.$disconnect()).catch(console.error);
