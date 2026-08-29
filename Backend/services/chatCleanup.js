import { prisma } from "../utils/prismaConnection.js";
import { sendWebhook } from "./webhookService.js";
import { logger } from "../utils/logger.js";

export const SOFT_ARCHIVE_DAYS = 30;
export const HARD_DELETE_DAYS = 90;
export const ABANDONED_HOURS = 4;
export const AUTO_CLOSE_DAYS = 7;

/**
 * Soft-archives chats inactive for `days` (marks status "ARCHIVED").
 * Then hard-deletes chats inactive for HARD_DELETE_DAYS (messages cascade).
 * Traveller leads are never deleted.
 */
export async function cleanupOldChats({ days = SOFT_ARCHIVE_DAYS } = {}) {
  const softCutoff = new Date();
  softCutoff.setDate(softCutoff.getDate() - days);

  const hardCutoff = new Date();
  hardCutoff.setDate(hardCutoff.getDate() - HARD_DELETE_DAYS);

  try {
    const archived = await prisma.chatConversation.updateMany({
      where: {
        status: { not: "ARCHIVED" },
        lastMessageAt: { lt: softCutoff },
      },
      data: { status: "ARCHIVED" },
    });

    const deleted = await prisma.chatConversation.deleteMany({
      where: {
        status: "ARCHIVED",
        lastMessageAt: { lt: hardCutoff },
      },
    });

    return { archived: archived.count, deleted: deleted.count, softCutoff, hardCutoff };
  } catch (err) {
    logger.error("Cleanup error:", { error: err.message, stack: err.stack });
    return { archived: 0, deleted: 0, softCutoff, hardCutoff };
  }
}

/**
 * Fires a CHAT_ABANDONED webhook for chats where the last message came from the
 * tourist and there has been no activity for `hours`. Each chat is alerted once
 * (dedup via needsData.abandonedAlertedAt). Companion to the Telegram alert.
 */
export async function alertAbandonedChats({ hours = ABANDONED_HOURS } = {}) {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hours);

  try {
    const conversations = await prisma.chatConversation.findMany({
      where: {
        status: { not: "ARCHIVED" },
        botState: { in: ["READY", "ASKING_HUMAN"] },
        lastMessageAt: { lt: cutoff },
        OR: [
          { needsData: { path: ["abandonedAlertedAt"], equals: null } },
          { needsData: { path: ["abandonedAlertedAt"], not: null, lt: new Date(0) } },
        ],
      },
      select: {
        id: true,
        token: true,
        touristName: true,
        phone: true,
        travellerId: true,
        assignedToUserId: true,
        needsData: true,
        lastMessageAt: true,
        messages: {
          orderBy: { id: "desc" },
          take: 1,
          select: { direction: true, body: true, source: true },
        },
      },
    });

    let sent = 0;
    for (const conv of conversations) {
      const last = conv.messages?.[0];
      if (!last || last.direction !== "in") continue;

      const now = new Date();
      await prisma.chatConversation.update({
        where: { id: conv.id },
        data: {
          needsData: { ...(conv.needsData || {}), abandonedAlertedAt: now.toISOString() },
        },
      });

      await sendWebhook("CHAT_ABANDONED", {
        conversationId: conv.id,
        token: conv.token,
        touristName: conv.touristName,
        phone: conv.phone,
        travellerId: conv.travellerId,
        assignedToUserId: conv.assignedToUserId,
        lastMessage: last.body,
        lastMessageAt: conv.lastMessageAt,
      });
      sent += 1;
    }

    return { checked: conversations.length, sent, cutoff };
  } catch (err) {
    logger.error("Abandoned-chat scan error:", { error: err.message, stack: err.stack });
    return { checked: 0, sent: 0, cutoff };
  }
}

/**
 * Auto-closes ACTIVE conversations that have been inactive for `days`.
 * Sets status to "CLOSED" so agents know to move on.
 */
export async function autoCloseConversations({ days = AUTO_CLOSE_DAYS } = {}) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  try {
    const closed = await prisma.chatConversation.updateMany({
      where: {
        status: "ACTIVE",
        lastMessageAt: { lt: cutoff },
      },
      data: { status: "CLOSED" },
    });

    // Delete messages from auto-closed conversations
    if (closed.count > 0) {
      const cutoffConvos = await prisma.chatConversation.findMany({
        where: { status: "CLOSED", lastMessageAt: { lt: cutoff } },
        select: { id: true },
      });
      for (const c of cutoffConvos) {
        await prisma.chatMessage.deleteMany({ where: { conversationId: c.id } });
      }
    }

    return { closed: closed.count, cutoff };
  } catch (err) {
    logger.error("Auto-close scan error:", { error: err.message, stack: err.stack });
    return { closed: 0, cutoff };
  }
}
