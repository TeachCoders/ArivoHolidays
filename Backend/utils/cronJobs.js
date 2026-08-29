import cron from "node-cron";
import { prisma } from "./prismaConnection.js";
import { cleanupOldChats, alertAbandonedChats, autoCloseConversations, SOFT_ARCHIVE_DAYS } from "../services/chatCleanup.js";
import { logger, pruneOldLogs } from "./logger.js";

// Auto-cancel leads whose travelDate has passed and have no active vendor assignments
// Runs once every hour at minute 0
cron.schedule("0 * * * *", async () => {
  logger.info("[CRON] Running auto-cancellation script...");
  try {
    const now = new Date();
    const result = await prisma.traveller.updateMany({
      where: {
        travelDate: { lt: now },
        bookingStatus: { notIn: ["cancelled", "confirmed"] },
        cancelledAt: null,
        vendorAssignments: { none: { status: { in: ["UPCOMING", "ONGOING"] } } },
      },
      data: {
        status: "CANCELLED",
        bookingStatus: "cancelled",
        cancelledAt: now,
        cancellationReason: `Auto cancel by scheduled cron worker on ${now.toISOString().split("T")[0]}`,
      },
    });
    if (result.count > 0) {
      logger.info(`[CRON] Auto-cancelled ${result.count} leads`);
    }
  } catch (err) {
    logger.error("[CRON] Auto-cancellation failed:", { message: err.message });
  }
});

// Soft-archive chats inactive for 30 days (status "ARCHIVED"); hard-delete at 90.
// Traveller leads are kept. Runs daily at 03:10 + once at startup.
const runChatCleanup = async () => {
  try {
    const { archived, deleted, softCutoff } = await cleanupOldChats({ days: SOFT_ARCHIVE_DAYS });
    if (archived > 0 || deleted > 0) {
      logger.info(`[CRON] Chat cleanup — archived ${archived}, deleted ${deleted} inactive conversation(s)`);
    }
  } catch (err) {
    logger.error("[CRON] Chat cleanup failed:", { message: err.message });
  }
};
cron.schedule("10 3 * * *", runChatCleanup);
runChatCleanup();

// Fire CHAT_ABANDONED webhook for chats idle 4h+ with the last word from the tourist.
// Runs every 30 minutes.
const runAbandonedScan = async () => {
  try {
    const { checked, sent } = await alertAbandonedChats();
    if (sent > 0) {
      logger.info(`[CRON] Abandoned-chat scan — checked ${checked}, alerted ${sent}`);
    }
  } catch (err) {
    logger.error("[CRON] Abandoned-chat scan failed:", { message: err.message });
  }
};
cron.schedule("*/30 * * * *", runAbandonedScan);

// Auto-close ACTIVE conversations inactive for 7+ days.
// Runs daily at 03:30 (after the soft-archive job).
const runAutoClose = async () => {
  try {
    const { closed } = await autoCloseConversations();
    if (closed > 0) {
      logger.info(`[CRON] Auto-close — closed ${closed} inactive conversation(s)`);
    }
  } catch (err) {
    logger.error("[CRON] Auto-close failed:", { message: err.message });
  }
};
cron.schedule("30 3 * * *", runAutoClose);

// ── 12 PM daily: log cleanup + lead summary ───────────────────
cron.schedule("0 12 * * *", async () => {
  logger.info("[CRON] 12 PM daily job started");

  // 1) Prune log files older than 30 days
  try {
    const deleted = pruneOldLogs();
    if (deleted > 0) {
      logger.info(`[CRON] Log cleanup — deleted ${deleted} old log file(s)`);
    }
  } catch (err) {
    logger.error("[CRON] Log cleanup failed", { error: err.message });
  }

  // 2) Daily lead summary
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalLeads, newToday, cancelledToday, bookedToday] = await Promise.all([
      prisma.traveller.count(),
      prisma.traveller.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.traveller.count({ where: { status: "CANCELLED", cancelledAt: { gte: startOfDay } } }),
      prisma.traveller.count({ where: { bookingStatus: "confirmed", updatedAt: { gte: startOfDay } } }),
    ]);

    logger.info("[CRON] Daily lead summary", {
      totalLeads,
      newToday,
      cancelledToday,
      bookedToday,
    });
  } catch (err) {
    logger.error("[CRON] Daily summary failed", { error: err.message });
  }

  logger.info("[CRON] 12 PM daily job completed");
});

// ── Startup: prune old logs once ──────────────────────────────
try {
  const deleted = pruneOldLogs();
  if (deleted > 0) {
    logger.info(`[STARTUP] Cleaned ${deleted} old log file(s)`);
  }
} catch {}

logger.info("[CRON] Cron jobs registered");
