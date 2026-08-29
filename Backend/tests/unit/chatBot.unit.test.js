import { runBot, looksLikeQuestion } from "../../services/chatBot.js";
import { normalizeQuestion, deriveKeywords, answerFaq, answerUnansweredQuestion, invalidateFaqCache } from "../../services/chatFaq.js";
import { searchCatalog, extractDuration, hasTripIntent } from "../../services/catalogSearch.js";
import { getLinkCandidates, buildLinkedAnswer } from "../../services/botLinkService.js";
import { prisma } from "../../utils/prismaConnection.js";

const conversation = (botState, needsData = {}) => ({ botState, needsData });

const texts = (replies) =>
  (replies || []).map((r) => (typeof r === "string" ? r : (r && r.text) || "")).join(" ");

test("runBot: greeting at destination step is re-asked, not accepted as a destination", async () => {
  const result = await runBot(conversation("AWAITING_DESTINATION"), "hello");
  expect(result.unanswered).toBe(false);
  expect(result.nextState).toBe("AWAITING_DESTINATION");
  expect(texts(result.replies)).not.toMatch(/is beautiful/);
  expect(texts(result.replies)).toMatch(/select a destination/i);
});

test("runBot: junk input at destination step re-asks and is flagged unanswered", async () => {
  const result = await runBot(conversation("AWAITING_DESTINATION"), "12345");
  expect(result.unanswered).toBe(true);
  expect(result.nextState).toBe("AWAITING_DESTINATION");
  expect(texts(result.replies)).not.toMatch(/is beautiful/);
});

test("runBot: short/stopword input like 'by' is not accepted as a destination", async () => {
  for (const bad of ["by", "the", "and", "is", "hai", "for"]) {
    const result = await runBot(conversation("AWAITING_DESTINATION"), bad);
    expect(result.nextState).toBe("AWAITING_DESTINATION");
    expect(texts(result.replies)).not.toMatch(/is beautiful/);
  }
});

test("runBot: a real destination still moves the flow forward", async () => {
  const result = await runBot(conversation("AWAITING_DESTINATION"), "Rajasthan");
  expect(result.nextState).toBe("AWAITING_JOURNEY");
  expect(result.needsData.destination).toBe("Rajasthan");
  expect(texts(result.replies)).toMatch(/Great choice/i);
});

test("runBot: price question at budget step never stores a price", async () => {
  const result = await runBot(conversation("AWAITING_BUDGET"), "how much cost?");
  expect(result.nextState).toBe("AWAITING_BUDGET");
  expect("budgetRange" in result.needsData).toBe(false);
});

test("runBot: invalid budget choice re-asks and is flagged unanswered", async () => {
  const result = await runBot(conversation("AWAITING_BUDGET"), "5");
  expect(result.unanswered).toBe(true);
  expect(result.nextState).toBe("AWAITING_BUDGET");
});

test("runBot: valid budget choice proceeds to READY", async () => {
  const result = await runBot(conversation("AWAITING_BUDGET"), "2");
  expect(result.nextState).toBe("AWAITING_EXPLORE_MODE");
  expect(result.needsData.budgetRange).toBe("Mid-Range");
});

test("runBot: group size rejects text without digits", async () => {
  const result = await runBot(conversation("AWAITING_GROUP_SIZE"), "many people");
  expect(result.unanswered).toBe(true);
  expect(result.nextState).toBe("AWAITING_GROUP_SIZE");
});

test("runBot: group size accepts digit-bearing answers", async () => {
  const result = await runBot(conversation("AWAITING_GROUP_SIZE"), "2 adults + 1 child");
  expect(result.nextState).toBe("AWAITING_BUDGET");
  expect(result.needsData.groupSizeText).toBe("2 adults + 1 child");
});

test("looksLikeQuestion detects question phrasing", () => {
  expect(looksLikeQuestion("Do you have airport pickup?")).toBe(true);
  expect(looksLikeQuestion("how much for hotels")).toBe(true);
  expect(looksLikeQuestion("Is it safe for families")).toBe(true);
  expect(looksLikeQuestion("12345")).toBe(false);
  expect(looksLikeQuestion("Rajasthan")).toBe(false);
});

test("runBot: FAQ-able question mid-flow is answered and re-asks the step (not junk)", async () => {
  const result = await runBot(conversation("AWAITING_GROUP_SIZE"), "do you have airport pickup?");
  expect(result.unanswered).toBe(false);
  expect(result.nextState).toBe("AWAITING_GROUP_SIZE");
  expect(result.replies.length).toBe(2);
  expect(texts(result.replies.slice(0, 1))).not.toMatch(/Koi baat nahi/);
});

test("normalizeQuestion collapses whitespace and lowercases", () => {
  expect(normalizeQuestion("  Best   Time  ? ")).toBe("best time ?");
  expect(normalizeQuestion("")).toBe("");
});

test("deriveKeywords removes stopwords and limits to 6", () => {
  const words = deriveKeywords("Best time to visit India and Rajasthan");
  expect(words.length).toBeLessThanOrEqual(6);
  expect(words).toContain("visit");
  expect(words).toContain("rajasthan");
  expect(words).not.toContain("to");
  expect(words).not.toContain("and");
});

test("extractDuration parses day/weekend requests", () => {
  expect(extractDuration("4 day rajasthan trip")).toBe(4);
  expect(extractDuration("3 days tour")).toBe(3);
  expect(extractDuration("weekend in goa")).toBe(2);
  expect(extractDuration("rajasthan")).toBeNull();
});

test("hasTripIntent only flags trip-like phrasing", () => {
  expect(hasTripIntent("4 day rajasthan trip")).toBe(true);
  expect(hasTripIntent("show rajasthan tours")).toBe(true);
  expect(hasTripIntent("rajasthan")).toBe(false);
  expect(hasTripIntent("hello")).toBe(false);
});

test("searchCatalog: trip query with known destination returns matching journeys", async () => {
  const result = await searchCatalog("delhi agra jaipur tour");
  expect(result).toBeTruthy();
  expect(result.kind).toBe("results");
  expect(result.count).toBeGreaterThanOrEqual(1);
  expect(result.reply).toMatch(/Delhi Agra Jaipur/i);
});

test("searchCatalog: duration query prefers close-day trips", async () => {
  const result = await searchCatalog("rajasthan tour in 8 days");
  expect(result).toBeTruthy();
  expect(result.kind).toBe("results");
  expect(result.reply).toMatch(/8 Days/i);
});

test("searchCatalog: experience-only trip query finds tagged trips", async () => {
  const result = await searchCatalog("need honeymoon trip");
  expect(result).toBeTruthy();
  expect(result.kind).toBe("results");
  expect(result.count).toBeGreaterThanOrEqual(1);
});

test("searchCatalog: bare experience words do not hijack the flow", async () => {
  expect(await searchCatalog("honeymoon")).toBeNull();
  expect(await searchCatalog("my family, 4 members")).toBeNull();
});

test("searchCatalog: unknown destination is not answered as a trip list", async () => {
  const result = await searchCatalog("kerala trip");
  expect(result).toBeTruthy();
  expect(result.kind).not.toBe("results");
});

test("searchCatalog: non-trip text returns null", async () => {
  expect(await searchCatalog("hello")).toBeNull();
  expect(await searchCatalog("what is your name")).toBeNull();
});

test("runBot: '4 day rajasthan trip' captures destination and shows packages", async () => {
  const result = await runBot(conversation("AWAITING_DESTINATION"), "4 day rajasthan trip");
  expect(result.nextState).toBe("AWAITING_JOURNEY");
  expect(result.needsData.destination).toMatch(/rajasthan/i);
  expect(result.leadUpdate.destination).toMatch(/rajasthan/i);
  expect(result.replies.length).toBeGreaterThan(0);
});

test("runBot: trip query in READY state answers from DB (not flagged unanswered)", async () => {
  const result = await runBot(conversation("READY"), "show rajasthan tour in 8 days");
  expect(result.unanswered).toBe(false);
  expect(result.replies.length).toBeGreaterThan(0);
});

test("runBot: plain destination name still uses the normal flow", async () => {
  const result = await runBot(conversation("AWAITING_DESTINATION"), "Rajasthan");
  expect(result.nextState).toBe("AWAITING_JOURNEY");
  expect(texts(result.replies)).toMatch(/Great choice/i);
});

test("linkCandidates: returns a list for each supported type", async () => {
  for (const type of ["travelExperience", "journey", "country", "state", "city", "season", "tourPackage", "blog"]) {
    const items = await getLinkCandidates(type, "");
    expect(Array.isArray(items)).toBe(true);
    for (const it of items) {
      expect(it.id).toBeTruthy();
      expect(it.title).toBeTruthy();
    }
  }
});

test("buildLinkedAnswer: journey FAQ produces rich text + a tour-packages link", async () => {
  const journey = await prisma.journey.findFirst({ where: { isActive: true } });
  expect(journey).toBeTruthy();
  const linked = await buildLinkedAnswer({ linkType: "journey", linkEntityId: journey.id, linkTitle: journey.title, linkUrl: null });
  expect(linked).toBeTruthy();
  expect(linked.answer).toMatch(new RegExp(journey.title.split(" ")[0]));
  expect(linked.link).toMatch(/tour-packages/);
});

test("answerFaq: linked FAQ appends the rich answer + link", async () => {
  const journey = await prisma.journey.findFirst({ where: { isActive: true } });
  expect(journey).toBeTruthy();
  const marker = `llinktest${Date.now()}`;
  const faq = await prisma.chatFaq.create({
    data: {
      question: marker,
      keywords: [marker],
      answer: "Yeh lo linked FAQ ka jawab.",
      linkType: "journey",
      linkEntityId: journey.id,
      linkTitle: journey.title,
      linkUrl: `/tour-packages/${journey.slug}`,
    },
  });
  invalidateFaqCache();
  try {
    const reply = await answerFaq(`main ${marker} poochh raha hoon`);
    expect(reply).toBeTruthy();
    expect(reply.text).toMatch(/linked FAQ ka jawab/);
    expect(reply.text).toMatch(/🔗/);
    expect(reply.text).toMatch(/tour-packages/);
    expect(Array.isArray(reply.buttons)).toBe(true);
    expect(reply.buttons.length).toBeGreaterThanOrEqual(1);
  } finally {
    await prisma.chatFaq.delete({ where: { id: faq.id } });
    invalidateFaqCache();
  }
});

test("answerFaq: FAQ without a link still returns the plain answer", async () => {
  const marker = `plainlink${Date.now()}`;
  const faq = await prisma.chatFaq.create({
    data: { question: marker, keywords: [marker], answer: "Sada jawab, koi link nahi." },
  });
  invalidateFaqCache();
  try {
    const reply = await answerFaq(`kuch ${marker} batao`);
    expect(reply.text).toBe("Sada jawab, koi link nahi.");
    expect(reply.buttons).toEqual([]);
  } finally {
    await prisma.chatFaq.delete({ where: { id: faq.id } });
    invalidateFaqCache();
  }
});

test("runBot: FETCH_TRIP_DAYS returns the journey day-by-day program", async () => {
  const journey = await prisma.journey.findFirst({ where: { isActive: true }, include: { days: true } });
  expect(journey).toBeTruthy();
  const result = await runBot(conversation("AWAITING_DESTINATION"), `FETCH_TRIP_DAYS:journey:${journey.id}`);
  expect(result.unanswered).toBe(false);
  const out = texts(result.replies);
  expect(out).toMatch(/ITINERARY HIGHLIGHTS/i);
  if (journey.days.length > 0) {
    expect(out).toMatch(/Day 1/i);
  }
});

test("answerUnansweredQuestion: with link fields creates a linked FAQ", async () => {
  const journey = await prisma.journey.findFirst({ where: { isActive: true } });
  expect(journey).toBeTruthy();
  const marker = `unlinked${Date.now()}`;
  const unanswered = await prisma.chatUnanswered.create({
    data: { question: marker, raw: `please ${marker}`, count: 1, source: "no_faq" },
  });
  invalidateFaqCache();
  let createdFaqId = null;
  try {
    const faq = await answerUnansweredQuestion(unanswered.id, "Yeh link wala jawab hai.", {
      linkType: "journey",
      linkEntityId: journey.id,
      linkTitle: journey.title,
      linkUrl: `/tour-packages/${journey.slug}`,
    });
    createdFaqId = faq.id;
    expect(faq).toBeTruthy();
    expect(faq.linkType).toBe("journey");
    expect(faq.linkEntityId).toBe(journey.id);
    expect(faq.linkUrl).toBe(`/tour-packages/${journey.slug}`);
    const after = await prisma.chatUnanswered.findUnique({ where: { id: unanswered.id } });
    expect(after.status).toBe("answered");
  } finally {
    if (createdFaqId) await prisma.chatFaq.delete({ where: { id: createdFaqId } }).catch(() => {});
    await prisma.chatUnanswered.delete({ where: { id: unanswered.id } }).catch(() => {});
    invalidateFaqCache();
  }
});
