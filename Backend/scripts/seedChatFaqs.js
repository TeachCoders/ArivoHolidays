"use strict";
/**
 * Seeds the chat bot's FAQ knowledge base.
 *
 * IMPORTANT RULE: no answer here may ever contain a price/amount — tourists are
 * high-value and pricing is always a custom quote from the partner. Price
 * questions are intercepted by the bot before FAQ matching, but keep answers
 * price-free anyway.
 *
 * Usage: node scripts/seedChatFaqs.js
 * Idempotent — upserts on the `question` field.
 */
import "dotenv/config";
import { prisma } from "../utils/prismaConnection.js";

const FAQS = [
  {
    question: "Best time to visit India / Rajasthan",
    keywords: ["best time", "best season", "best month", "when to visit", "good time", "kab aaye", "kab jaye", "weather wise best"],
    answer: "Rajasthan aur northern India ke liye October se March best hai — thand ka mausam, festivals aur golden hours sab best lagte hain. Summers (April–June) kaafi garam hote hain, isliye winters me hi recommend karte hain. 😊",
  },
  {
    question: "How many days do I need?",
    keywords: ["how many days", "kitne din", "days needed", "duration", "trip length", "how long", "long enough", "time needed"],
    answer: "Agar pehli baar aa rahe hain to 5–7 din ka Golden Triangle (Delhi–Agra–Jaipur) perfect hai. 10–14 din ho to Rajasthan, Kerala ya Himalaya tak extend kar sakte hain. Aapke paas kitne din hain — hum usi hisaab se itinerary bana denge!",
  },
  {
    question: "Can you customize the itinerary?",
    keywords: ["custom", "customize", "customise", "tailor", "modify", "change itinerary", "make our own", "our own plan", "semi custom"],
    answer: "Bilkul! 🔧 Har trip fully custom hoti hai — aap destinations, hotels, transport aur pace sab decide kar sakte hain. Apne khud ka route banao, hum arrange kar denge.",
  },
  {
    question: "Popular routes for first time travellers",
    keywords: ["golden triangle", "popular route", "route", "suggest itinerary", "first time india", "pehli baar", "new to india", "classic"],
    answer: "First-time visitors ke liye Golden Triangle (Delhi – Agra/Taj Mahal – Jaipur) sabse popular hai. Thoda aur time ho to Ranthambore, Udaipur aur Pushkar add kar sakte hain. Hum suggest kar denge — bas batao kitne din!",
  },
  {
    question: "Visa process / e-visa help",
    keywords: ["visa", "e-visa", "evisa", "visa process", "visa help", "india visa"],
    answer: "India ka e-Visa online apply hota hai — passport, photo aur travel dates se. Hamari team aapko full visa guidance deti hai (process + required documents), taaki koi confusion na ho. 📄",
  },
  {
    question: "Airport pickup / arrival transfer",
    keywords: ["pickup", "pick up", "airport", "airport transfer", "arrival", "drop off", "drop", "transfer from airport", "receive at airport"],
    answer: "Haan, airport pickup available hai! 🚗 Jaise hi aapka flight number milta hai, hum aapka driver airport par ready rakhte hain — aapka naam ki placard ke saath. Arrival ke baad directly hotel drop.",
  },
  {
    question: "Local SIM card / internet / WiFi",
    keywords: ["sim", "sim card", "local sim", "internet", "mobile data", "wifi", "wi-fi", "network", "data pack"],
    answer: "Foreign tourists ke liye local eSIM aur prepaid SIM aasani se mil jaati hai. Saare hotels me free WiFi hota hai. Chaaho to hum arrival pe SIM ka arrangement bhi karwa sakte hain.",
  },
  {
    question: "Currency / money exchange / cards",
    keywords: ["currency", "money exchange", "exchange", "cash", "atm", "credit card", "debit card", "cards accept", "dollars to rupees", "foreign exchange"],
    answer: "Airport, hotels aur exchange centers pe USD/EUR se INR easily milta hai. Cards (Visa/Mastercard) almost everywhere accept hote hain, aur har jagah ATMs bhi hain. Thoda cash rakhna hamesha smart hai. 💳",
  },
  {
    question: "How do payments work?",
    keywords: ["payment", "pay", "advance", "balance", "deposit", "installment", "secure payment", "payment process", "how do i pay"],
    answer: "Booking secure hai — process simple hai: confirmation ke waqt ek chhota advance, aur baaki balance travel ke shuru hone se pehle. Payment bank transfer, card ya UPI se hota hai aur receipt har step pe milti hai.",
  },
  {
    question: "What hotels / accommodation options?",
    keywords: ["hotel", "hotels", "accommodation", "stay", "rooms", "category", "resort", "homestay", "heritage", "luxury hotel", "boutique"],
    answer: "Har category available hai — budget, mid-range, luxury, heritage havelis aur boutique resorts. Aap prefer batao, hum matching hotels book kar denge. Heritage stay (Rajasthan ki haveli) toh must-try hai! 🏨",
  },
  {
    question: "Transport between cities",
    keywords: ["transport", "car", "taxi", "cab", "driver", "between cities", "vehicle", "driving", "chauffeur", "sedan", "suv"],
    answer: "City-to-city transport fully arranged hota hai — comfortable AC sedans ya SUVs apne driver ke saath. Driver sahi time par, safe driving ke saath. Trains bhi popular hain agar aapko local experience chahiye.",
  },
  {
    question: "Private tour or group tour?",
    keywords: ["private tour", "group tour", "private", "group", "shared", "only us", "solo tour"],
    answer: "Private tours recommended hain — poori car, driver aur guide sirf aapke liye, fully flexible. Group tours bhi available hain agar aapko socialize pasand hai. Aapko comfort kaisa chahiye?",
  },
  {
    question: "Is it safe for families / foreigners?",
    keywords: ["safe", "safety", "secure", "safe for", "family", "kids", "children", "foreign", "solo female", "women"],
    answer: "Haan, bilkul! 🤝 India hotels, drivers aur guides certified & verified hote hain, aur har trip me 24×7 support hota hai. Families aur kids ke saath hamaare regular tours hote hain — full comfortable.",
  },
  {
    question: "Food / vegetarian options",
    keywords: ["food", "vegetarian", "veg", "vegan", "cuisine", "meals", "diet", "indian food", "restaurant", "halal"],
    answer: "India me vegetarian food kaafi popular hai — har hotel me fresh veg aur non-veg options hain. Street food se lekar fine-dining tak, hum best restaurants suggest karte hain. Spice level aapki choice! 🍛",
  },
  {
    question: "Do people speak English?",
    keywords: ["english", "language", "hindi", "guide speaks", "do they speak", "communication", "translator"],
    answer: "Haan — hotels, tourist spots aur guides sab English bolte hain. English-speaking guides aur drivers hamesha available hain, toh koi language tension nahi.",
  },
  {
    question: "Weather conditions",
    keywords: ["weather", "climate", "temperature", "rain", "summer", "winter", "monsoon", "hot", "cold"],
    answer: "Winter (Nov–Feb): thanda aur pleasant 🌤 · Summer (Apr–Jun): garam ☀️ · Monsoon (Jul–Sep): hara-bhara, kam crowd. Best time to visit ka detailed guide hum apne itinerary me bhi de dete hain.",
  },
  {
    question: "Health / vaccinations / travel medicine",
    keywords: ["vaccination", "vaccine", "health", "medicine", "stomach", "doctor", "hospitals", "travel health", "medication"],
    answer: "India ke liye koi mandatory vaccination nahi hai (yellow fever sirf kuch countries se aane walon ke liye). Apni regular medicine saath rakhna aur bottled water peena — hospital/doctor help ke liye 24×7 support available hai.",
  },
  {
    question: "Honeymoon trips",
    keywords: ["honeymoon", "romantic", "couple", "newly married", "wedding"],
    answer: "Honeymoon ke liye Udaipur (lake city), Kerala backwaters ya Himalaya — perfect! 💑 Private candlelight dinners, heritage suites aur romantic sunset rides arrange kar dete hain.",
  },
  {
    question: "Wildlife / tiger safari",
    keywords: ["wildlife", "tiger", "safari", "ranthambore", "national park", "animal", "jungle", "bear"],
    answer: "Ranthambore, Jim Corbett aur Gir — India ke national parks me tiger safari available hai. Morning/evening safaris book karwa dete hain, guide ke saath. Wildlife lovers ke liye must-add! 🐅",
  },
  {
    question: "Spiritual / yoga trips",
    keywords: ["spiritual", "temple", "pilgrimage", "varanasi", "pushkar", "rishikesh", "yoga", "meditation", "holy", "ganga aarti"],
    answer: "Varanasi ki Ganga Aarti, Rishikesh ka yoga, Pushkar ka Brahma temple aur Haridwar — spiritual circuits hum specialise karte hain. Peace aur culture dono milega. 🕉️",
  },
  {
    question: "Cancellation / refund policy",
    keywords: ["cancel", "cancellation", "refund", "refundable", "reschedule", "change date", "flexible booking"],
    answer: "Har booking me clear cancellation & refund policy hoti hai jo booking confirm hone par aapko document me milti hai. Dates change bhi ho sakti hain (availability ke hisaab se). Koi bhi change ho to hum 24×7 support par hain.",
  },
  {
    question: "What's included in the package?",
    keywords: ["included", "include", "excludes", "what's included", "what is included", "covered", "not included", "inclusions"],
    answer: "Har itinerary pe clearly likha hota hai kya included hai (hotels, transport, pickup, sightseeing, guide) aur kya nahi (flights, visas, personal expenses). Confirm karne se pehle pura breakdown milta hai. ✅",
  },
  {
    question: "24×7 support during the trip",
    keywords: ["support", "during the trip", "emergency", "24x7", "24/7", "help during", "contact during", "tour guide on call"],
    answer: "Trip ke dauran full support available hai — WhatsApp pe 24×7 emergency line, har stop pe contact point, aur koi bhi issue ho to hum immediate solve karte hain. Aap tension-free travel karo. 📞",
  },
  {
    question: "Track my booking / TRV ID",
    keywords: ["track", "trv", "trip id", "booking id", "status of my booking", "track my tour", "my tour status"],
    answer: "Aapki TRV ID se booking status humesha check ho sakti hai — jaise hi aapka account ready hota hai, aapko portal access milta hai jahan saare documents aur status dikhte hain.",
  },
  {
    question: "What packages do you have?",
    keywords: ["packages", "tours", "what do you offer", "trip options", "tour options", "what can you do", "holiday options"],
    answer: "Hamare paas Golden Triangle, Rajasthan royal, Kerala backwaters, Himachal, Himalayan, wildlife aur spiritual — har type ke packages hain. Website pe saare itineraries browse kar sakte hain, aur chaaho to fully custom bhi!",
  },
];

async function main() {
  const brand = process.env.BRAND_NAME || "Arivo Holiday";
  console.log(`Seeding chat FAQs for ${brand}...`);
  let created = 0;
  let updated = 0;

  for (let i = 0; i < FAQS.length; i++) {
    const faq = FAQS[i];
    const existing = await prisma.chatFaq.findFirst({ where: { question: faq.question } });
    if (existing) {
      await prisma.chatFaq.update({
        where: { id: existing.id },
        data: { keywords: faq.keywords, answer: faq.answer, isActive: true, sortOrder: i },
      });
      updated++;
    } else {
      await prisma.chatFaq.create({
        data: { question: faq.question, keywords: faq.keywords, answer: faq.answer, isActive: true, sortOrder: i },
      });
      created++;
    }
  }

  console.log(`Done — ${created} created, ${updated} updated, ${FAQS.length} total.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
