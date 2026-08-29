"use strict";

import { prisma } from "../utils/prismaConnection.js";

/**
 * Bot link service — lets the superadmin train the bot from the frontend by
 * linking FAQ keywords to a real page/entity (Journey, Travel Experience,
 * Country, State, City, Season, Tour Package, Blog…).
 *
 * Two jobs:
 *  - `getLinkCandidates(type, search)` — powers the dashboard picker dropdown.
 *  - `buildLinkedAnswer(faq)` — when the bot matches a linked FAQ it pulls the
 *    entity's real DB data and builds a rich answer + a clickable site link.
 */

export const LINK_TYPES = [
  { value: "travelExperience", label: "Travel Experience", defaultUrl: (e) => `/travel-experiences/${e.slug}` },
  { value: "journey", label: "Trip / Journey", defaultUrl: (e) => journeyUrl(e) },
  { value: "country", label: "Country", defaultUrl: (e) => `/${e.slug}` },
  { value: "state", label: "State", defaultUrl: (e) => `/${e.country?.slug || ""}/${e.slug}` },
  { value: "city", label: "City", defaultUrl: (e) => `/${e.state?.country?.slug || ""}/${e.state?.slug || ""}/${e.slug}` },
  { value: "season", label: "Season / Month", defaultUrl: () => "" },
  { value: "tourPackage", label: "Tour Package", defaultUrl: (e) => `/packages/${e.slug}` },
  { value: "blog", label: "Blog Post", defaultUrl: (e) => `/blog/${e.slug}` },
];

function journeyUrl(j) {
  const countrySlug = j.cities?.[0]?.state?.country?.slug;
  return countrySlug ? `/${countrySlug}/tour-packages/${j.slug}` : `/tour-packages/${j.slug}`;
}

const ACTIVE_WHERE = { isActive: true };

/** Simple text-search filter (title / seoKeyword contains, case-insensitive). */
function searchWhere(type, search) {
  const q = String(search || "").trim();
  if (!q) return ACTIVE_WHERE;
  const fields = type === "tourPackage" ? ["name", "slug", "destination"] : ["title", "seoKeyword", "slug"];
  return {
    ...ACTIVE_WHERE,
    OR: fields.map((f) => ({ [f]: { contains: q, mode: "insensitive" } })),
  };
}

/** Loads the entity lists powering the dashboard picker. */
export async function getLinkCandidates(type, search) {
  const q = String(search || "").trim();
  const take = 50;
  const where = searchWhere(type, q);
  const list = {
    travelExperience: async () => {
      const rows = await prisma.travelExperience.findMany({ where, take, orderBy: { displayOrder: "asc" } });
      return rows.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        url: `/travel-experiences/${e.slug}`,
        subtitle: [e.idealFor, e.duration].filter(Boolean).join(" · "),
      }));
    },
    journey: async () => {
      const rows = await prisma.journey.findMany({
        where,
        take,
        orderBy: { displayOrder: "asc" },
        include: { cities: { select: { state: { select: { country: { select: { slug: true } } } } } } },
      });
      return rows.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        url: journeyUrl(e),
        subtitle: `${e.noDays || ""} Days`.trim() || e.destination,
      }));
    },
    country: async () => {
      const rows = await prisma.country.findMany({ where, take, orderBy: { displayOrder: "asc" } });
      return rows.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        url: `/${e.slug}`,
        subtitle: e.bestTimeToVisit || e.capital || "",
      }));
    },
    state: async () => {
      const rows = await prisma.state.findMany({
        where,
        take,
        orderBy: { displayOrder: "asc" },
        include: { country: { select: { slug: true } } },
      });
      return rows.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        url: `/${e.country?.slug || ""}/${e.slug}`,
        subtitle: e.famousFor || e.capital || "",
      }));
    },
    city: async () => {
      const rows = await prisma.city.findMany({
        where,
        take,
        orderBy: { displayOrder: "asc" },
        include: { state: { select: { slug: true, country: { select: { slug: true } } } } },
      });
      return rows.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        url: `/${e.state?.country?.slug || ""}/${e.state?.slug || ""}/${e.slug}`,
        subtitle: e.famousFor || e.attractions || "",
      }));
    },
    season: async () => {
      const rows = await prisma.month.findMany({ where, take, orderBy: { displayOrder: "asc" } });
      return rows.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        url: "",
        subtitle: e.season || e.bestFor || "",
      }));
    },
    tourPackage: async () => {
      const rows = await prisma.tourPackage.findMany({ where, take, orderBy: { displayOrder: "asc" } });
      return rows.map((e) => ({
        id: e.id,
        title: e.name,
        slug: e.slug,
        url: `/packages/${e.slug}`,
        subtitle: `${e.destination || ""} · ${e.durationDays || ""} Days`,
      }));
    },
    blog: async () => {
      const rows = await prisma.blogPost.findMany({ where, take, orderBy: { displayOrder: "asc" } });
      return rows.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        url: `/blog/${e.slug}`,
        subtitle: e.category || e.author || "",
      }));
    },
  };

  const fn = list[type];
  if (!fn) throw new Error(`Unknown link type: ${type}`);
  return fn();
}

// ─────────────────────────────────────────────────────────────
// Rich answer builder (bot side)
// ─────────────────────────────────────────────────────────────

const strip = (s) => (s ? String(s).replace(/<[^>]*>/g, "").trim() : "");

/** Builds the clickable link line: "🔗 {label}: {url}". */
export function linkLine(faq) {
  if (!faq.linkUrl) return "";
  return `\n\n🔗 ${faq.linkTitle || "View page"}: ${faq.linkUrl}`;
}

/** Returns rich answer text + link for the matched FAQ's linked entity. */
export async function buildLinkedAnswer(faq) {
  const type = faq.linkType;
  const id = Number(faq.linkEntityId);
  if (!type || !id) return null;

  let entity = null;
  let text = "";
  let url = "";
  let buttons = [];

  if (type === "journey") {
    entity = await prisma.journey.findFirst({
      where: { id, isActive: true },
      include: {
        cities: { select: { title: true, state: { select: { title: true, country: { select: { slug: true } } } } } },
        months: { select: { title: true, season: true } },
        travelExperiences: { select: { title: true } },
      },
    });
    if (!entity) return null;
    const cities = entity.cities.map((c) => c.title).slice(0, 6).join(", ") || entity.destination;
    const exp = entity.travelExperiences.slice(0, 4).map((x) => x.title).join(", ");
    url = journeyUrl(entity);
    text =
      `${entity.title}\n` +
      `${entity.noDays ? `${entity.noDays} Days` : "Custom itinerary"} - ${cities}\n` +
      (entity.overView ? `${strip(entity.overView).slice(0, 160)}\n` : "") +
      (exp ? `Best for: ${exp}` : "");
    buttons.push({
      label: "Show Day-by-Day Program",
      value: `FETCH_TRIP_DAYS:journey:${entity.id}`
    });
  } else if (type === "travelExperience") {
    entity = await prisma.travelExperience.findFirst({
      where: { id, isActive: true },
      include: { journeys: { where: { isActive: true }, select: { id: true, title: true }, take: 5 } },
    });
    if (!entity) return null;
    const journeys = entity.journeys.slice(0, 3).map((j) => j.title).join(", ");
    url = `/travel-experiences/${entity.slug}`;
    text =
      `${entity.title}\n` +
      [entity.type, entity.idealFor, entity.duration, entity.budgetRange].filter(Boolean).join(" - ") +
      "\n" +
      (entity.overView ? `${strip(entity.overView).slice(0, 160)}\n` : "") +
      (journeys ? `Available trips: ${journeys}` : "");
    buttons = entity.journeys.slice(0, 5).map(j => ({
      label: j.title.length > 35 ? j.title.substring(0, 32) + "..." : j.title,
      value: `FETCH_TRIP_DAYS:journey:${j.id}`
    }));
  } else if (type === "country") {
    entity = await prisma.country.findFirst({
      where: { id, isActive: true },
      include: { states: { where: { isActive: true }, select: { title: true }, take: 8 } },
    });
    if (!entity) return null;
    url = `/${entity.slug}`;
    text =
      `${entity.title}\n` +
      [entity.capital && `Capital: ${entity.capital}`, entity.language && `Language: ${entity.language}`, entity.currency && `Currency: ${entity.currency}`]
        .filter(Boolean)
        .join(" - ") +
      "\n" +
      (entity.bestTimeToVisit ? `Best time to visit: ${entity.bestTimeToVisit}\n` : "") +
      (entity.overView ? `${strip(entity.overView).slice(0, 160)}\n` : "") +
      (entity.states.length ? `Top states: ${entity.states.map((s) => s.title).join(", ")}` : "");
    
    // Fetch journeys for this country's states
    const stateIds = entity.states.map(s => s.id);
    const cCities = await prisma.city.findMany({ where: { stateId: { in: stateIds } }, select: { id: true } });
    if (cCities.length > 0) {
      const cityIds = cCities.map(c => c.id);
      const journeys = await prisma.journey.findMany({
        where: { isActive: true, cities: { some: { id: { in: cityIds } } } },
        take: 5,
        orderBy: { displayOrder: "asc" }
      });
      buttons = journeys.map(j => ({
        label: j.title.length > 35 ? j.title.substring(0, 32) + "..." : j.title,
        value: `FETCH_TRIP_DAYS:journey:${j.id}`
      }));
    }
  } else if (type === "state") {
    entity = await prisma.state.findFirst({
      where: { id, isActive: true },
      include: { country: { select: { slug: true } }, cities: { where: { isActive: true }, select: { id: true, title: true }, take: 8 } },
    });
    if (!entity) return null;
    url = `/${entity.country?.slug || ""}/${entity.slug}`;
    text =
      `🏞️ ${entity.title}\n` +
      (entity.famousFor ? `⭐ Famous for: ${entity.famousFor}\n` : "") +
      (entity.capital ? `Capital: ${entity.capital}\n` : "") +
      (entity.language ? `Language: ${entity.language}\n` : "") +
      (entity.overView ? `${strip(entity.overView).slice(0, 160)}\n` : "") +
      (entity.cities.length ? `🏙️ Top cities: ${entity.cities.map((c) => c.title).join(", ")}` : "");
    
    if (entity.cities.length > 0) {
      const cityIds = entity.cities.map(c => c.id);
      const journeys = await prisma.journey.findMany({
        where: { isActive: true, cities: { some: { id: { in: cityIds } } } },
        take: 5,
        orderBy: { displayOrder: "asc" }
      });
      buttons = journeys.map(j => ({
        label: j.title.length > 35 ? j.title.substring(0, 32) + "..." : j.title,
        value: `FETCH_TRIP_DAYS:journey:${j.id}`
      }));
    }
  } else if (type === "city") {
    entity = await prisma.city.findFirst({
      where: { id, isActive: true },
      include: { state: { select: { slug: true, country: { select: { slug: true } } } } },
    });
    if (!entity) return null;
    url = `/${entity.state?.country?.slug || ""}/${entity.state?.slug || ""}/${entity.slug}`;
    text =
      `🏙️ ${entity.title}\n` +
      (entity.famousFor ? `⭐ Famous for: ${entity.famousFor}\n` : "") +
      (entity.attractions ? `🎡 Attractions: ${strip(entity.attractions).slice(0, 160)}\n` : "") +
      (entity.weather ? `🌤️ Weather: ${entity.weather}\n` : "") +
      (entity.overView ? `${strip(entity.overView).slice(0, 160)}` : "").trim();
  } else if (type === "season") {
    entity = await prisma.month.findFirst({ where: { id, isActive: true } });
    if (!entity) return null;
    url = faq.linkUrl || "";
    text =
      `📅 ${entity.title}\n` +
      (entity.season ? `Season: ${entity.season}\n` : "") +
      (entity.bestFor ? `Best for: ${entity.bestFor}\n` : "") +
      (entity.weather ? `🌤️ Weather: ${entity.weather}\n` : "") +
      (entity.festivals ? `🎊 Festivals: ${entity.festivals}\n` : "") +
      (entity.overView ? `${strip(entity.overView).slice(0, 160)}` : "").trim();
  } else if (type === "tourPackage") {
    entity = await prisma.tourPackage.findFirst({ where: { id, isActive: true } });
    if (!entity) return null;
    url = `/packages/${entity.slug}`;
    text =
      `📦 ${entity.name}\n` +
      `${entity.durationDays ? `⏱ ${entity.durationDays} Days` : ""} · ${entity.destination}\n` +
      (entity.shortDescription ? `${strip(entity.shortDescription).slice(0, 160)}` : "").trim();
  } else if (type === "blog") {
    entity = await prisma.blogPost.findFirst({ where: { id, isActive: true } });
    if (!entity) return null;
    url = `/blog/${entity.slug}`;
    text =
      `📰 ${entity.title}\n` +
      [entity.category, entity.author].filter(Boolean).join(" · ") +
      (entity.seoDescription ? `\n${strip(entity.seoDescription).slice(0, 160)}` : "");
  } else {
    // custom URL — no DB entity to pull
    url = faq.linkUrl || "";
    text = "";
  }

  const link = url ? `\n\n🔗 ${faq.linkTitle || "View on our site"}: ${url}` : "";
  return { answer: text, link, buttons };
}
