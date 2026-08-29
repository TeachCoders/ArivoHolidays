import express from "express";
import { prisma } from "../utils/prismaConnection.js";
import { requireSalesOrAdmin } from "../middleware/requireSalesOrAdmin.js";
import { requireSuperAdmin } from "../middleware/requireSuperAdmin.js";
import bcrypt from "bcryptjs";
import { passwordComplexity } from "./auth.js";
import { handlePrismaError } from "../utils/handlePrismaError.js";
import { logger } from "../utils/logger.js";
const router = express.Router();

// GET vendor detail dashboard — assignments, payments, stats
router.get("/detail/:id", requireSalesOrAdmin, async (req, res) => {
  try {
    const vendorId = Number(req.params.id);

    const [vendor, assignments, invoiceItems, paymentData] = await Promise.all([
      prisma.vendor.findUnique({
        where: { id: vendorId },
        select: {
          id: true,
          vendarName: true,
          vendarEmail: true,
          vendarCompanyName: true,
          vendarServiceType: true,
          engagementModel: true,
          defaultCommission: true,
          vendarIsActive: true,
          vendarMobile: true,
          vendarAddress: true,
          vendarWorkingAreas: true,
          vndarGstNumber: true,
          vendarWebsite: true,
          bankAccountName: true,
          bankAccountNumber: true,
          bankIfscCode: true,
        },
      }),
      prisma.vendorAssignment.findMany({
        where: { vendorId },
        include: {
          traveller: { select: { id: true, name: true, status: true, phone: true, travellerId: true } },
          payments: { include: { installments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.invoiceItem.findMany({
        where: { vendorId },
        include: {
          invoice: {
            include: {
              traveller: { select: { id: true, name: true, travellerId: true } },
            },
          },
        },
      }),
      prisma.vendorPayment.aggregate({
        where: { vendorId },
        _sum: { amount: true, paidAmount: true, pendingAmount: true },
        _count: true,
      }),
    ]);

    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });

    return res.status(200).json({
      success: true,
      data: {
        vendor,
        assignments,
        invoiceItems,
        stats: {
          totalAssignments: assignments.length,
          completedAssignments: assignments.filter(a => a.status === "COMPLETED").length,
          upcomingAssignments: assignments.filter(a => a.status === "UPCOMING").length,
          ongoingAssignments: assignments.filter(a => a.status === "ONGOING").length,
          totalEarnings: paymentData._sum.paidAmount || 0,
          pendingVendorPayments: paymentData._sum.pendingAmount || 0,
          vendorPaymentRecords: paymentData._count || 0,
        },
      },
    });
  } catch (err) {
    logger.error("Error fetching vendor detail:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


router.get("/portal/:id", requireSalesOrAdmin, async (req, res) => {
  try {
    const vendorId = Number(req.params.id);

    const [vendor, assignments, paymentData] = await Promise.all([
      prisma.vendor.findUnique({
        where: { id: vendorId },
        select: {
          id: true,
          vendarName: true,
          vendarEmail: true,
          vendarCompanyName: true,
          vendarServiceType: true,
          engagementModel: true,
          defaultCommission: true,
          vendarIsActive: true,
        },
      }),
      prisma.vendorAssignment.findMany({
        where: { vendorId },
        include: {
          traveller: { select: { id: true, name: true, phone: true, country: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.vendorPayment.aggregate({
        where: { vendorId },
        _sum: { amount: true, paidAmount: true, pendingAmount: true },
      }),
    ]);

    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });

    const activeAssignments = assignments.filter((a) => a.status === "UPCOMING" || a.status === "ONGOING").length;
    const completedServices = assignments.filter((a) => a.status === "COMPLETED").length;

    return res.status(200).json({
      success: true,
      data: {
        vendor,
        assignments,
        stats: {
          activeAssignments,
          completedServices,
          totalEarnings: paymentData._sum.paidAmount || 0,
          pendingPayments: paymentData._sum.pendingAmount || 0,
        },
      },
    });
  } catch (err) {
    logger.error("Error fetching vendor portal:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});



// GET unassigned invoice items (vendorId is null) — grouped by city + service
router.get("/unassigned-items", requireSuperAdmin, async (req, res) => {
  try {
    const items = await prisma.invoiceItem.findMany({
      where: { vendorId: null },
      include: {
        invoice: {
          include: {
            traveller: { select: { id: true, name: true, travellerId: true } },
          },
        },
      },
      orderBy: { id: "desc" },
    });

    // Group by city + service
    const grouped = {};
    for (const item of items) {
      const key = `${item.location}__${item.ServiceName}`;
      if (!grouped[key]) {
        grouped[key] = {
          city: item.location,
          service: item.ServiceName,
          items: [],
        };
      }
      grouped[key].items.push({
        id: item.id,
        hotelName: item.hotelName,
        hotelType: item.hotelType,
        carName: item.carName,
        carType: item.carType,
        guideName: item.guideName,
        guideLanguage: item.guideLanguage,
        ServcieQty: item.ServcieQty,
        UnitPrice: item.UnitPrice,
        TotalPrice: item.TotalPrice,
        travellerName: item.invoice?.traveller?.name || "Unknown",
        travellerId: item.invoice?.traveller?.id,
      });
    }

    return res.status(200).json({
      success: true,
      count: items.length,
      data: Object.values(grouped),
    });
  } catch (err) {
    logger.error("Error fetching unassigned items:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// PATCH assign vendor to invoice item
router.patch("/assign-to-item", requireSuperAdmin, async (req, res) => {
  try {
    const { itemId, vendorId } = req.body;
    if (!itemId || !vendorId) {
      return res.status(400).json({ success: false, message: "itemId and vendorId are required" });
    }

    const updated = await prisma.invoiceItem.update({
      where: { id: Number(itemId) },
      data: { vendorId: Number(vendorId) },
      include: { vendor: { select: { id: true, vendarName: true, vendarCompanyName: true } } },
    });

    return res.status(200).json({ success: true, message: "Vendor assigned successfully", data: updated });
  } catch (err) {
    logger.error("Error assigning vendor to item:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/", requireSalesOrAdmin, async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        vendorGroup: true,
        invoiceItems: {
          include: {
            invoice: {
              include: {
                traveller: {
                  select: { id: true, name: true, email: true, phone: true }
                }
              }
            }
          }
        }
      },
    });

    return res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (err) {
    logger.error("Error fetching vendors:", { error: err.message, stack: err.stack });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.post("/", requireSuperAdmin, async (req, res) => {
  try {
    const VENDOR_CREATE_FIELDS = [
      "vendarName", "vendarEmail", "vendarCompanyName", "vendarMobile",
      "vendarAddress", "vendarServiceType", "vendarWorkingAreas",
      "vendarWebsite", "vndarGstNumber", "vendarPassword",
      "vendarProfileImage", "vendarBannerImage", "vendarIsActive",
      "engagementModel", "defaultCommission", "vendorGroupId",
    ];
    const payload = {};
    for (const field of VENDOR_CREATE_FIELDS) {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    }
    if (payload.vendarMobile && !/^\+?[0-9]{10,15}$/.test(payload.vendarMobile.replace(/\s/g, ''))) {
      return res.status(400).json({ success: false, message: "Invalid mobile number. Must be 10-15 digits." });
    }
    if (payload.vendarPassword) {
      const passwordCheck = passwordComplexity.safeParse(payload.vendarPassword);
      if (!passwordCheck.success) {
        return res.status(400).json({ success: false, message: passwordCheck.error.issues[0].message });
      }
      payload.vendarPassword = await bcrypt.hash(payload.vendarPassword, 10);
    }

    const VALID_VENDOR_TYPES = ["TOUR_OPERATOR", "CAB_OPERATOR", "HOTEL", "TRANSPORT_VENDOR", "HOTEL_VENDOR", "ACTIVITY_VENDOR", "GUIDE_VENDOR", "ALL"];
    if (payload.vendarServiceType && !VALID_VENDOR_TYPES.includes(payload.vendarServiceType)) {
      payload.vendarServiceType = "ALL";
    }
    if (payload.vendarWorkingAreas && typeof payload.vendarWorkingAreas === "string") {
      payload.vendarWorkingAreas = payload.vendarWorkingAreas.split(",").map((a) => a.trim()).filter(Boolean);
    }
    if (payload.vendorGroupId !== undefined && payload.vendorGroupId !== null && payload.vendorGroupId !== "") {
      payload.vendorGroupId = Number(payload.vendorGroupId);
    } else {
      delete payload.vendorGroupId;
    }
    if (payload.defaultCommission !== undefined && payload.defaultCommission !== null && payload.defaultCommission !== "") {
      payload.defaultCommission = Number(payload.defaultCommission);
    } else {
      delete payload.defaultCommission;
    }

    const data = await prisma.vendor.create({
      data: payload,
    });

    return res.status(201).json({
      success: true,
      message: "Successfully registered",
      info: data,
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Vendor email already exists",
      });
    }

    logger.error("Error creating vendor:", { error: err.message, stack: err.stack });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/:id", requireSuperAdmin, async (req, res) => {
  try {
    const VENDOR_UPDATE_FIELDS = [
      "vendarName", "vendarEmail", "vendarCompanyName", "vendarMobile",
      "vendarAddress", "vendarServiceType", "vendarWorkingAreas",
      "vendarWebsite", "vndarGstNumber", "vendarPassword", "vendarIsActive",
      "vendarProfileImage", "vendarBannerImage",
      "engagementModel", "defaultCommission", "vendorGroupId",
    ];
    const payload = {};
    for (const field of VENDOR_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    }
    if (payload.vendarMobile && !/^\+?[0-9]{10,15}$/.test(payload.vendarMobile.replace(/\s/g, ''))) {
      return res.status(400).json({ success: false, message: "Invalid mobile number. Must be 10-15 digits." });
    }
    if (payload.vendarPassword) {
      const passwordCheck = passwordComplexity.safeParse(payload.vendarPassword);
      if (!passwordCheck.success) {
        return res.status(400).json({ success: false, message: passwordCheck.error.issues[0].message });
      }
      payload.vendarPassword = await bcrypt.hash(payload.vendarPassword, 10);
    } else {
      delete payload.vendarPassword;
    }

    const VALID_VENDOR_TYPES = ["TOUR_OPERATOR", "CAB_OPERATOR", "HOTEL", "TRANSPORT_VENDOR", "HOTEL_VENDOR", "ACTIVITY_VENDOR", "GUIDE_VENDOR", "ALL"];
    if (payload.vendarServiceType && !VALID_VENDOR_TYPES.includes(payload.vendarServiceType)) {
      payload.vendarServiceType = "ALL";
    }
    if (payload.vendarWorkingAreas && typeof payload.vendarWorkingAreas === "string") {
      payload.vendarWorkingAreas = payload.vendarWorkingAreas.split(",").map((a) => a.trim()).filter(Boolean);
    }
    if (payload.vendorGroupId !== undefined && payload.vendorGroupId !== null && payload.vendorGroupId !== "") {
      payload.vendorGroupId = Number(payload.vendorGroupId);
    } else if (payload.vendorGroupId === "" || payload.vendorGroupId === null) {
      payload.vendorGroupId = null;
    }
    if (payload.defaultCommission !== undefined && payload.defaultCommission !== null && payload.defaultCommission !== "") {
      payload.defaultCommission = Number(payload.defaultCommission);
    } else {
      delete payload.defaultCommission;
    }

    const data = await prisma.vendor.update({
      where: { id: Number(req.params.id) },
      data: payload,
    });

    return res.status(200).json({
      success: true,
      message: "Successfully updated",
      info: data,
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "Vendor email already exists" });
    }
    if (handlePrismaError(res, err, "Vendor")) return;
    logger.error("Error updating vendor:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    await prisma.vendor.delete({
      where: { id: Number(req.params.id) },
    });

    return res.status(200).json({
      success: true,
      message: "Successfully deleted",
    });
  } catch (err) {
    if (err.code === "P2003") {
      return res.status(409).json({ success: false, message: "Vendor has linked records" });
    }
    if (handlePrismaError(res, err, "Vendor")) return;
    logger.error("Error deleting vendor:", { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


const venderRouter = router

export default venderRouter;