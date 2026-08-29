import express from "express";
import { z } from "zod";
import { prisma } from "../utils/prismaConnection.js";
import { requireTeamOrAdmin } from "../middleware/requireSalesOrAdmin.js";
import { generateSlug } from "../utils/cmsHelpers.js";
import { isPublicRequest } from "../utils/authHelpers.js";
import { logger } from "../utils/logger.js";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const isPublic = isPublicRequest(req);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";

    const where = {};
    if (isPublic) where.isActive = true;
    else if (req.query.isActive === "true" || req.query.isActive === "false") where.isActive = req.query.isActive === "true";
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [pinned, regular, total] = await Promise.all([
      prisma.blogCategory.findMany({
        where: { ...where, displayOrder: { gt: 0 } },
        orderBy: [{ isActive: "desc" }, { displayOrder: "asc" }, { id: "desc" }],
      }),
      prisma.blogCategory.findMany({
        where: { ...where, displayOrder: 0 },
        orderBy: [{ isActive: "desc" }, { id: "desc" }],
      }),
      prisma.blogCategory.count({ where }),
    ]);
    const data = [...pinned, ...regular].slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    logger.error("Error fetching blog categories:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const isPublic = isPublicRequest(req);
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid blog category ID" });

    const item = await prisma.blogCategory.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ success: false, message: "blogCategory not found" });
    if (isPublic && item.isActive === false) return res.status(404).json({ success: false, message: "blogCategory not found" });

    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    logger.error("Error fetching blog category:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/", requireTeamOrAdmin(["it"]), async (req, res) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      return res.status(400).json({ success: false, message });
    }

    const { slug: inputSlug, ...rest } = parsed.data;
    const slug = inputSlug || generateSlug(rest.name);

    const item = await prisma.blogCategory.create({ data: { ...rest, slug } });
    return res.status(201).json({ success: true, message: "blogCategory created successfully", data: item });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "A blog category with this name or slug already exists" });
    }
    logger.error("Error creating blog category:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.put("/:id", requireTeamOrAdmin(["it"]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid blog category ID" });

    const parsed = schema.partial().safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      return res.status(400).json({ success: false, message });
    }

    const existing = await prisma.blogCategory.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "blogCategory not found" });

    const { slug: inputSlug, ...rest } = parsed.data;
    const slug = inputSlug || (rest.name ? generateSlug(rest.name) : undefined);

    const item = await prisma.blogCategory.update({
      where: { id },
      data: { ...rest, ...(slug && { slug }) },
    });
    return res.status(200).json({ success: true, message: "blogCategory updated successfully", data: item });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "A blog category with this name or slug already exists" });
    }
    logger.error("Error updating blog category:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.patch("/:id/toggle-active", requireTeamOrAdmin(["it"]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid blog category ID" });

    const existing = await prisma.blogCategory.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "blogCategory not found" });

    const next = !existing.isActive;
    const item = await prisma.blogCategory.update({ where: { id }, data: { isActive: next } });
    return res.status(200).json({
      success: true,
      message: next ? "blogCategory activated successfully" : "blogCategory deactivated successfully",
      data: item,
    });
  } catch (err) {
    logger.error("Error toggling blog category active:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.delete("/:id", requireTeamOrAdmin(["it"]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid blog category ID" });

    const existing = await prisma.blogCategory.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "blogCategory not found" });

    const usedCount = await prisma.blogPost.count({
      where: { category: existing.name },
    });
    if (usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${usedCount} blog post(s) use it. Remove the category from those posts first.`,
      });
    }

    await prisma.blogCategory.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "blogCategory deleted successfully" });
  } catch (err) {
    logger.error("Error deleting blog category:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
