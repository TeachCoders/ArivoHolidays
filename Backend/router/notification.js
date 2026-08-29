import express from "express";
import { prisma } from "../utils/prismaConnection.js";
import { requireSalesOrAdmin } from "../middleware/requireSalesOrAdmin.js";
import { handlePrismaError } from "../utils/handlePrismaError.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// GET notifications for current user (super_admin gets all, others get their own + role-based)
router.get("/", requireSalesOrAdmin, async (req, res) => {
  try {
    const user = req.session?.user;
    const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
    const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");

    let where = {};
    if (isSuperAdmin) {
      where = {};
    } else {
      where = {
        OR: [
          { userId: user.id },
          { targetRole: normalizedRole },
          { targetRole: "all" },
        ],
      };
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: { ...where, read: false },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (err) {
    logger.error("Error fetching notifications:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// GET unread count only
router.get("/unread-count", requireSalesOrAdmin, async (req, res) => {
  try {
    const user = req.session?.user;
    const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
    const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");

    let where = {};
    if (isSuperAdmin) {
      where = { read: false };
    } else {
      where = {
        read: false,
        OR: [
          { userId: user.id },
          { targetRole: normalizedRole },
          { targetRole: "all" },
        ],
      };
    }

    const unreadCount = await prisma.notification.count({ where });

    return res.status(200).json({ success: true, unreadCount });
  } catch (err) {
    logger.error("Error fetching unread count:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// PATCH mark all notifications as read (must be before /:id/read)
router.patch("/mark-all-read", requireSalesOrAdmin, async (req, res) => {
  try {
    const user = req.session?.user;
    const normalizedRole = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
    const isSuperAdmin = normalizedRole.includes("super") && normalizedRole.includes("admin");

    let where = {};
    if (isSuperAdmin) {
      where = { read: false };
    } else {
      where = {
        read: false,
        OR: [
          { userId: user.id },
          { targetRole: normalizedRole },
          { targetRole: "all" },
        ],
      };
    }

    await prisma.notification.updateMany({
      where,
      data: { read: true },
    });

    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    logger.error("Error marking all notifications as read:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// PATCH mark single notification as read
router.patch("/:id/read", requireSalesOrAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Invalid notification id" });
    }
    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return res.status(200).json({ success: true, data: notification });
  } catch (err) {
    logger.error("Error marking notification as read:", { error: err.message, stack: err.stack });
    if (handlePrismaError(res, err, "Notification")) return;
    return res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
});

export default router;
