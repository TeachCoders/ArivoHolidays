import express from "express";
import { z } from "zod";
import { prisma } from "../utils/prismaConnection.js";
import { requireTeamOrAdmin } from "../middleware/requireSalesOrAdmin.js";
import { isPublicRequest } from "../utils/authHelpers.js";
import { generateSlug, upsertBanner, getBanner, deleteBanner } from "../utils/cmsHelpers.js";
import { handlePrismaError } from "../utils/handlePrismaError.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

const orderByList = (items = [], order = []) => {
  if (!Array.isArray(order) || order.length === 0) return items;
  const orderMap = new Map(order.map((id, i) => [id, i]));
  return [...items].sort((a, b) => {
    const ia = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER;
    const ib = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER;
    return ia - ib;
  });
};

const orderJourneyCities = (cities = [], cityOrder = []) => orderByList(cities, cityOrder);
const orderJourneyExperiences = (experiences = [], experienceOrder = []) => orderByList(experiences, experienceOrder);

const buildJourneyRoute = (cities = [], cityOrder = []) => {
  if (!Array.isArray(cityOrder) || cityOrder.length === 0) return cities;
  const cityById = new Map(cities.map((c) => [c.id, c]));
  return cityOrder.map((id) => cityById.get(id)).filter(Boolean);
};

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  seoDescription: z.string().min(1, "Description is required").max(500),
  overView: z.string().optional(),
  seoKeyword: z.string().optional(),
  seoTitle: z.string().optional(),
  h1Title: z.string().optional(),
  canonical: z.string().optional(),
  thumbImg: z.string().optional(),
  moreDescription: z.string().optional(),
  destination: z.string().optional(),
  duration: z.string().optional(),
  noDays: z.number().int().min(1, "Number of days is required"),
  pricePerPerson: z.number().optional(),
  discountPrice: z.number().optional().nullable(),
  cityIds: z.array(z.number().int()).min(1, "At least one city is required"),
  monthIds: z.array(z.number().int()).optional(),
  travelExperienceIds: z.array(z.number().int()).optional(),
  hotelDetails: z.any().optional(),
  carDetails: z.any().optional(),
  guideDetails: z.any().optional(),
  highlights: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isBestSelling: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  days: z.array(z.object({
    day: z.string(),
    description: z.string(),
    image: z.string().optional(),
  })).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  whyChooseUs: z.array(z.string()).optional(),
  bookingPolicy: z.array(z.string()).optional(),
  faqs: z.array(z.object({
    ques: z.string(),
    ans: z.string(),
  })).optional(),
});

// GET list
router.get("/", async (req, res) => {
  try {
    const sessionUser = req.session?.user;
    let isPublic = true;
    if (sessionUser) {
      const role = (sessionUser.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
      const isSuperAdmin = role.includes("super") && role.includes("admin");
      const knownTeamRoles = ["sales", "operations", "support", "it", "it_maintenance", "content", "team_leader", "team_member"];
      if (isSuperAdmin || knownTeamRoles.includes(role)) {
        isPublic = false;
      }
    }
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";
    const routeRaw = req.query.route?.trim() || "";
    const routeTokens = [
      ...new Set(routeRaw.split(/[\s,>-]+/).map((t) => t.toLowerCase().trim()).filter(Boolean)),
    ];

    const where = {};
    if (req.query.isActive === "true" || req.query.isActive === "false") where.isActive = req.query.isActive === "true";
    else if (isPublic) where.isActive = true;
    if (search) {
      where.OR = ["title", "slug", "seoKeyword"].map((f) => ({ [f]: { contains: search, mode: "insensitive" } }));
    }
    if (req.query.cityId) {
      const cityId = parseInt(req.query.cityId);
      if (isNaN(cityId)) return res.status(400).json({ success: false, message: "Invalid cityId" });
      where.cities = { some: { id: cityId } };
    } else if (req.query.stateId) {
      const stateId = parseInt(req.query.stateId);
      if (isNaN(stateId)) return res.status(400).json({ success: false, message: "Invalid stateId" });
      where.cities = { some: { stateId } };
    } else if (req.query.countryId) {
      const countryId = parseInt(req.query.countryId);
      if (isNaN(countryId)) return res.status(400).json({ success: false, message: "Invalid countryId" });
      where.cities = { some: { state: { countryId } } };
    }

    const listSelect = {
      id: true,
      title: true,
      slug: true,
      seoTitle: true,
      seoKeyword: true,
      seoDescription: true,
      h1Title: true,
      thumbImg: true,
      destination: true,
      duration: true,
      noDays: true,
      pricePerPerson: true,
      discountPrice: true,
      highlights: true,
      purchaseCount: true,
      isActive: true,
      isBestSelling: true,
      displayOrder: true,
      cityOrder: true,
      travelExperienceOrder: true,
      cities: {
        select: {
          id: true,
          title: true,
          slug: true,
          state: {
            select: { id: true, title: true, slug: true, country: { select: { id: true, title: true, slug: true } } },
          },
        },
      },
      months: { select: { id: true, title: true, slug: true, season: true } },
      travelExperiences: { select: { id: true, title: true, slug: true } },
      _count: { select: { days: true } },
    };

    let items;
    let total;

    if (routeTokens.length > 0) {
      // Every token must match destination, a linked city, or a day's text
      where.AND = routeTokens.map((token) => ({
        OR: [
          { destination: { contains: token, mode: "insensitive" } },
          {
            cities: {
              some: {
                OR: [
                  { title: { contains: token, mode: "insensitive" } },
                  { slug: { contains: token, mode: "insensitive" } },
                ],
              },
            },
          },
          {
            days: {
              some: {
                OR: [
                  { day: { contains: token, mode: "insensitive" } },
                  { description: { contains: token, mode: "insensitive" } },
                ],
              },
            },
          },
        ],
      }));

      // Fetch matching ids with destination + city titles so we can rank by route order
      const matches = await prisma.journey.findMany({
        where,
        select: { id: true, destination: true, cityOrder: true, displayOrder: true, cities: { select: { title: true } } },
        orderBy: { id: "desc" },
      }).then((rows) =>
        rows.map((r) => ({ ...r, cities: orderJourneyCities(r.cities, r.cityOrder) }))
      );

      const tokensInOrder = (journey) => {
        const text = (journey.destination || journey.cities.map((c) => c.title).join(" ")).toLowerCase();
        if (!text || routeTokens.length === 0) return false;
        let last = -1;
        for (const token of routeTokens) {
          const idx = text.indexOf(token);
          if (idx === -1) return false;
          if (idx < last) return false;
          last = idx;
        }
        return true;
      };

      const orderMatched = matches.filter(tokensInOrder);
      const others = matches.filter((j) => !tokensInOrder(j));
      const routeRanked = [...orderMatched, ...others];
      const pinned = routeRanked
        .filter((j) => j.displayOrder && j.displayOrder > 0)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      const rest = routeRanked.filter((j) => !j.displayOrder || j.displayOrder <= 0);
      const rankedIds = [...pinned, ...rest].map((j) => j.id);

      total = rankedIds.length;
      const pageIds = rankedIds.slice(skip, skip + limit);

      const full = await prisma.journey.findMany({
        where: { id: { in: pageIds } },
        select: listSelect,
      });
      const byId = new Map(full.map((f) => [f.id, f]));
      items = pageIds.map((id) => byId.get(id)).filter(Boolean);
    } else {
      const [pinned, regular, count] = await Promise.all([
        prisma.journey.findMany({
          where: { ...where, displayOrder: { gt: 0 } },
          select: listSelect,
          orderBy: [{ isActive: "desc" }, { displayOrder: "asc" }, { id: "desc" }],
        }),
        prisma.journey.findMany({
          where: { ...where, displayOrder: 0 },
          select: listSelect,
          orderBy: [{ isActive: "desc" }, { id: "desc" }],
        }),
        prisma.journey.count({ where }),
      ]);
      total = count;
      items = [...pinned, ...regular].slice(skip, skip + limit);
    }

    const ids = items.map((i) => i.id);
    items = items.map((i) => ({
      ...i,
      cities: orderJourneyCities(i.cities, i.cityOrder),
      route: buildJourneyRoute(i.cities, i.cityOrder),
      travelExperiences: orderJourneyExperiences(i.travelExperiences, i.travelExperienceOrder),
    }));
    const banners = await prisma.banner.findMany({
      where: { entityType: "Journey", entityId: { in: ids } },
      select: { entityId: true, bannerTitle: true, bannerTag: true, images: true },
    });
    const bannerMap = new Map(banners.map((b) => [b.entityId, b]));
    const data = items.map((item) => ({ ...item, banner: bannerMap.get(item.id) || null }));

    return res.status(200).json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    logger.error("Error fetching journeys:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// GET all (dropdown)
router.get("/all", async (req, res) => {
  try {
    const isPublic = isPublicRequest(req);
    const where = {};
    if (isPublic) where.isActive = true;
    if (req.query.cityId) {
      const cityId = parseInt(req.query.cityId);
      if (isNaN(cityId)) return res.status(400).json({ success: false, message: "Invalid cityId" });
      where.cities = { some: { id: cityId } };
    } else if (req.query.stateId) {
      const stateId = parseInt(req.query.stateId);
      if (isNaN(stateId)) return res.status(400).json({ success: false, message: "Invalid stateId" });
      where.cities = { some: { stateId } };
    } else if (req.query.countryId) {
      const countryId = parseInt(req.query.countryId);
      if (isNaN(countryId)) return res.status(400).json({ success: false, message: "Invalid countryId" });
      where.cities = { some: { state: { countryId } } };
    }
    const items = await prisma.journey.findMany({ where, select: { id: true, title: true, slug: true }, orderBy: { title: "asc" } });
    return res.status(200).json({ success: true, data: items });
  } catch (err) {
    logger.error("Error fetching journeys:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// GET filter options for hero search (lightweight)
router.get("/filters", async (req, res) => {
  try {
    const isPublic = isPublicRequest(req);
    const where = isPublic ? { isActive: true } : {};
    const journeys = await prisma.journey.findMany({
      where,
      select: {
        cities: {
          select: {
            id: true,
            title: true,
            slug: true,
            state: { select: { id: true, title: true, slug: true } },
          },
        },
        travelExperiences: { select: { id: true, title: true, slug: true } },
      },
    });

    const cityMap = new Map();
    const expMap = new Map();
    for (const j of journeys) {
      for (const c of j.cities) {
        if (!cityMap.has(c.id)) {
          cityMap.set(c.id, {
            id: c.id,
            title: c.title,
            slug: c.slug,
            stateTitle: c.state?.title || null,
          });
        }
      }
      for (const e of j.travelExperiences) {
        if (!expMap.has(e.id)) {
          expMap.set(e.id, { id: e.id, title: e.title, slug: e.slug });
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        cities: [...cityMap.values()].sort((a, b) => a.title.localeCompare(b.title)),
        experiences: [...expMap.values()].sort((a, b) => a.title.localeCompare(b.title)),
      },
    });
  } catch (err) {
    logger.error("Error fetching journey filters:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// GET by slug
router.get("/by-slug/:slug", async (req, res) => {
  try {
    const sessionUser = req.session?.user;
    let isPublic = true;
    if (sessionUser) {
      const role = (sessionUser.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
      const isSuperAdmin = role.includes("super") && role.includes("admin");
      const knownTeamRoles = ["sales", "operations", "support", "it", "it_maintenance", "content", "team_leader", "team_member"];
      if (isSuperAdmin || knownTeamRoles.includes(role)) {
        isPublic = false;
      }
    }
    const slug = req.params.slug;

    const item = await prisma.journey.findUnique({
      where: { slug },
      include: {
        cities: {
          select: {
            id: true,
            title: true,
            slug: true,
            state: {
              select: { id: true, title: true, slug: true, country: { select: { id: true, title: true, slug: true } } },
            },
          },
        },
        months: { select: { id: true, title: true, slug: true, season: true } },
        travelExperiences: { select: { id: true, title: true, slug: true } },
        days: true,
      },
    });
    if (!item) return res.status(404).json({ success: false, message: "Journey not found" });
    if (isPublic && item.isActive === false) return res.status(404).json({ success: false, message: "Journey not found" });

    const banner = await getBanner("Journey", item.id);

    const inclusion = await prisma.inclusion.findFirst({ where: { journeyId: item.id } });
    const exclusion = await prisma.exclusion.findFirst({ where: { journeyId: item.id } });
    const whyChoose = await prisma.whyChoose.findFirst({ where: { journeyId: item.id } });
    const bookingPolicy = await prisma.bookingPolicy.findFirst({ where: { journeyId: item.id } });
    const faqs = await prisma.faq.findMany({ where: { entityType: "Journey", entityId: item.id } });

    return res.status(200).json({
      success: true,
      data: {
        ...item,
        cities: orderJourneyCities(item.cities, item.cityOrder),
        route: buildJourneyRoute(item.cities, item.cityOrder),
        travelExperiences: orderJourneyExperiences(item.travelExperiences, item.travelExperienceOrder),
        banner,
        inclusions: inclusion?.inclusionList || [],
        exclusions: exclusion?.inclusionList || [],
        whyChooseUs: whyChoose?.choseUsList || [],
        bookingPolicyList: bookingPolicy?.inclusionList || [],
        faqs,
      },
    });
  } catch (err) {
    logger.error("Error fetching journey:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// GET by ID
router.get("/:id", async (req, res) => {
  try {
    const sessionUser = req.session?.user;
    let isPublic = true;
    if (sessionUser) {
      const role = (sessionUser.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
      const isSuperAdmin = role.includes("super") && role.includes("admin");
      const knownTeamRoles = ["sales", "operations", "support", "it", "it_maintenance", "content", "team_leader", "team_member"];
      if (isSuperAdmin || knownTeamRoles.includes(role)) {
        isPublic = false;
      }
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid journey ID" });

    const item = await prisma.journey.findUnique({
      where: { id },
      include: {
        cities: {
          select: {
            id: true,
            title: true,
            slug: true,
            state: {
              select: { id: true, title: true, slug: true, country: { select: { id: true, title: true, slug: true } } },
            },
          },
        },
        months: { select: { id: true, title: true, slug: true, season: true } },
        travelExperiences: { select: { id: true, title: true, slug: true } },
        days: true,
      },
    });
    if (!item) return res.status(404).json({ success: false, message: "Journey not found" });
    if (isPublic && item.isActive === false) return res.status(404).json({ success: false, message: "Journey not found" });

    const banner = await getBanner("Journey", id);

    const inclusion = await prisma.inclusion.findFirst({ where: { journeyId: id } });
    const exclusion = await prisma.exclusion.findFirst({ where: { journeyId: id } });
    const whyChoose = await prisma.whyChoose.findFirst({ where: { journeyId: id } });
    const bookingPolicy = await prisma.bookingPolicy.findFirst({ where: { journeyId: id } });
    const faqs = await prisma.faq.findMany({ where: { entityType: "Journey", entityId: id } });

    return res.status(200).json({
      success: true,
      data: {
        ...item,
        cities: orderJourneyCities(item.cities, item.cityOrder),
        route: buildJourneyRoute(item.cities, item.cityOrder),
        travelExperiences: orderJourneyExperiences(item.travelExperiences, item.travelExperienceOrder),
        banner,
        inclusions: inclusion?.inclusionList || [],
        exclusions: exclusion?.inclusionList || [],
        whyChooseUs: whyChoose?.choseUsList || [],
        bookingPolicyList: bookingPolicy?.inclusionList || [],
        faqs,
      },
    });
  } catch (err) {
    logger.error("Error fetching journey:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// CREATE
router.post("/", requireTeamOrAdmin(["it"]), async (req, res) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      return res.status(400).json({ success: false, message });
    }

    const { days, inclusions, exclusions, whyChooseUs, bookingPolicy, faqs, highlights, cityIds, monthIds, travelExperienceIds, ...rest } = parsed.data;
    const slug = rest.slug || generateSlug(rest.title);
    const distinctCityIds = [...new Set(cityIds || [])];

    const item = await prisma.journey.create({
      data: {
        ...rest,
        slug,
        highlights: highlights || [],
        cityOrder: cityIds || [],
        travelExperienceOrder: travelExperienceIds || [],
        cities: { connect: distinctCityIds.map((id) => ({ id })) },
        months: { connect: (monthIds || []).map((id) => ({ id })) },
        travelExperiences: { connect: (travelExperienceIds || []).map((id) => ({ id })) },
      },
    });

    // Save child entities
    if (days && days.length > 0) {
      await prisma.journeyDay.createMany({ data: days.map(d => ({ ...d, journeyId: item.id })) });
    }
    if (inclusions && inclusions.length > 0) {
      await prisma.inclusion.create({ data: { inclusionList: inclusions, journeyId: item.id } });
    }
    if (exclusions && exclusions.length > 0) {
      await prisma.exclusion.create({ data: { inclusionList: exclusions, journeyId: item.id } });
    }
    if (whyChooseUs && whyChooseUs.length > 0) {
      await prisma.whyChoose.create({ data: { choseUsList: whyChooseUs, journeyId: item.id } });
    }
    if (bookingPolicy && bookingPolicy.length > 0) {
      await prisma.bookingPolicy.create({ data: { inclusionList: bookingPolicy, journeyId: item.id } });
    }
    if (faqs && faqs.length > 0) {
      await prisma.faq.createMany({ data: faqs.map(f => ({ ...f, entityType: "Journey", entityId: item.id })) });
    }

    const bannerParsed = z.object({
      bannerTitle: z.string().max(200).optional(),
      bannerTag: z.string().max(200).optional(),
      bannerImages: z.array(z.string()).optional(),
    }).safeParse(req.body);
    const bannerData = bannerParsed.success ? bannerParsed.data : null;
    const banner = await upsertBanner("Journey", item.id, bannerData);

    return res.status(201).json({ success: true, message: "Journey created successfully", data: { ...item, banner } });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "A journey with this slug already exists" });
    }
    logger.error("Error creating journey:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// UPDATE
router.put("/:id", requireTeamOrAdmin(["it"]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid journey ID" });

    const existing = await prisma.journey.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Journey not found" });

    const parsed = schema.partial().safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      return res.status(400).json({ success: false, message });
    }

    const { days, inclusions, exclusions, whyChooseUs, bookingPolicy, faqs, highlights, cityIds, monthIds, travelExperienceIds, ...rest } = parsed.data;
    const slug = rest.slug || (rest.title ? generateSlug(rest.title) : undefined);

    const item = await prisma.journey.update({
      where: { id },
      data: {
        ...rest,
        ...(slug && { slug }),
        ...(highlights && { highlights }),
        ...(cityIds !== undefined && {
          cities: { set: [...new Set(cityIds)].map((cid) => ({ id: cid })) },
          cityOrder: cityIds,
        }),
        ...(monthIds !== undefined && { months: { set: monthIds.map((mid) => ({ id: mid })) } }),
        ...(travelExperienceIds !== undefined && {
          travelExperiences: { set: travelExperienceIds.map((tid) => ({ id: tid })) },
          travelExperienceOrder: travelExperienceIds,
        }),
      },
    });

    // Update child entities
    if (days) {
      await prisma.journeyDay.deleteMany({ where: { journeyId: id } });
      if (days.length > 0) {
        await prisma.journeyDay.createMany({ data: days.map(d => ({ ...d, journeyId: id })) });
      }
    }
    if (inclusions !== undefined) {
      await prisma.inclusion.deleteMany({ where: { journeyId: id } });
      if (inclusions.length > 0) {
        await prisma.inclusion.create({ data: { inclusionList: inclusions, journeyId: id } });
      }
    }
    if (exclusions !== undefined) {
      await prisma.exclusion.deleteMany({ where: { journeyId: id } });
      if (exclusions.length > 0) {
        await prisma.exclusion.create({ data: { inclusionList: exclusions, journeyId: id } });
      }
    }
    if (whyChooseUs !== undefined) {
      await prisma.whyChoose.deleteMany({ where: { journeyId: id } });
      if (whyChooseUs.length > 0) {
        await prisma.whyChoose.create({ data: { choseUsList: whyChooseUs, journeyId: id } });
      }
    }
    if (bookingPolicy !== undefined) {
      await prisma.bookingPolicy.deleteMany({ where: { journeyId: id } });
      if (bookingPolicy.length > 0) {
        await prisma.bookingPolicy.create({ data: { inclusionList: bookingPolicy, journeyId: id } });
      }
    }
    if (faqs !== undefined) {
      await prisma.faq.deleteMany({ where: { entityType: "Journey", entityId: id } });
      if (faqs.length > 0) {
        await prisma.faq.createMany({ data: faqs.map(f => ({ ...f, entityType: "Journey", entityId: id })) });
      }
    }

    const bannerParsed = z.object({
      bannerTitle: z.string().max(200).optional(),
      bannerTag: z.string().max(200).optional(),
      bannerImages: z.array(z.string()).optional(),
    }).safeParse(req.body);
    const bannerData = bannerParsed.success ? bannerParsed.data : null;
    const banner = await upsertBanner("Journey", id, bannerData);

    return res.status(200).json({ success: true, message: "Journey updated successfully", data: { ...item, banner } });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "A journey with this slug already exists" });
    }
    logger.error("Error updating journey:", { error: err.message, stack: err.stack });
    if (handlePrismaError(res, err, "Journey")) return;
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// POST /order
// Bulk-set top ordering: ids in array order get displayOrder 1..N, all others reset to 0.
router.post("/order", requireTeamOrAdmin(["it"]), async (req, res) => {
  try {
    const raw = req.body?.ids;
    const ids = Array.isArray(raw) ? raw.map(Number).filter((x) => Number.isInteger(x) && x > 0) : [];
    if (!ids.length && Array.isArray(raw) && raw.length > 0) {
      return res.status(400).json({ success: false, message: "Invalid ids array" });
    }

    const ops = [
      prisma.journey.updateMany({ where: { displayOrder: { gt: 0 }, id: { notIn: ids } }, data: { displayOrder: 0 } }),
      ...ids.map((id, i) => prisma.journey.updateMany({ where: { id }, data: { displayOrder: i + 1 } })),
    ];
    await prisma.$transaction(ops);

    return res.status(200).json({ success: true, message: "Journey order updated", data: { ids, count: ids.length } });
  } catch (err) {
    logger.error("Error setting journey order:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// TOGGLE ACTIVE (enable / disable)
router.patch("/:id/toggle-active", requireTeamOrAdmin(["it"]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid journey ID" });

    const existing = await prisma.journey.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Journey not found" });

    const item = await prisma.journey.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return res.status(200).json({
      success: true,
      message: item.isActive ? "Journey enabled successfully" : "Journey disabled successfully",
      data: item,
    });
  } catch (err) {
    logger.error("Error toggling journey active:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// DELETE
router.delete("/:id", requireTeamOrAdmin(["it"]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid journey ID" });

    const existing = await prisma.journey.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Journey not found" });

    await prisma.journeyDay.deleteMany({ where: { journeyId: id } });
    await prisma.inclusion.deleteMany({ where: { journeyId: id } });
    await prisma.exclusion.deleteMany({ where: { journeyId: id } });
    await prisma.whyChoose.deleteMany({ where: { journeyId: id } });
    await prisma.bookingPolicy.deleteMany({ where: { journeyId: id } });
    await prisma.faq.deleteMany({ where: { entityType: "Journey", entityId: id } });
    await deleteBanner("Journey", id);
    await prisma.journey.delete({ where: { id } });

    return res.status(200).json({ success: true, message: "Journey deleted successfully" });
  } catch (err) {
    logger.error("Error deleting journey:", { error: err.message, stack: err.stack });
    if (handlePrismaError(res, err, "Journey")) return;
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
