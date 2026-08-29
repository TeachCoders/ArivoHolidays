import express from "express";
import { prisma } from "../utils/prismaConnection.js";
import { requireSalesOrAdmin } from "../middleware/requireSalesOrAdmin.js";
import { requireSuperAdmin } from "../middleware/requireSuperAdmin.js";
import { handlePrismaError } from "../utils/handlePrismaError.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

router.get("/", requireSalesOrAdmin, async (req, res) => {
  try {
    const groups = await prisma.vendorGroup.findMany({
      include: {
        vendors: {
          select: { id: true, vendarName: true, vendarEmail: true, vendarMobile: true, vendarIsActive: true, vendarServiceType: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json({ success: true, count: groups.length, data: groups });
  } catch (err) {
    logger.error("Error fetching vendor groups:", { error: err.message, stack: err.stack });
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/", requireSuperAdmin, async (req, res) => {
  try {
    const { name, description, isActive, type } = req.body;
    const group = await prisma.vendorGroup.create({
      data: { name, description, isActive, type }
    });
    res.status(201).json({ success: true, message: "Vendor Group created", data: group });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "A group for this vendor type already exists" });
    }
    logger.error("Error creating vendor group:", { error: err.message, stack: err.stack });
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.put("/:id", requireSuperAdmin, async (req, res) => {
  try {
    const allowedFields = ["name"];
    const invalidKeys = Object.keys(req.body).filter((key) => !allowedFields.includes(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({ success: false, message: `Invalid field(s): ${invalidKeys.join(", ")}. Only 'name' can be updated` });
    }
    if (typeof req.body.name !== "string" || !req.body.name.trim()) {
      return res.status(400).json({ success: false, message: "'name' is required and must be a non-empty string" });
    }
    const group = await prisma.vendorGroup.update({
      where: { id: Number(req.params.id) },
      data: { name: req.body.name.trim() }
    });
    res.status(200).json({ success: true, message: "Vendor Group updated", data: group });
  } catch (err) {
    logger.error("Error updating vendor group:", { error: err.message, stack: err.stack });
    if (handlePrismaError(res, err, "Vendor Group")) return;
    res.status(500).json({ success: false, message: "Failed to update vendor group" });
  }
});

router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    await prisma.vendorGroup.delete({
      where: { id: Number(req.params.id) }
    });
    res.status(200).json({ success: true, message: "Vendor Group deleted" });
  } catch (err) {
    logger.error("Error deleting vendor group:", { error: err.message, stack: err.stack });
    if (handlePrismaError(res, err, "Vendor Group")) return;
    res.status(500).json({ success: false, message: "Failed to delete vendor group" });
  }
});

export default router;
