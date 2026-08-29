import { Router } from "express";
import { prisma } from "../utils/prismaConnection.js";
import { requireTeamOrAdmin } from "../middleware/requireSalesOrAdmin.js";
import { requireSuperAdmin } from "../middleware/requireSuperAdmin.js";
import { uploadImage } from "../utils/uploadImage.js";
import { isPublicRequest } from "../utils/authHelpers.js";
import { handlePrismaError } from "../utils/handlePrismaError.js";
import { z } from "zod";
import { logger } from "../utils/logger.js";

const router = Router();

const createPackageSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  slug: z.string().trim().max(255).optional(),
  destination: z.string().trim().min(1, "Destination is required").max(255),
  duration: z.string().trim().min(1, "Duration is required").max(100),
  durationDays: z.coerce.number().int().min(0).max(365).optional().default(0),
  pricePerPerson: z.coerce.number().min(0).optional().default(0),
  discountPrice: z.coerce.number().min(0).nullable().optional(),
  shortDescription: z.string().max(2000).nullable().optional(),
  description: z.string().max(50000).nullable().optional(),
  itinerary: z.array(z.any()).optional().default([]),
  hotelDetails: z.array(z.any()).optional().default([]),
  carDetails: z.array(z.any()).optional().default([]),
  guideDetails: z.array(z.any()).optional().default([]),
  includes: z.array(z.string()).optional().default([]),
  excludes: z.array(z.string()).optional().default([]),
  isActive: z.coerce.boolean().optional().default(true),
  isBestSelling: z.coerce.boolean().optional().default(false),
  displayOrder: z.coerce.number().int().min(0).optional().default(0),
  bannerImageUrl: z.any().nullable().optional(),
});

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// ── PUBLIC: List active packages ──
router.get("/", async (req, res) => {
  try {
    const isPublic = isPublicRequest(req);
    const where = isPublic ? { isActive: true } : {};
    if (!isPublic && (req.query.isActive === "true" || req.query.isActive === "false")) {
      where.isActive = req.query.isActive === "true";
    }
    const packages = await prisma.tourPackage.findMany({
      where,
      orderBy: [{ isBestSelling: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });
    res.json({ success: true, data: packages });
  } catch (error) {
    logger.error("Error fetching packages:", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Failed to fetch packages" });
  }
});

// ── PUBLIC: Get single package by slug ──
router.get("/by-slug/:slug", async (req, res) => {
  try {
    const isPublic = isPublicRequest(req);
    const pkg = await prisma.tourPackage.findUnique({
      where: { slug: req.params.slug },
    });
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });
    if (isPublic && pkg.isActive === false) return res.status(404).json({ success: false, message: "Package not found" });
    res.json({ success: true, data: pkg });
  } catch (error) {
    logger.error("Error fetching package:", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Failed to fetch package" });
  }
});

// ── ADMIN: List all packages ──
router.get("/all", requireTeamOrAdmin(["sales", "it"]), async (req, res) => {
  try {
    const packages = await prisma.tourPackage.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });
    res.json({ success: true, data: packages });
  } catch (error) {
    logger.error("Error fetching all packages:", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Failed to fetch packages" });
  }
});

// ── ADMIN: Get single package by id ──
router.get("/:id", requireTeamOrAdmin(["sales", "it"]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid package ID" });
    const pkg = await prisma.tourPackage.findUnique({ where: { id } });
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found" });
    res.json({ success: true, data: pkg });
  } catch (error) {
    logger.error("Error fetching package:", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Failed to fetch package" });
  }
});

// ── ADMIN: Create package ──
router.post("/", requireTeamOrAdmin(["sales", "it"]), async (req, res) => {
  try {
    const parsed = createPackageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    }
    const data = parsed.data;

    let slug = data.slug || slugify(data.name);
    const existing = await prisma.tourPackage.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const pkg = await prisma.tourPackage.create({
      data: {
        ...data,
        slug,
        createdById: req.session?.user?.id || null,
      },
    });

    res.json({ success: true, data: pkg });
  } catch (error) {
    logger.error("Error creating package:", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Failed to create package" });
  }
});

// ── ADMIN: Update package ──
router.put("/:id", requireTeamOrAdmin(["sales", "it"]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid package ID" });
    const existing = await prisma.tourPackage.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Package not found" });

    const allowedFields = [
      "name",
      "slug",
      "description",
      "destination",
      "duration",
      "durationDays",
      "pricePerPerson",
      "discountPrice",
      "isActive",
      "isBestSelling",
      "includes",
      "excludes",
      "itinerary",
      "hotelDetails",
      "carDetails",
      "guideDetails",
      "shortDescription",
      "displayOrder",
      "bannerImageUrl",
    ];
    const data = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }

    const pkg = await prisma.tourPackage.update({ where: { id }, data });
    res.json({ success: true, data: pkg });
  } catch (error) {
    logger.error("Error updating package:", { error: error.message, stack: error.stack });
    if (handlePrismaError(res, error, "Package")) return;
    res.status(500).json({ success: false, message: "Failed to update package" });
  }
});

// ── SUPER ADMIN: Delete package ──
router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid package ID" });
    await prisma.tourPackage.delete({ where: { id } });
    res.json({ success: true, message: "Package deleted" });
  } catch (error) {
    logger.error("Error deleting package:", { error: error.message, stack: error.stack });
    if (handlePrismaError(res, error, "Package")) return;
    res.status(500).json({ success: false, message: "Failed to delete package" });
  }
});

// ── ADMIN: Toggle best selling ──
router.patch("/:id/toggle-best", requireTeamOrAdmin(["sales", "it"]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid package ID" });
    const existing = await prisma.tourPackage.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Package not found" });

    const pkg = await prisma.tourPackage.update({
      where: { id },
      data: { isBestSelling: !existing.isBestSelling },
    });
    res.json({ success: true, data: pkg });
  } catch (error) {
    logger.error("Error toggling best selling:", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Failed to toggle" });
  }
});

// ── SYSTEM: Increment purchase count ──
router.patch("/:id/purchase", requireTeamOrAdmin(["sales", "it"]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid package ID" });
    const pkg = await prisma.tourPackage.update({
      where: { id },
      data: { purchaseCount: { increment: 1 } },
    });
    res.json({ success: true, data: pkg });
  } catch (error) {
    logger.error("Error incrementing purchase:", { error: error.message, stack: error.stack });
    if (handlePrismaError(res, error, "Package")) return;
    res.status(500).json({ success: false, message: "Failed to record purchase" });
  }
});

// ── ADMIN: Upload banner image ──
const bannerUpload = uploadImage("tour-packages");
router.post("/:id/banner", requireTeamOrAdmin(["sales", "it"]), bannerUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid package ID" });
    const folder = req.body?.folder || "tour-packages";
    const url = `/${folder}/${req.file.filename}`;

    // Insert into banner URLs array at given index (default: append to end)
    const pkg = await prisma.tourPackage.findUnique({ where: { id } });
    const existingUrls = Array.isArray(pkg.bannerImageUrl) ? pkg.bannerImageUrl : pkg.bannerImageUrl ? [pkg.bannerImageUrl] : [];
    const idx = req.body?.index !== undefined
      ? Math.max(0, Math.min(existingUrls.length, parseInt(req.body.index) || existingUrls.length))
      : existingUrls.length;
    const updated = await prisma.tourPackage.update({
      where: { id },
      data: { bannerImageUrl: [...existingUrls.slice(0, idx), url, ...existingUrls.slice(idx)] },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error("Error uploading banner:", { error: error.message, stack: error.stack });
    if (handlePrismaError(res, error, "Package")) return;
    res.status(500).json({ success: false, message: "Failed to upload banner" });
  }
});

export default router;
