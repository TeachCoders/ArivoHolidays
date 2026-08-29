export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

export const HOME_FAQS: FaqItem[] = [
  { id: 1, question: "How do I customize my holiday package?", answer: "Click 'Get Custom Quote' or share your destination and dates in the search box. Our travel expert will call you to plan hotels, days and cab options as per your budget.", category: "Booking" },
  { id: 2, question: "Are hotel stays and cabs verified?", answer: "Yes. All our hotels and cab drivers are checked before every trip. We make sure rooms are clean, cars are sanitized and drivers are licensed.", category: "Safety" },
  { id: 3, question: "What is your booking advance policy?", answer: "You only pay a small advance to confirm your booking. The rest can be paid later, close to your travel date or on hotel arrival.", category: "Payment" },
  { id: 4, question: "Will I get an itinerary quotation on WhatsApp?", answer: "Yes. After you send your enquiry, our team shares a clear day-by-day quotation on WhatsApp — with prices, hotels and what's included.", category: "Booking" },
  { id: 5, question: "What if I need assistance during the trip?", answer: "You get a dedicated trip assistant available 24/7. For flight delays, hotel changes or any help, just call — we'll take care of it.", category: "Support" },
];
