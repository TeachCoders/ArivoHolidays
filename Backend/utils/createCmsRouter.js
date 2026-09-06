import express from "express";
import { z } from "zod";
import { prisma } from "../utils/prismaConnection.js";
import { requireSalesOrAdmin, requireTeamOrAdmin } from "../middleware/requireSalesOrAdmin.js";
import { generateSlug, upsertBanner, getBanner, deleteBanner, upsertFaqs, getFaqs, deleteFaqs } from "../utils/cmsHelpers.js";
import { sendWebhook } from "../services/webhookService.js";
import { isPublicRequest } from "../utils/authHelpers.js";
import { logger } from "./logger.js";

const CASCADE = {
  country: async (id) => {
    const states = await prisma.state.findMany({ where: { countryId: id }, select: { id: true, isActive: true } });
    const stateIds = states.map((s) => s.id);
    const cities = stateIds.length ? await prisma.city.findMany({ where: { stateId: { in: stateIds } }, select: { id: true, isActive: true } }) : [];
    const cityIds = cities.map((c) => c.id);
    const journeys = cityIds.length ? await prisma.journey.findMany({ where: { cities: { some: { id: { in: cityIds } } } }, select: { id: true, isActive: true } }) : [];
    return { states, cities, journeys };
  },
  state: async (id) => {
    const cities = await prisma.city.findMany({ where: { stateId: id }, select: { id: true, isActive: true } });
    const cityIds = cities.map((c) => c.id);
    const journeys = cityIds.length ? await prisma.journey.findMany({ where: { cities: { some: { id: { in: cityIds } } } }, select: { id: true, isActive: true } }) : [];
    return { states: [], cities, journeys };
  },
  city: async (id) => {
    const journeys = await prisma.journey.findMany({ where: { cities: { some: { id } } }, select: { id: true, isActive: true } });
    return { states: [], cities: [], journeys };
  },
  month: async (id) => {
    const journeys = await prisma.journey.findMany({ where: { months: { some: { id } } }, select: { id: true, isActive: true } });
    return { states: [], cities: [], journeys };
  },
  travelExperience: async (id) => {
    const journeys = await prisma.journey.findMany({ where: { travelExperiences: { some: { id } } }, select: { id: true, isActive: true } });
    return { states: [], cities: [], journeys };
  },
};

function createCmsRouter({ modelName, entityType, schema, searchFields, parentField, childInclude, parentInclude, extraFilters, tourCountWhere, listSelect }) {
  const router = express.Router();

  // PATCH /:id/toggle-active
  // Deactivate cascades downward (parent -> children -> linked journeys) and snapshots each child's
  // active state so that reactivating the parent restores children to their previous state.
  router.patch("/:id/toggle-active", requireSalesOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: `Invalid ${modelName} ID` });

      const existing = await prisma[modelName].findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ success: false, message: `${modelName} not found` });

      const next = !existing.isActive;

      if (next === true && tourCountWhere) {
        const journeyCount = await prisma.journey.count({ where: tourCountWhere(id) });
        if (journeyCount === 0) {
          return res.status(400).json({
            success: false,
            message: `Cannot activate ${modelName}. Please add at least one tour package first.`,
          });
        }
      }

      const cascade = CASCADE[modelName] ? await CASCADE[modelName](id) : { states: [], cities: [], journeys: [] };
      const { states, cities, journeys } = cascade;
      const toIds = (arr) => arr.map((x) => x.id);
      const affected = { states: states.length, cities: cities.length, journeys: journeys.length };

      if (next === false) {
        const snapshot = {
          states: Object.fromEntries(states.map((s) => [s.id, s.isActive])),
          cities: Object.fromEntries(cities.map((c) => [c.id, c.isActive])),
          journeys: Object.fromEntries(journeys.map((j) => [j.id, j.isActive])),
        };
        await prisma.$transaction([
          prisma[modelName].update({ where: { id }, data: { isActive: false, activeSnapshot: snapshot } }),
          states.length && prisma.state.updateMany({ where: { id: { in: toIds(states) } }, data: { isActive: false } }),
          cities.length && prisma.city.updateMany({ where: { id: { in: toIds(cities) } }, data: { isActive: false } }),
          journeys.length && prisma.journey.updateMany({ where: { id: { in: toIds(journeys) } }, data: { isActive: false } }),
        ].filter(Boolean));
      } else {
        const snapshot = existing.activeSnapshot;
        const restore = (type, map) => {
          const ids = Object.keys(map || {}).map(Number).filter((x) => !isNaN(x));
          if (!ids.length) return [];
          const trueIds = ids.filter((x) => map[x]);
          const falseIds = ids.filter((x) => !map[x]);
          const model = type === "journeys" ? "journey" : type === "cities" ? "city" : "state";
          return [
            trueIds.length && prisma[model].updateMany({ where: { id: { in: trueIds } }, data: { isActive: true } }),
            falseIds.length && prisma[model].updateMany({ where: { id: { in: falseIds } }, data: { isActive: false } }),
          ].filter(Boolean);
        };

        const ops = [prisma[modelName].update({ where: { id }, data: { isActive: true, activeSnapshot: null } })];
        if (snapshot && typeof snapshot === "object") {
          ops.push(...restore("states", snapshot.states), ...restore("cities", snapshot.cities), ...restore("journeys", snapshot.journeys));
        }
        await prisma.$transaction(ops);
      }

      return res.status(200).json({
        success: true,
        message: next ? `${modelName} activated successfully` : `${modelName} deactivated successfully`,
        data: { id, isActive: next, affected },
      });
    } catch (err) {
      logger.error(`Error toggling ${modelName} active:`, { error: err.message, stack: err.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });

  // POST /order
  // Bulk-set top ordering: ids in array order get displayOrder 1..N, all others reset to 0.
  router.post("/order", requireSalesOrAdmin, async (req, res) => {
    try {
      const raw = req.body?.ids;
      const ids = Array.isArray(raw) ? raw.map(Number).filter((x) => Number.isInteger(x) && x > 0) : [];
      if (!ids.length && Array.isArray(raw) && raw.length > 0) {
        return res.status(400).json({ success: false, message: "Invalid ids array" });
      }

      const ops = [
        prisma[modelName].updateMany({ where: { displayOrder: { gt: 0 }, id: { notIn: ids } }, data: { displayOrder: 0 } }),
        ...ids.map((id, i) => prisma[modelName].updateMany({ where: { id }, data: { displayOrder: i + 1 } })),
      ];
      await prisma.$transaction(ops);

      return res.status(200).json({ success: true, message: `${modelName} order updated`, data: { ids, count: ids.length } });
    } catch (err) {
      logger.error(`Error setting ${modelName} order:`, { error: err.message, stack: err.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });

  router.get("/", async (req, res) => {
    try {
      const isPublic = isPublicRequest(req);
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const skip = (page - 1) * limit;
      const search = req.query.search?.trim() || "";

      const where = {};
      if (isPublic) {
        where.isActive = true;
      }
      else if (req.query.isActive === "true" || req.query.isActive === "false") where.isActive = req.query.isActive === "true";
      if (search) {
        where.OR = searchFields.map((f) => ({ [f]: { contains: search, mode: "insensitive" } }));
      }
      if (req.query[parentField]) {
        const parts = req.query[parentField].toString().split(',').filter(Boolean);
        if (parts.length > 1) {
          where[parentField] = { in: parts.map(Number) };
        } else {
          const parentId = parseInt(req.query[parentField]);
          if (isNaN(parentId)) return res.status(400).json({ success: false, message: `Invalid ${parentField}` });
          where[parentField] = parentId;
        }
      }

      if (modelName === "state") {
        if (req.query.stateId) {
          const stateId = parseInt(req.query.stateId);
          if (isNaN(stateId)) return res.status(400).json({ success: false, message: "Invalid stateId" });
          where.id = stateId;
        } else if (req.query.cityId) {
          const cityId = parseInt(req.query.cityId);
          if (isNaN(cityId)) return res.status(400).json({ success: false, message: "Invalid cityId" });
          where.cities = { some: { id: cityId } };
        }
      }

      if (modelName === "city" && req.query.countryId && !req.query.stateId) {
        const countryId = parseInt(req.query.countryId);
        if (isNaN(countryId)) return res.status(400).json({ success: false, message: "Invalid countryId" });
        where.state = { countryId };
      }
      if (extraFilters) {
        for (const filter of extraFilters) {
          if (req.query[filter]) {
            const filterValue = parseInt(req.query[filter]);
            if (isNaN(filterValue)) return res.status(400).json({ success: false, message: `Invalid ${filter}` });
            where[filter] = filterValue;
          }
        }
      }

      let findManyArgs = {};
      if (listSelect) {
        const selectArgs = { ...listSelect };
        if (parentInclude) selectArgs[parentInclude.model] = { select: parentInclude.select };
        if (childInclude) {
          selectArgs[childInclude.model] = { select: childInclude.select };
          selectArgs._count = { select: { [childInclude.model]: { where: { isActive: true } } } };
        }
        findManyArgs.select = selectArgs;
      } else {
        const include = {};
        if (parentInclude) include[parentInclude.model] = { select: parentInclude.select };
        if (childInclude) include[childInclude.model] = { select: childInclude.select };
        if (childInclude) include._count = {
          select: { [childInclude.model]: { where: { isActive: true } } },
        };
        findManyArgs.include = include;
      }

      const [pinned, regular, total] = await Promise.all([
        prisma[modelName].findMany({
          where: { ...where, displayOrder: { gt: 0 } },
          ...findManyArgs,
          orderBy: [{ isActive: "desc" }, { displayOrder: "asc" }, { id: "desc" }],
        }),
        prisma[modelName].findMany({
          where: { ...where, displayOrder: 0 },
          ...findManyArgs,
          orderBy: [{ id: "desc" }],
        }),
        prisma[modelName].count({ where }),
      ]);
      const items = [...pinned, ...regular].slice(skip, skip + limit);

      const ids = items.map((i) => i.id);
      const banners = await prisma.banner.findMany({
        where: { entityType, entityId: { in: ids } },
        select: { entityId: true, bannerTitle: true, bannerTag: true, images: true },
      });
      const bannerMap = new Map(banners.map((b) => [b.entityId, b]));

      let tourCounts = new Map();
      if (tourCountWhere && ids.length) {
        const counts = await Promise.all(ids.map((id) => prisma.journey.count({ where: tourCountWhere(id) })));
        tourCounts = new Map(ids.map((id, idx) => [id, counts[idx]]));
      }

      const data = items.map((item) => ({
        ...item,
        banner: bannerMap.get(item.id) || null,
        ...(tourCountWhere ? { tourCount: tourCounts.get(item.id) || 0 } : {}),
      }));

      return res.status(200).json({
        success: true,
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) {
      logger.error(`Error fetching ${modelName}:`, { error: err.message, stack: err.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });

  router.get("/all", async (req, res) => {
    try {
      const isPublic = isPublicRequest(req);
      const where = {};
      if (isPublic) {
        where.isActive = true;
      }
      if (req.query[parentField]) {
        const parts = req.query[parentField].toString().split(',').filter(Boolean);
        if (parts.length > 1) {
          where[parentField] = { in: parts.map(Number) };
        } else {
          const parentId = parseInt(req.query[parentField]);
          if (isNaN(parentId)) return res.status(400).json({ success: false, message: `Invalid ${parentField}` });
          where[parentField] = parentId;
        }
      }
      if (modelName === "state") {
        if (req.query.stateId) {
          const stateId = parseInt(req.query.stateId);
          if (isNaN(stateId)) return res.status(400).json({ success: false, message: "Invalid stateId" });
          where.id = stateId;
        } else if (req.query.cityId) {
          const cityId = parseInt(req.query.cityId);
          if (isNaN(cityId)) return res.status(400).json({ success: false, message: "Invalid cityId" });
          where.cities = { some: { id: cityId } };
        }
      }

      if (modelName === "city" && req.query.countryId && !req.query.stateId) {
        const countryId = parseInt(req.query.countryId);
        if (isNaN(countryId)) return res.status(400).json({ success: false, message: "Invalid countryId" });
        where.state = { countryId };
      }
      if (extraFilters) {
        for (const filter of extraFilters) {
          if (req.query[filter]) {
            const filterValue = parseInt(req.query[filter]);
            if (isNaN(filterValue)) return res.status(400).json({ success: false, message: `Invalid ${filter}` });
            where[filter] = filterValue;
          }
        }
      }

      const items = await prisma[modelName].findMany({
        where,
        select: { id: true, title: true, slug: true },
        orderBy: { title: "asc" },
      });
      return res.status(200).json({ success: true, data: items });
    } catch (err) {
      logger.error(`Error fetching ${modelName}:`, { error: err.message, stack: err.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });

  router.get("/by-slug/:slug", async (req, res) => {
    try {
      const isPublic = isPublicRequest(req);
      const slug = req.params.slug?.trim();
      if (!slug) return res.status(400).json({ success: false, message: `${modelName} slug is required` });

      const include = {};
      if (parentInclude) include[parentInclude.model] = { select: parentInclude.select };
      if (childInclude) include[childInclude.model] = { select: childInclude.select, orderBy: { title: "asc" } };

      const item = await prisma[modelName].findUnique({ where: { slug }, include });
      if (!item) return res.status(404).json({ success: false, message: `${modelName} not found` });
      if (isPublic && item.isActive === false) return res.status(404).json({ success: false, message: `${modelName} not found` });

      const banner = await getBanner(entityType, item.id);
      const faqs = await getFaqs(entityType, item.id);

      return res.status(200).json({ success: true, data: { ...item, banner, faqs } });
    } catch (err) {
      logger.error(`Error fetching ${modelName} by slug:`, { error: err.message, stack: err.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const isPublic = isPublicRequest(req);
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: `Invalid ${modelName} ID` });

      const include = {};
      if (parentInclude) include[parentInclude.model] = { select: parentInclude.select };
      if (childInclude) include[childInclude.model] = { select: childInclude.select, orderBy: { title: "asc" } };

      const item = await prisma[modelName].findUnique({ where: { id }, include });
      if (!item) return res.status(404).json({ success: false, message: `${modelName} not found` });
      if (isPublic && item.isActive === false) return res.status(404).json({ success: false, message: `${modelName} not found` });

      const banner = await getBanner(entityType, id);
      const faqs = await getFaqs(entityType, id);

      return res.status(200).json({ success: true, data: { ...item, banner, faqs } });
    } catch (err) {
      logger.error(`Error fetching ${modelName}:`, { error: err.message, stack: err.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });

  router.post("/", requireSalesOrAdmin, async (req, res) => {
    try {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        const message = parsed.error.issues.map((i) => i.message).join(", ");
        return res.status(400).json({ success: false, message });
      }

      const bannerParsed = z.object({
        bannerTitle: z.string().max(200).optional(),
        bannerTag: z.string().max(200).optional(),
        bannerImages: z.array(z.string()).optional(),
      }).safeParse(req.body);
      const bannerData = bannerParsed.success ? bannerParsed.data : null;

      const { slug: inputSlug, ...rest } = parsed.data;
      const slug = inputSlug || generateSlug(rest.title);

      const item = await prisma[modelName].create({ data: { ...rest, slug } });
      const banner = await upsertBanner(entityType, item.id, bannerData);
      
      const faqsInput = Array.isArray(req.body.faqs) ? req.body.faqs : [];
      const faqs = await upsertFaqs(entityType, item.id, faqsInput);

      // Trigger Webhook Notification
      sendWebhook(`${modelName.toUpperCase()}_CREATED`, { ...item, banner, faqs });

      return res.status(201).json({
        success: true,
        message: `${modelName} created successfully`,
        data: { ...item, banner, faqs },
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ success: false, message: `A ${modelName} with this slug already exists` });
      }
      logger.error(`Error creating ${modelName}:`, { error: err.message, stack: err.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });

  router.put("/:id", requireSalesOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: `Invalid ${modelName} ID` });

      const parsed = schema.partial().safeParse(req.body);
      if (!parsed.success) {
        const message = parsed.error.issues.map((i) => i.message).join(", ");
        return res.status(400).json({ success: false, message });
      }

      const existing = await prisma[modelName].findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ success: false, message: `${modelName} not found` });

      const bannerParsed = z.object({
        bannerTitle: z.string().max(200).optional(),
        bannerTag: z.string().max(200).optional(),
        bannerImages: z.array(z.string()).optional(),
      }).safeParse(req.body);
      const bannerData = bannerParsed.success ? bannerParsed.data : null;

      const { slug: inputSlug, ...rest } = parsed.data;
      const slug = inputSlug || (rest.title ? generateSlug(rest.title) : undefined);

      const item = await prisma[modelName].update({
        where: { id },
        data: { ...rest, ...(slug && { slug }) },
      });

      const banner = await upsertBanner(entityType, id, bannerData);

      const faqsInput = Array.isArray(req.body.faqs) ? req.body.faqs : null;
      let faqs = undefined;
      if (faqsInput !== null) {
        faqs = await upsertFaqs(entityType, id, faqsInput);
      } else {
        faqs = await getFaqs(entityType, id);
      }

      return res.status(200).json({
        success: true,
        message: `${modelName} updated successfully`,
        data: { ...item, banner, faqs },
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ success: false, message: `A ${modelName} with this slug already exists` });
      }
      logger.error(`Error updating ${modelName}:`, { error: err.message, stack: err.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });

  router.delete("/:id", requireSalesOrAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: `Invalid ${modelName} ID` });

      const existing = await prisma[modelName].findUnique({
        where: { id },
        include: childInclude ? { _count: { select: { [childInclude.model]: true } } } : undefined,
      });

      if (!existing) return res.status(404).json({ success: false, message: `${modelName} not found` });

      if (childInclude && existing._count[childInclude.model] > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete ${modelName}. ${existing._count[childInclude.model]} linked item(s) exist. Remove them first.`,
        });
      }

      await deleteBanner(entityType, id);
      await deleteFaqs(entityType, id);
      await prisma[modelName].delete({ where: { id } });

      return res.status(200).json({ success: true, message: `${modelName} deleted successfully` });
    } catch (err) {
      logger.error(`Error deleting ${modelName}:`, { error: err.message, stack: err.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });

  return router;
}

export default createCmsRouter;
