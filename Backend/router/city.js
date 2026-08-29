import { z } from "zod";
import { Router } from "express";
import { prisma } from "../utils/prismaConnection.js";
import { requireTeamOrAdmin } from "../middleware/requireSalesOrAdmin.js";
import createCmsRouter from "../utils/createCmsRouter.js";
import { logger } from "../utils/logger.js";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  seoDescription: z.string().min(1, "Description is required").max(500),
  overView: z.string().max(500).optional(),
  seoKeyword: z.string().optional(),
  canonical: z.string().optional(),
  seoTitle: z.string().optional(),
  h1Title: z.string().optional(),
  thumbImg: z.string().optional(),
  moreDescription: z.string().optional(),
  famousFor: z.string().optional(),
  attractions: z.string().optional(),
  weather: z.string().optional(),
  stateId: z.number().int().min(1, "State is required"),
  isActive: z.boolean().optional(),
  showOnSite: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

const router = createCmsRouter({
  modelName: "city",
  entityType: "City",
  schema,
  searchFields: ["title", "slug", "seoKeyword"],
  parentField: "stateId",
  listSelect: {
    id: true,
    title: true,
    slug: true,
    seoTitle: true,
    h1Title: true,
    seoKeyword: true,
    seoDescription: true,
    thumbImg: true,
    overView: true,
    isActive: true,
    showOnSite: true,
    displayOrder: true,
    stateId: true,
  },
  parentInclude: {
    model: "state",
    select: { id: true, title: true, slug: true, country: { select: { id: true, title: true, slug: true } } },
  },
  childInclude: { model: "journeys", select: { id: true, title: true, slug: true, displayOrder: true } },
  tourCountWhere: (id) => ({ cities: { some: { id } } }),
});

// Extra route: GET /city/by-country?countryId=X
// Returns all cities whose state belongs to the given country
router.get("/by-country", requireTeamOrAdmin(["it"]), async (req, res) => {
  try {
    const countryId = parseInt(req.query.countryId);
    if (!countryId) {
      return res.status(400).json({ success: false, message: "countryId is required" });
    }

    const states = await prisma.state.findMany({
      where: { countryId },
      select: { id: true },
    });
    const stateIds = states.map((s) => s.id);
    if (stateIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const cities = await prisma.city.findMany({
      where: { stateId: { in: stateIds } },
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" },
    });

    return res.status(200).json({ success: true, data: cities });
  } catch (err) {
    logger.error("Error fetching cities by country:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
