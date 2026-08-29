"use strict";
/**
 * Seeds realistic travel FAQ data for the chatbot.
 * Deletes all existing FAQs first, then adds fresh ones.
 * Usage: node scripts/seed_realistic_faqs.js
 */
import "dotenv/config";
import { prisma } from "../utils/prismaConnection.js";

const FAQS = [
  {
    question: "aapka cancellation policy kya hai?",
    keywords: ["cancel", "cancellation", "refund", "wapas", "paise", "policy", "return", "money back"],
    answer: "Hamare cancellation policy ke hisaab se:\n• 30+ din pehle cancel karein → 90% refund\n• 15-29 din pehle → 50% refund\n• 7-14 din pehle → 25% refund\n• 7 din se kam → No refund\n\nKisi bhi doubt ke liye humare expert se seedha baat kar sakte hain.",
    sortOrder: 1,
  },
  {
    question: "kya package mein hotel included hai?",
    keywords: ["hotel", "stay", "accommodation", "raat", "room", "lodge", "resort", "included", "include", "kahan rehna"],
    answer: "Haan! Hamare tour packages mein hotel stay included hoti hai. Budget ke hisaab se choose karein:\n• Budget: 3-star hotels\n• Mid-range: 4-star hotels\n• Luxury: 5-star resorts\n\nSaare hotels verified aur tourist-friendly hain.",
    sortOrder: 2,
  },
  {
    question: "kya flight ticket bhi milega?",
    keywords: ["flight", "ticket", "aeroplane", "hawai", "air", "fly", "plane", "airfare", "flight included"],
    answer: "Hamare packages do tarah ke hote hain:\n1. Land Package — sirf hotel, transport, sightseeing (flight alag se book karni hogi)\n2. Holiday Package with Flights — flight + hotel + sab kuch included\n\nAap kaunsa chahte hain? Humare expert aapko best deal dhundhne mein help karenge.",
    sortOrder: 3,
  },
  {
    question: "honeymoon ke liye best destination kaunsa hai?",
    keywords: ["honeymoon", "couple", "romantic", "naya shaadi", "newly married", "romance", "love trip", "couple trip"],
    answer: "Hamare top honeymoon destinations:\n🌴 Kerala — backwaters, houseboat, greenery\n🏝️ Maldives — overwater villa, crystal clear water\n🏔️ Shimla/Manali — snow, cozy hotels\n🏰 Udaipur — royal palaces, lake view\n🌊 Andaman — beaches, snorkeling\n\nAap kab travel karna chahte hain? Budget batayein, best package suggest karenge!",
    sortOrder: 4,
  },
  {
    question: "family trip ke liye kaunsa package sahi hai?",
    keywords: ["family", "family trip", "bachche", "kids", "parents", "gharwale", "group", "sab log", "family tour"],
    answer: "Family trips ke liye hamare paas special packages hain! Popular destinations:\n👨‍👩‍👧 Goa — beach + water sports + fun\n🏔️ Himachal — nature + adventure\n🐯 Ranthambore — wildlife safari\n🕌 Rajasthan — forts, camels, culture\n🏝️ Andaman — islands + snorkeling\n\nKitne log hain aur budget kya hai? Customize package banate hain!",
    sortOrder: 5,
  },
  {
    question: "group discount milega?",
    keywords: ["group", "discount", "offer", "group booking", "sab saath", "friends group", "bulk", "group rate"],
    answer: "Haan! Group booking par special discounts milte hain:\n• 5-9 log: 5% discount\n• 10-15 log: 10% discount\n• 15+ log: 15% tak discount + free gift hamper\n\nGroup size aur destination batayein, special quote tayar karenge!",
    sortOrder: 6,
  },
  {
    question: "kitne din pehle booking karni chahiye?",
    keywords: ["advance booking", "kitne din", "book karna", "advance", "early", "confirm", "booking time"],
    answer: "Best prices aur availability ke liye:\n• International trips: 45-60 din pehle\n• Domestic trips: 15-30 din pehle\n• Peak season (Dec-Jan, Summer): 2-3 mahine pehle\n\nLast minute booking bhi hoti hai but limited options hote hain. Abhi book karein aur best deal paayein!",
    sortOrder: 7,
  },
  {
    question: "visa mein help milegi?",
    keywords: ["visa", "passport", "document", "permission", "foreign", "abroad", "international", "visa process"],
    answer: "Haan! Hamare international packages mein visa assistance included hoti hai:\n✅ Visa documents checklist\n✅ Application fill karne mein help\n✅ Embassy coordination\n\nNote: Visa fee government ke hisaab se alag pay karni hogi. Dubai, Thailand, Singapore ke liye on-arrival ya e-visa milta hai — process bahut aasaan hai!",
    sortOrder: 8,
  },
  {
    question: "payment kaise karna hai?",
    keywords: ["payment", "pay", "paisa", "online payment", "UPI", "EMI", "installment", "how to pay", "advance payment"],
    answer: "Hamare paas multiple payment options hain:\n💳 Credit/Debit Card\n📱 UPI (PhonePe, GPay, Paytm)\n🏦 Net Banking\n💰 EMI (0% interest on select cards)\n\nBooking confirm karne ke liye 20-30% advance dena hota hai, baaki trip se pehle pay karna hota hai.",
    sortOrder: 9,
  },
  {
    question: "kya trip customize ho sakti hai?",
    keywords: ["customize", "custom", "apne hisaab", "change", "modify", "itinerary", "plan change", "special request"],
    answer: "Bilkul! Hamare saare packages 100% customizable hain:\n✏️ Dates change kar sakte hain\n🏨 Hotel upgrade/downgrade\n🚗 Transport choice (cab/bus/train)\n📍 Extra destinations add karna\n⏰ Days kam ya zyada karna\n\nApni requirements batayein, humare expert ek personalized itinerary banayenge sirf aapke liye!",
    sortOrder: 10,
  },
  {
    question: "travel insurance milega?",
    keywords: ["insurance", "bima", "safety", "medical", "emergency", "accident", "coverage", "travel protection"],
    answer: "Haan! Hamare packages ke saath optional travel insurance available hai jo cover karta hai:\n🏥 Medical emergency\n✈️ Flight cancellation\n🧳 Baggage loss\n🚑 Emergency evacuation\n\nInternational trips ke liye travel insurance highly recommended hai.",
    sortOrder: 11,
  },
  {
    question: "kya solo travel ke liye package hai?",
    keywords: ["solo", "akela", "alone", "single", "ek banda", "solo travel", "solo trip", "single person"],
    answer: "Haan! Solo travelers ke liye hamare paas special packages hain:\n🏔️ Leh Ladakh solo adventure\n🌄 Spiti Valley backpacking\n🏝️ Goa solo beach trip\n🌿 Coorg solo retreat\n\nSolo travelers ke liye safe hotels, guided tours aur full support milta hai. Akele travel karna ab aur bhi aasaan!",
    sortOrder: 12,
  },
];

async function main() {
  console.log("🗑️  Deleting all existing FAQs...");
  const deleted = await prisma.chatFaq.deleteMany({});
  console.log(`✅ Deleted ${deleted.count} old FAQs\n`);

  console.log("📝 Adding realistic FAQs...");
  for (const faq of FAQS) {
    await prisma.chatFaq.create({ data: faq });
    console.log(`  ✓ "${faq.question}"`);
  }

  console.log(`\n🎉 Done! ${FAQS.length} FAQs added successfully.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
