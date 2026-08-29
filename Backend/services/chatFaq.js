"use strict";
import { prisma } from "../utils/prismaConnection.js";
import { buildLinkedAnswer } from "./botLinkService.js";
import { logger } from "../utils/logger.js";

// ── Price questions must NEVER be answered with numbers ──
// Tourists are high-value; pricing is a custom quote from the partner.
const PRICE_KEYWORDS = [
  "price", "prices", "cost", "costs", "how much", "rate", "rates", "charge", "charges",
  "fee", "fees", "quote", "quotes", "quotation", "money", "rupees", "inr", "usd",
  "dollar", "euro", "£", "$", "€", "₹", "expensive", "cheap", "kitna kharcha",
  "kitna lega", "kitne me", "kima kharcha", "daam",
];

const PRICE_ANSWER =
  "Aapke trip ka exact cost custom itinerary ke hisaab se banta hai. Hamari team aapko 24 hours ke andar ek custom quote ke saath contact karega.";

let faqCache = { data: null, at: 0 };
const CACHE_TTL_MS = 60 * 1000;

async function loadFaqs() {
  const now = Date.now();
  if (faqCache.data && now - faqCache.at < CACHE_TTL_MS) return faqCache.data;
  const faqs = await prisma.chatFaq.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  faqCache = { data: faqs, at: now };
  return faqs;
}

/** True when the text looks like a pricing question. */
export function isPriceQuestion(text) {
  const normalized = (text || "").toLowerCase();
  return PRICE_KEYWORDS.some((kw) => normalized.includes(kw));
}

/**
 * Returns the best-matching FAQ record for a free-text question, or null.
 * Price questions never match (they resolve to the no-price fallback).
 * @param {string} text
 * @returns {Promise<import("@prisma/client").ChatFaq | null>}
 */
export async function matchFaq(text) {
  const normalized = (text || "").trim().toLowerCase();
  if (!normalized) return null;
  if (isPriceQuestion(normalized)) return null;

  const faqs = await loadFaqs();
  let best = null;
  let bestScore = 0;
  for (const faq of faqs) {
    let score = 0;
    for (const kw of faq.keywords || []) {
      const k = String(kw).toLowerCase().trim();
      if (k && normalized.includes(k)) score += k.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }
  return best;
}

/**
 * Builds the final reply string for a matched FAQ, appending the linked
 * entity's live data + clickable page link when the FAQ has one.
 * @param {import("@prisma/client").ChatFaq} faq
 * @returns {Promise<string>}
 */
export async function answerFaqForFaq(faq) {
  if (!faq) return null;
  if (faq.linkType) {
    const linked = await buildLinkedAnswer(faq);
    if (linked) {
      const rich = linked.answer ? `${faq.answer}\n\n${linked.answer}` : faq.answer;
      return { text: `${rich}${linked.link}`, buttons: linked.buttons || [] };
    }
  }
  return { text: faq.answer, buttons: [] };
}

/**
 * Returns the best-matching FAQ answer for a free-text question, or null.
 * Price questions always resolve to the no-price fallback answer.
 * @param {string} text
 * @returns {Promise<string|null>}
 */
export async function answerFaq(text) {
  const normalized = (text || "").trim().toLowerCase();
  if (!normalized) return null;

  if (isPriceQuestion(normalized)) return PRICE_ANSWER;

  const best = await matchFaq(normalized);
  if (!best) return null;
  return answerFaqForFaq(best);
}

// ── Stopwords excluded when auto-deriving FAQ keywords from a question ──
export const STOPWORDS = new Set([
  // english
  "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been",
  "for", "to", "of", "in", "on", "at", "with", "without", "by", "from", "about",
  "can", "could", "would", "should", "will", "shall", "do", "does", "did", "have",
  "has", "had", "please", "want", "need", "know", "like", "what", "which", "who",
  "whom", "how", "when", "where", "why", "you", "your", "yours", "i", "me", "my",
  "we", "us", "our", "they", "them", "their", "he", "she", "his", "her", "it",
  "this", "that", "these", "those", "there", "here", "get", "got", "give", "any",
  // hinglish
  "kya", "kaise", "kaun", "kaunsa", "kahan", "kab", "kisko", "kis", "hai", "hain",
  "tha", "the", "ho", "hoga", "hai", "me", "mein", "ka", "ki", "ke", "se", "ko",
  "par", "per", "aur", "or", "bhi", "nahi", "na", "mujhe", "maine", "main", "aap",
  "aapka", "aapke", "aapko", "apne", "apna", "apni", "tum", "tumhara", "karo",
  "kare", "kar", "karna", "karega", "chahiye", "karoge", "karwao", "jata", "jati",
  "sakta", "sakti", "hota", "hoti", "lo", "lena", "dene", "dena", "de", "do",
  "ye", "wo", "waha", "yaha", "ab", "abhi", "bahut", "koi", "kuch", "sab", "tha",
]);

/** Normalize text for grouping/dedup: lowercase, trim, collapse spaces. */
export function normalizeQuestion(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** Derive search keywords from a question (stopwords removed, max 6). */
export function deriveKeywords(question) {
  const words = normalizeQuestion(question)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const unique = [...new Set(words)].slice(0, 6);
  if (unique.length > 0) return unique;
  // fallback: first two words (any length ≥ 2)
  const fallback = normalizeQuestion(question)
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .slice(0, 2);
  return fallback;
}

/**
 * Fire-and-forget helper: records a question the bot could not answer, grouped
 * by normalized text (repeated questions bump `count`). Never throws.
 * @param {{text: string, source?: string, destination?: string|null, conversationId?: number|null}} input
 */
export async function recordUnanswered({ text, source = "no_faq", destination = null, conversationId = null } = {}) {
  try {
    const question = normalizeQuestion(text);
    if (!question) return;
    const existing = await prisma.chatUnanswered.findUnique({ where: { question } });
    if (existing) {
      await prisma.chatUnanswered.update({
        where: { id: existing.id },
        data: {
          count: { increment: 1 },
          raw: String(text || "").trim(),
          destination: destination || existing.destination || null,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.chatUnanswered.create({
        data: {
          question,
          raw: String(text || "").trim(),
          source,
          destination: destination || null,
          conversationId: conversationId || null,
        },
      });
    }
  } catch (err) {
    logger.error("recordUnanswered error:", { message: err.message });
  }
}

/**
 * Superadmin answers an unanswered question → creates a ChatFaq so the bot
 * learns to answer it on its own. Returns the created FAQ, or null if the
 * unanswered record was not found.
 */
export async function answerUnansweredQuestion(unansweredId, answer, linkFields = {}) {
  const unanswered = await prisma.chatUnanswered.findUnique({ where: { id: Number(unansweredId) } });
  if (!unanswered) return null;

  const question = unanswered.raw?.trim() || unanswered.question;
  const faq = await prisma.chatFaq.create({
    data: {
      question,
      keywords: deriveKeywords(question),
      answer,
      sortOrder: 0,
      isActive: true,
      linkType: linkFields.linkType || null,
      linkEntityId: linkFields.linkEntityId || null,
      linkTitle: linkFields.linkTitle || null,
      linkUrl: linkFields.linkUrl || null,
    },
  });

  await prisma.chatUnanswered.update({
    where: { id: unanswered.id },
    data: { status: "answered", answeredFaqId: faq.id },
  });

  invalidateFaqCache();
  return faq;
}

/** Drop the in-memory FAQ cache so new/edited FAQs go live immediately. */
export function invalidateFaqCache() {
  faqCache = { data: null, at: 0 };
}

export { PRICE_ANSWER };
