import express from "express";
import { prisma } from "../utils/prismaConnection.js";
import verifySession from "../middleware/verifySession.js";
import { requireSuperAdmin } from "../middleware/requireSuperAdmin.js";
import { logger } from "../utils/logger.js";
import { z } from "zod";

const router = express.Router();

const createTeamSchema = z.object({
  name: z.string().trim().min(1, "Team name is required").max(100),
  description: z.string().max(500).optional(),
});

const updateTeamSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  users: z.array(z.number().int().positive()).optional(),
});

// ── POST / — create team ──────────────────────────────────────
router.post("/", requireSuperAdmin, async (req, res) => {
  try {
    const parsed = createTeamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input",
      });
    }

    const { name, description } = parsed.data;

    const existing = await prisma.teams.findFirst({ where: { name } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Team already exists" });
    }

    const team = await prisma.teams.create({ data: { name, description } });

    return res.status(201).json({ success: true, message: "Team created", data: team });
  } catch (err) {
    logger.error("Error creating team", { error: err.message });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ── PUT /:id — update team + reassign users ───────────────────
router.put("/:id", requireSuperAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid team id" });
    }

    const parsed = updateTeamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input",
      });
    }

    const { name, description, users } = parsed.data;

    const existing = await prisma.teams.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    // Name uniqueness check (skip if name unchanged)
    if (name && name !== existing.name) {
      const duplicate = await prisma.teams.findFirst({ where: { name } });
      if (duplicate) {
        return res.status(409).json({ success: false, message: "Team name already taken" });
      }
    }

    // Validate user IDs exist before assigning
    if (users && Array.isArray(users) && users.length > 0) {
      const foundUsers = await prisma.users.findMany({
        where: { id: { in: users } },
        select: { id: true },
      });
      const foundIds = new Set(foundUsers.map((u) => u.id));
      const missing = users.filter((uid) => !foundIds.has(uid));
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `User(s) not found: ${missing.join(", ")}`,
        });
      }

      // Remove users not in new list from this team
      await prisma.users.updateMany({
        where: { teamId: id, id: { notIn: users } },
        data: { teamId: null },
      });

      // Assign users to this team
      await prisma.users.updateMany({
        where: { id: { in: users } },
        data: { teamId: id },
      });
    }

    const team = await prisma.teams.update({
      where: { id },
      data: { name, description },
    });

    return res.status(200).json({ success: true, message: "Team updated", data: team });
  } catch (err) {
    logger.error("Error updating team", { error: err.message, id: req.params.id });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ── GET / — list teams (Super Admin: all, others: own team) ───
router.get("/", verifySession, async (req, res) => {
  try {
    const userRole = req.session?.user?.role;
    const userTeamId = req.session?.user?.team?.id;

    const userSelect = {
      id: true, name: true, email: true, mobile: true, role: true, isActive: true,
    };

    if (userRole === "Super Admin" || !userTeamId) {
      const teams = await prisma.teams.findMany({
        include: { users: { select: userSelect } },
      });
      return res.status(200).json({ success: true, data: teams });
    }

    const team = await prisma.teams.findUnique({
      where: { id: Number(userTeamId) },
      include: { users: { select: userSelect } },
    });
    return res.status(200).json({ success: true, data: team ? [team] : [] });
  } catch (err) {
    logger.error("Error fetching teams", { error: err.message });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ── GET /member/:id — team member detail + lead stats ─────────
router.get("/member/:id", requireSuperAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid member id" });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, mobile: true, role: true, isActive: true,
        team: { select: { id: true, name: true } },
      },
    });

    if (!user) return res.status(404).json({ success: false, message: "Member not found" });

    const leads = await prisma.traveller.findMany({
      where: { assignedToUserId: userId },
      select: {
        id: true, name: true, travellerId: true, phone: true, email: true, status: true, createdAt: true,
        invoices: { select: { id: true, grandTotal: true, status: true } },
        payments: { select: { id: true, amount: true, status: true } },
        followupNotes: { select: { id: true, note: true, createdAt: true, channel: true } },
        vendor: { select: { id: true, vendarName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    let confirmed = 0, cancelled = 0, ongoing = 0, pending = 0, totalConversations = 0;
    let totalInvoiced = 0, totalPaid = 0;

    leads.forEach((lead) => {
      const st = lead.status || "pending";
      if (st === "confirmed") confirmed++;
      else if (st === "cancelled") cancelled++;
      else if (st === "working") ongoing++;
      else pending++;
      totalConversations += (lead.followupNotes || []).length;
      (lead.invoices || []).forEach((inv) => {
        if (inv.status !== "CANCELLED") totalInvoiced += inv.grandTotal || 0;
      });
      (lead.payments || []).forEach((pay) => {
        if (pay.status === "COMPLETED") totalPaid += Number(pay.amount) || 0;
      });
    });

    return res.status(200).json({
      success: true,
      data: {
        user,
        leads,
        stats: {
          totalLeads: leads.length,
          confirmed, cancelled, ongoing, pending,
          totalConversations,
          totalInvoiced, totalPaid,
          dueAmount: Math.max(0, totalInvoiced - totalPaid),
        },
      },
    });
  } catch (err) {
    logger.error("Error fetching team member", { error: err.message, id: req.params.id });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ── DELETE /:id — soft-delete team (isActive=false) ───────────
// Users are reassigned to null; their teamId is cleared.
router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid team id" });
    }

    const team = await prisma.teams.findUnique({ where: { id } });
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (!team.isActive) {
      return res.status(400).json({ success: false, message: "Team already deactivated" });
    }

    // Remove all users from this team
    await prisma.users.updateMany({
      where: { teamId: id },
      data: { teamId: null },
    });

    // Soft-delete: set isActive = false
    await prisma.teams.update({
      where: { id },
      data: { isActive: false },
    });

    return res.status(200).json({ success: true, message: "Team deactivated" });
  } catch (err) {
    logger.error("Error deactivating team", { error: err.message, id: req.params.id });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
