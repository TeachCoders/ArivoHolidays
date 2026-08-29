import express from "express";
import { prisma } from "../utils/prismaConnection.js";
import { requireSalesOrAdmin } from "../middleware/requireSalesOrAdmin.js";
import { handlePrismaError } from "../utils/handlePrismaError.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// GET all vendor assignments with traveller + vendor info
router.get("/", requireSalesOrAdmin, async (req, res) => {
  try {
    const assignments = await prisma.vendorAssignment.findMany({
      include: {
        traveller: { select: { id: true, name: true, travellerId: true, phone: true, country: true } },
        vendor: { select: { id: true, vendarName: true, vendarEmail: true, vendarMobile: true, vendarServiceType: true, engagementModel: true, defaultCommission: true } },
        payments: { include: { installments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (err) {
    logger.error("Error fetching vendor assignments:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// GET vendor assignments summary stats (for My Services page)
router.get("/summary", requireSalesOrAdmin, async (req, res) => {
  try {
    const [totalAssignments, activeVendors, completedCount, upcomingCount, ongoingCount] = await Promise.all([
      prisma.vendorAssignment.count(),
      prisma.vendor.count({ where: { vendarIsActive: true } }),
      prisma.vendorAssignment.count({ where: { status: "COMPLETED" } }),
      prisma.vendorAssignment.count({ where: { status: "UPCOMING" } }),
      prisma.vendorAssignment.count({ where: { status: "ONGOING" } }),
    ]);

    const paymentData = await prisma.vendorPayment.aggregate({
      _sum: { amount: true, paidAmount: true, pendingAmount: true },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalAssignments,
        activeVendors,
        completedCount,
        upcomingCount,
        ongoingCount,
        totalEarnings: paymentData._sum.paidAmount || 0,
        pendingPayments: paymentData._sum.pendingAmount || 0,
      },
    });
  } catch (err) {
    logger.error("Error fetching assignment summary:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// GET stats for vendor dashboard
router.get("/stats", requireSalesOrAdmin, async (req, res) => {
  try {
    const [totalAssigned, activeVendors, paymentData] = await Promise.all([
      prisma.vendorAssignment.count(),
      prisma.vendor.count({ where: { vendarIsActive: true } }),
      prisma.vendorPayment.aggregate({ _sum: { amount: true, paidAmount: true, pendingAmount: true } }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalAssigned,
        activeVendors,
        totalEarnings: paymentData._sum.paidAmount || 0,
        pendingPayments: paymentData._sum.pendingAmount || 0,
      },
    });
  } catch (err) {
    logger.error("Error fetching vendor stats:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// POST create new vendor assignment
router.post("/", requireSalesOrAdmin, async (req, res) => {
  try {
    const { travellerId, vendorId, services, packageType, commissionRate, totalAmount, serviceWiseAmount, serviceWiseDetails, status, assignedDate, notes } = req.body;

    if (!travellerId || !vendorId) {
      return res.status(400).json({ success: false, message: "travellerId and vendorId are required" });
    }

    // Validate dates in serviceWiseDetails — check-out must be after check-in
    if (serviceWiseDetails && typeof serviceWiseDetails === "object") {
      for (const [svc, entries] of Object.entries(serviceWiseDetails)) {
        const items = Array.isArray(entries) ? entries : [entries];
        for (const item of items) {
          if (item?.startDate && item?.endDate && new Date(item.endDate) <= new Date(item.startDate)) {
            return res.status(400).json({ success: false, message: `Invalid dates for ${svc}: check-out must be after check-in` });
          }
        }
      }
    }

    const assignment = await prisma.vendorAssignment.create({
      data: {
        travellerId: Number(travellerId),
        vendorId: Number(vendorId),
        services: services || [],
        packageType: packageType || "INDIVIDUAL",
        commissionRate: commissionRate ? Number(commissionRate) : null,
        totalAmount: Number(totalAmount) || 0,
        serviceWiseAmount: serviceWiseAmount || {},
        serviceWiseDetails: serviceWiseDetails || {},
        status: status || "UPCOMING",
        assignedDate: assignedDate ? new Date(assignedDate) : new Date(),
        notes: notes || null,
      },
      include: {
        traveller: { select: { id: true, name: true, travellerId: true } },
        vendor: { select: { id: true, vendarName: true, vendarCompanyName: true, vendarMobile: true, vendarServiceType: true, engagementModel: true, defaultCommission: true } },
      },
    });

    // Synchronize with Traveller record so it reflects on the Sales Dashboard
    const allAssignments = await prisma.vendorAssignment.findMany({
      where: { travellerId: Number(travellerId) },
    });
    const allConfirmed = allAssignments.length > 0 && allAssignments.every((va) => va.status === "COMPLETED");

    await prisma.traveller.update({
      where: { id: Number(travellerId) },
      data: {
        vendorId: Number(vendorId),
        // assignedToUserId: null, // Clear internal team assignment
        assignedAt: new Date(),
        status: allConfirmed ? "COMPLETED" : "ONGOING",
        ...(allConfirmed && { bookingStatus: "confirmed", completedAt: new Date() }),
      }
    });

    return res.status(201).json({ success: true, message: "Vendor assigned successfully", data: assignment });
  } catch (err) {
    logger.error("Error creating vendor assignment:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// PUT update vendor assignment
router.put("/:id", requireSalesOrAdmin, async (req, res) => {
  try {
    const { services, packageType, commissionRate, totalAmount, serviceWiseAmount, serviceWiseDetails, status, notes } = req.body;

    const VALID_ASSIGNMENT_STATUSES = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];
    if (status !== undefined && !VALID_ASSIGNMENT_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const assignment = await prisma.vendorAssignment.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(services !== undefined && { services }),
        ...(packageType !== undefined && { packageType }),
        ...(commissionRate !== undefined && { commissionRate: Number(commissionRate) }),
        ...(totalAmount !== undefined && { totalAmount: Number(totalAmount) }),
        ...(serviceWiseAmount !== undefined && { serviceWiseAmount }),
        ...(serviceWiseDetails !== undefined && { serviceWiseDetails }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        traveller: { select: { id: true, name: true, travellerId: true } },
        vendor: { select: { id: true, vendarName: true, vendarCompanyName: true, vendarMobile: true, vendarServiceType: true, engagementModel: true, defaultCommission: true } },
        payments: { include: { installments: true } },
      },
    });

    // Sync status back to Traveller if it changes to COMPLETED or CANCELLED
    if (status === "COMPLETED") {
      const allAssignments = await prisma.vendorAssignment.findMany({
        where: { travellerId: assignment.travellerId }
      });
      const allConfirmed = allAssignments.length > 0 && allAssignments.every((va) => va.status === "COMPLETED");
      if (allConfirmed) {
        await prisma.traveller.update({
          where: { id: assignment.travellerId },
          data: {
            status: "COMPLETED",
            bookingStatus: "confirmed",
            completedAt: new Date(),
          }
        });
      }
    } else if (status === "CANCELLED") {
      await prisma.traveller.update({
        where: { id: assignment.travellerId },
        data: {
          status: "CANCELLED",
          bookingStatus: "cancelled",
          cancelledAt: new Date(),
          cancellationReason: "Cancelled from vendor assignment"
        }
      });
    }

    return res.status(200).json({ success: true, message: "Assignment updated", data: assignment });
  } catch (err) {
    if (handlePrismaError(res, err, "Vendor assignment")) return;
    logger.error("Error updating vendor assignment:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// DELETE vendor assignment
router.delete("/:id", requireSalesOrAdmin, async (req, res) => {
  try {
    await prisma.vendorAssignment.delete({ where: { id: Number(req.params.id) } });
    return res.status(200).json({ success: true, message: "Assignment deleted" });
  } catch (err) {
    if (handlePrismaError(res, err, "Vendor assignment")) return;
    logger.error("Error deleting vendor assignment:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
