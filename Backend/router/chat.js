"use strict";
import express from "express";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { prisma } from "../utils/prismaConnection.js";
import { logger } from "../utils/logger.js";
import { requireTeamOrAdmin } from "../middleware/requireSalesOrAdmin.js";
import { requireSuperAdminOnly } from "../middleware/requireSuperAdminOnly.js";
import {
  chatStartSchema,
  chatMessageSchema,
  faqCreateSchema,
  faqUpdateSchema,
  faqReorderSchema,
  unansweredAnswerSchema,
  unansweredStatusSchema,
} from "../utils/validation.js";
import { createLead } from "../services/leadService.js";
import { runBot, buildWelcomeMessages } from "../services/chatBot.js";
import { recordUnanswered, answerUnansweredQuestion, answerFaqForFaq, deriveKeywords, invalidateFaqCache } from "../services/chatFaq.js";
import { resolveCountry, clientIpFromReq } from "../services/geoService.js";
import { getLinkCandidates } from "../services/botLinkService.js";
import { notifyNewChatMessageTelegram } from "../services/telegramNotify.js";

const router = express.Router();

const FLOW_STATES = [
  "AWAITING_DESTINATION",
  "AWAITING_TRIP_TYPE",
  "AWAITING_JOURNEY",
  "AWAITING_TRAVEL_DATE",
  "AWAITING_GROUP_SIZE",
  "AWAITING_BUDGET",
];

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, message: "Too many requests, please try again later" },
});

const CHANNEL_WEB = "web";

// ─────────────────────────────────────────────────────────────
// PUBLIC — resolve visitor country from their IP (widget prefill)
// ─────────────────────────────────────────────────────────────
router.get("/geo", chatLimiter, async (req, res) => {
  const ip = process.env.GEO_TEST_IP || clientIpFromReq(req);
  try {
    const geo = await resolveCountry(ip);
    return res.json({
      success: true,
      data: { ...(geo || { countryCode: "", countryName: "" }) },
    });
  } catch (error) {
    logger.error("Geo lookup failed", { message: error.message });
    return res.status(500).json({ success: false, message: "Geo lookup failed" });
  }
});

// ─────────────────────────────────────────────────────────────
// PUBLIC — start a new chat (captures name + WhatsApp number)
// ─────────────────────────────────────────────────────────────
router.post("/start", chatLimiter, async (req, res) => {
  const parsed = chatStartSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    return res.status(400).json({ success: false, message });
  }
  const { name, phone, pageUrl, country, countryId } = parsed.data;

  try {
    // ── Check if an active conversation already exists for this phone ──
    const existing = await prisma.chatConversation.findFirst({
      where: { phone, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      let messages = await prisma.chatMessage.findMany({
        where: { conversationId: existing.id },
        orderBy: { id: "asc" },
      });

      // If active conversation is in AWAITING_DESTINATION state and last message has no buttons, trigger destination buttons
      const lastMsg = messages[messages.length - 1];
      const hasButtons = lastMsg && lastMsg.buttons && Array.isArray(lastMsg.buttons) && lastMsg.buttons.length > 0;
      if (!hasButtons && existing.botState === "AWAITING_DESTINATION") {
        const botResult = await runBot(existing, "");
        if (botResult.replies && botResult.replies.length > 0) {
          for (const reply of botResult.replies) {
            if (!reply) continue;
            const text = (typeof reply === "string" ? reply : reply.text) || "";
            const buttons = (reply && typeof reply === "object" && Array.isArray(reply.buttons) && reply.buttons.length > 0) ? reply.buttons : undefined;
            const newMsg = await prisma.chatMessage.create({
              data: { conversationId: existing.id, channel: CHANNEL_WEB, direction: "out", body: text, buttons, source: "bot" },
            });
            messages.push(newMsg);
          }
        }
      }

      return res.status(200).json({
        success: true,
        resumed: true,
        data: {
          conversation: {
            id: existing.id,
            token: existing.token,
            touristName: existing.touristName,
            botState: existing.botState,
            travellerId: existing.travellerId,
          },
          messages,
        },
      });
    }

    // 1) Create or reuse lead (createLead() handles 30-day phone dedup internally)
    let lead = await createLead({
      name,
      phone,
      country,
      countryId,
      pageReference: pageUrl || "/chat",
      fromChat: true,
      source: "chat",
    });

    // 2) Unlink travellerId from any old conversation so the unique constraint allows a new one
    if (lead?.id) {
      await prisma.chatConversation.updateMany({
        where: { travellerId: lead.id, id: { not: 0 } },
        data: { travellerId: null },
      });
    }

    // 3) Create the conversation, linked to the lead
    const conversation = await prisma.chatConversation.create({
      data: {
        token: crypto.randomBytes(16).toString("hex"),
        touristName: name,
        phone,
        travellerId: lead.id,
        assignedToUserId: lead.assignedToUserId || null,
        status: "ACTIVE",
        lastChannel: CHANNEL_WEB,
        botState: "AWAITING_EXPLORE_MODE",
        needsData: {},
      },
    });

    // 3) Welcome messages from the bot
    const welcome = buildWelcomeMessages(name);
    await prisma.chatMessage.createMany({
      data: welcome.map((body) => ({
        conversationId: conversation.id,
        channel: CHANNEL_WEB,
        direction: "out",
        body,
      })),
    });
    
    // 3b) Run bot with empty trigger to show destination buttons
    const botResult = await runBot(conversation, "");
    if (botResult.replies && botResult.replies.length > 0) {
      await prisma.$transaction(
        botResult.replies
          .filter((reply) => reply != null)
          .map((reply) => {
            const text = (typeof reply === "string" ? reply : (reply && reply.text)) || "";
            const buttons = (reply && typeof reply === "object" && Array.isArray(reply.buttons) && reply.buttons.length > 0)
              ? reply.buttons
              : undefined;
            return prisma.chatMessage.create({
              data: { conversationId: conversation.id, channel: CHANNEL_WEB, direction: "out", body: text, buttons, source: "bot" },
            });
          })
      );
    }
    
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { id: "asc" },
    });

    return res.status(201).json({
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          token: conversation.token,
          touristName: conversation.touristName,
          botState: conversation.botState,
          travellerId: lead.travellerId,
        },
        messages,
      },
    });
  } catch (error) {
    logger.error("chat start error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// PUBLIC — tourist sends a message; bot replies (rules + FAQ)
// ─────────────────────────────────────────────────────────────
router.post("/:token/messages", chatLimiter, async (req, res) => {
  const parsed = chatMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    return res.status(400).json({ success: false, message });
  }
  const { token } = req.params;
  const body = parsed.data.body;
  const label = parsed.data.label;

  try {
    const conversation = await prisma.chatConversation.findUnique({
      where: { token },
    });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // 1) Persist the tourist's message
    await prisma.chatMessage.create({
      data: { conversationId: conversation.id, channel: CHANNEL_WEB, direction: "in", body: label || body, source: "tourist" },
    });

    // 2) Run the bot
    const result = await runBot(conversation, body);

    // 2a) Flow complete → free-text messages reach the partner on Telegram.
    if (["READY", "ASKING_HUMAN"].includes(conversation.botState)) {
      notifyNewChatMessageTelegram(conversation, body).catch((err) => {
        logger.error("Telegram notification failed", { message: err.message });
      });
    }

    // 2b) Record unanswered questions so the superadmin can train the bot.
    if (result.unanswered) {
      const source =
        result.unansweredSource || (FLOW_STATES.includes(conversation.botState) ? "flow_rejected" : "no_faq");
      recordUnanswered({
        text: body,
        source,
        destination: result.needsData?.destination || null,
        conversationId: conversation.id,
      }).catch((err) => {
        logger.error("recordUnanswered failed", { message: err.message });
      });
    }

    // 3) Persist bot replies
    let botMessages = [];
    if (result.replies.length) {
      botMessages = await prisma.$transaction(
        result.replies
          .filter((reply) => reply != null)
          .map((reply) => {
            const text = (typeof reply === "string" ? reply : (reply && reply.text)) || "";
            const buttons = (reply && typeof reply === "object" && Array.isArray(reply.buttons) && reply.buttons.length > 0)
              ? reply.buttons
              : undefined;
            return prisma.chatMessage.create({
              data: { conversationId: conversation.id, channel: CHANNEL_WEB, direction: "out", body: text, buttons, source: "bot" },
            });
          })
      );
    }

    // 4) Update conversation state + linked lead with captured needs
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: {
        botState: result.nextState,
        needsData: result.needsData,
        lastMessageAt: new Date(),
        status: "ACTIVE",
      },
    });

    if (conversation.travellerId && Object.keys(result.leadUpdate).length) {
      try {
        await prisma.traveller.update({
          where: { id: conversation.travellerId },
          data: result.leadUpdate,
        });
      } catch (leadErr) {
        logger.error("Failed to update lead from chat:", { message: leadErr.message });
      }
    }

    return res.json({ success: true, data: { replies: botMessages } });
  } catch (error) {
    logger.error("chat message error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// PUBLIC — poll for new messages (since a message id)
// ─────────────────────────────────────────────────────────────
router.get("/:token/messages", async (req, res) => {
  const { token } = req.params;
  const since = parseInt(req.query.since, 10) || 0;

  try {
    const conversation = await prisma.chatConversation.findUnique({
      where: { token },
      select: { id: true, travellerId: true, status: true },
    });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id, id: { gt: since } },
      orderBy: { id: "asc" },
    });

    return res.json({ success: true, data: { messages, status: conversation.status } });
  } catch (error) {
    logger.error("chat poll error:", { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN — list conversations (scoped by role)
// ─────────────────────────────────────────────────────────────
router.get("/conversations", requireTeamOrAdmin(["support"]), async (req, res) => {
  try {
    const user = req.session?.user;
    const role = (user?.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
    const isSuperAdmin = role.includes("super") && role.includes("admin");
    const isTeamLeader = role === "team_leader";

    let whereClause = {};
    if (isSuperAdmin) {
      whereClause = {};
    } else if (isTeamLeader) {
      whereClause = {
        OR: [{ assignedToUserId: null }, { assignedTo: { teamId: user.team?.id || undefined } }],
      };
    } else {
      whereClause = { assignedToUserId: user.id };
    }

    const conversations = await prisma.chatConversation.findMany({
      where: whereClause,
      include: {
        assignedTo: { select: { id: true, name: true } },
        traveller: { select: { travellerId: true, destination: true, status: true } },
        messages: { select: { id: true, direction: true, source: true, createdAt: true }, orderBy: { id: "asc" } },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    const data = conversations.map((c) => {
      const msgs = c.messages || [];
      const lastPartnerIndex = [...msgs].reverse().findIndex((m) => m.direction === "out" && m.source === "partner");
      const unread = lastPartnerIndex === -1 ? msgs.filter((m) => m.direction === "in").length : lastPartnerIndex;
      const last = msgs[msgs.length - 1];
      return {
        id: c.id,
        touristName: c.touristName,
        phone: c.phone,
        travellerId: c.travellerId,
        travellerCode: c.traveller?.travellerId || null,
        destination: c.traveller?.destination || c.needsData?.destination || null,
        status: c.status,
        lastChannel: c.lastChannel,
        lastMessageAt: c.lastMessageAt,
        lastMessage: last ? { direction: last.direction, createdAt: last.createdAt } : null,
        unread,
        assignedTo: c.assignedTo,
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    logger.error("list conversations error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN — full thread for a conversation
// ─────────────────────────────────────────────────────────────
router.get("/conversations/:id", requireTeamOrAdmin(["support"]), async (req, res) => {
  try {
    const convId = Number(req.params.id);
    if (!convId) return res.status(400).json({ success: false, message: "Invalid conversation id" });

    const conversation = await prisma.chatConversation.findUnique({
      where: { id: convId },
      include: {
        assignedTo: { select: { id: true, name: true } },
        traveller: true,
        messages: { orderBy: { id: "asc" } },
      },
    });
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });

    if (!canAccess(req.session?.user, conversation)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({ success: true, data: conversation });
  } catch (error) {
    logger.error("get conversation error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN — partner replies inside the dashboard inbox
// ─────────────────────────────────────────────────────────────
router.post("/conversations/:id/reply", requireTeamOrAdmin(["support"]), async (req, res) => {
  const parsed = chatMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    return res.status(400).json({ success: false, message });
  }
  const convId = Number(req.params.id);
  if (!convId) return res.status(400).json({ success: false, message: "Invalid conversation id" });

  try {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: convId },
      include: { traveller: true },
    });
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });

    if (!canAccess(req.session?.user, conversation)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const user = req.session?.user;
    const body = parsed.data.body;

    // Partner clicked a bot quick-reply button (e.g. "Day-by-day program") —
    // run the bot command so the tourist gets a proper bot answer.
    if (/^FETCH_TRIP_DAYS:/.test(body.trim())) {
      const botResult = await runBot(conversation, body.trim());
      if (botResult.replies && botResult.replies.length > 0) {
        await prisma.$transaction(
          botResult.replies
            .filter((reply) => reply != null)
            .map((reply) => {
              const text = (typeof reply === "string" ? reply : (reply && reply.text)) || "";
              const buttons = (reply && typeof reply === "object" && Array.isArray(reply.buttons) && reply.buttons.length > 0)
                ? reply.buttons
                : undefined;
              return prisma.chatMessage.create({
                data: {
                  conversationId: conversation.id,
                  channel: conversation.lastChannel || CHANNEL_WEB,
                  direction: "out",
                  body: text,
                  buttons,
                  source: "bot",
                },
              });
            })
        );
      }
      await prisma.chatConversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date(), status: "ACTIVE", botState: botResult.nextState, needsData: botResult.needsData },
      });
      return res.status(200).json({ success: true, data: { id: conversation.id } });
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        channel: conversation.lastChannel || CHANNEL_WEB,
        direction: "out",
        body,
        source: "partner",
      },
    });

    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date(), status: "ACTIVE" },
    });

    // First partner reply → mark the linked lead as being worked on
    if (conversation.travellerId) {
      try {
        const lead = conversation.traveller;
        if (lead && !lead.workingStartedAt) {
          await prisma.traveller.update({
            where: { id: lead.id },
            data: {
              workingStartedAt: new Date(),
              status: lead.status === "PENDING" ? "ONGOING" : lead.status,
              bookingStatus: lead.bookingStatus === "pending" ? "working" : lead.bookingStatus,
            },
          });
        }
      } catch (leadErr) {
        logger.error("Failed to update lead on first reply:", { message: leadErr.message });
      }
    }

    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    logger.error("chat reply error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// PUBLIC — tourist closes their own conversation by token
// ─────────────────────────────────────────────────────────────
const VALID_CONV_STATUSES = ["ACTIVE", "CLOSED", "ARCHIVED"];
router.patch("/conversations/by-token/:token/status", async (req, res) => {
  const { token } = req.params;
  const { status } = req.body || {};
  if (!VALID_CONV_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_CONV_STATUSES.join(", ")}` });
  }

  try {
    const conversation = await prisma.chatConversation.findUnique({ where: { token } });
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });

    await prisma.chatConversation.update({ where: { token }, data: { status } });
    if (status === "CLOSED") {
      await prisma.chatMessage.deleteMany({ where: { conversationId: conversation.id } });
    }
    return res.status(200).json({ success: true, data: { id: conversation.id, status } });
  } catch (error) {
    logger.error("chat status update (token) error:", { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// SALES/ADMIN — close or reopen a conversation
// ─────────────────────────────────────────────────────────────
router.patch("/conversations/:id/status", requireTeamOrAdmin(["support"]), async (req, res) => {
  const convId = Number(req.params.id);
  if (!convId) return res.status(400).json({ success: false, message: "Invalid conversation id" });
  const { status } = req.body || {};
  if (!VALID_CONV_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_CONV_STATUSES.join(", ")}` });
  }

  try {
    const conversation = await prisma.chatConversation.findUnique({ where: { id: convId } });
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });
    if (!canAccess(req.session?.user, conversation)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await prisma.chatConversation.update({ where: { id: convId }, data: { status } });
    if (status === "CLOSED") {
      await prisma.chatMessage.deleteMany({ where: { conversationId: convId } });
    }
    return res.status(200).json({ success: true, data: { id: convId, status } });
  } catch (error) {
    logger.error("chat status update error:", { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// SUPERADMIN — entity list for the FAQ "link to a page" picker
// ─────────────────────────────────────────────────────────────
router.get("/link-candidates", requireSuperAdminOnly, async (req, res) => {
  const type = typeof req.query.type === "string" ? req.query.type : "";
  const search = typeof req.query.search === "string" ? req.query.search : "";
  if (!type) {
    return res.status(400).json({ success: false, message: "type query param is required" });
  }
  try {
    const data = await getLinkCandidates(type, search);
    return res.json({ success: true, data });
  } catch (error) {
    logger.error("link candidates error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN — list bot FAQs (all chat roles can view; edit is superadmin only)
// ─────────────────────────────────────────────────────────────
router.get("/faqs", requireTeamOrAdmin(["support"]), async (req, res) => {
  try {
    const faqs = await prisma.chatFaq.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    return res.json({ success: true, data: faqs });
  } catch (error) {
    logger.error("list faqs error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// SUPERADMIN — add a FAQ (bot training)
// ─────────────────────────────────────────────────────────────
router.post("/faqs", requireSuperAdminOnly, async (req, res) => {
  const parsed = faqCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    return res.status(400).json({ success: false, message });
  }
  const { question, keywords, answer, sortOrder, linkType, linkEntityId, linkTitle, linkUrl } = parsed.data;
  try {
    const existing = await prisma.chatFaq.findFirst({
      where: { question: { equals: question, mode: "insensitive" } },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "Is question ka FAQ pehle se maujood hai." });
    }
    const faq = await prisma.chatFaq.create({
      data: {
        question,
        keywords: keywords.length ? keywords : deriveKeywords(question),
        answer,
        sortOrder,
        linkType: linkType || null,
        linkEntityId: linkEntityId || null,
        linkTitle: linkTitle || null,
        linkUrl: linkUrl || null,
      },
    });
    invalidateFaqCache();
    return res.status(201).json({ success: true, data: faq });
  } catch (error) {
    logger.error("create faq error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// SUPERADMIN — edit a FAQ (bot training)
// ─────────────────────────────────────────────────────────────
router.patch("/faqs/:id", requireSuperAdminOnly, async (req, res) => {
  const faqId = Number(req.params.id);
  if (!faqId) return res.status(400).json({ success: false, message: "Invalid FAQ id" });
  const parsed = faqUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    return res.status(400).json({ success: false, message });
  }
  try {
    const faq = await prisma.chatFaq.update({
      where: { id: faqId },
      data: parsed.data,
    });
    invalidateFaqCache();
    return res.json({ success: true, data: faq });
  } catch (error) {
    logger.error("update faq error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// SUPERADMIN — delete a FAQ
router.delete("/faqs/:id", requireSuperAdminOnly, async (req, res) => {
  const faqId = Number(req.params.id);
  if (!faqId) return res.status(400).json({ success: false, message: "Invalid FAQ id" });
  try {
    await prisma.chatFaq.delete({ where: { id: faqId } });
    invalidateFaqCache();
    return res.json({ success: true });
  } catch (error) {
    logger.error("delete faq error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// SUPERADMIN — reorder FAQs (sets sortOrder = array index)
router.post("/faqs/reorder", requireSuperAdminOnly, async (req, res) => {
  const parsed = faqReorderSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    return res.status(400).json({ success: false, message });
  }
  const { orderedIds } = parsed.data;
  try {
    await prisma.$transaction(
      orderedIds.map((id, index) => prisma.chatFaq.update({ where: { id }, data: { sortOrder: index } }))
    );
    invalidateFaqCache();
    return res.json({ success: true });
  } catch (error) {
    logger.error("reorder faqs error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// SUPERADMIN — preview how the bot will reply for this FAQ
router.get("/faqs/:id/preview", requireSuperAdminOnly, async (req, res) => {
  const faqId = Number(req.params.id);
  if (!faqId) return res.status(400).json({ success: false, message: "Invalid FAQ id" });
  try {
    const faq = await prisma.chatFaq.findUnique({ where: { id: faqId } });
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
    const reply = await answerFaqForFaq(faq);
    return res.json({ success: true, data: reply });
  } catch (error) {
    logger.error("preview faq error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// SUPERADMIN — unanswered questions (bot training queue)
// ─────────────────────────────────────────────────────────────
router.get("/unanswered", requireSuperAdminOnly, async (req, res) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : "open";
    const source = typeof req.query.source === "string" ? req.query.source : undefined;
    const where = { status };
    if (source) where.source = source;

    const items = await prisma.chatUnanswered.findMany({
      where,
      include: { answeredFaq: { select: { id: true, answer: true } } },
      orderBy: [{ count: "desc" }, { updatedAt: "desc" }],
      take: 300,
    });
    return res.json({ success: true, data: items });
  } catch (error) {
    logger.error("list unanswered error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// SUPERADMIN — answer an unanswered question → creates a FAQ (bot training)
// ─────────────────────────────────────────────────────────────
router.post("/unanswered/:id/answer", requireSuperAdminOnly, async (req, res) => {
  const parsed = unansweredAnswerSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    return res.status(400).json({ success: false, message });
  }
  const unansweredId = Number(req.params.id);
  if (!unansweredId) return res.status(400).json({ success: false, message: "Invalid id" });
  try {
    const faq = await answerUnansweredQuestion(unansweredId, parsed.data.answer, parsed.data);
    if (!faq) return res.status(404).json({ success: false, message: "Unanswered question not found" });
    return res.status(201).json({ success: true, data: faq });
  } catch (error) {
    logger.error("answer unanswered error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// SUPERADMIN — delete an unanswered question
// ─────────────────────────────────────────────────────────────
router.delete("/unanswered/:id", requireSuperAdminOnly, async (req, res) => {
  const unansweredId = Number(req.params.id);
  if (!unansweredId) return res.status(400).json({ success: false, message: "Invalid id" });
  try {
    await prisma.chatUnanswered.delete({
      where: { id: unansweredId },
    });
    return res.json({ success: true, message: "Unanswered question deleted" });
  } catch (error) {
    logger.error("delete unanswered error:", { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN — current user's chat availability (internal only)
// ─────────────────────────────────────────────────────────────
router.get("/availability", requireTeamOrAdmin(["support"]), async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.session.user.id },
      select: { id: true, chatAvailable: true, lastChatActiveAt: true },
    });
    return res.json({ success: true, data: user });
  } catch (error) {
    logger.error("get availability error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.patch("/availability", requireTeamOrAdmin(["support"]), async (req, res) => {
  try {
    const available = req.body.available === true || req.body.available === "true";
    const now = new Date();
    const user = await prisma.users.update({
      where: { id: req.session.user.id },
      data: {
        chatAvailable: available,
        lastChatActiveAt: available ? now : undefined,
      },
      select: { id: true, chatAvailable: true, lastChatActiveAt: true },
    });
    return res.json({ success: true, data: user });
  } catch (error) {
    logger.error("update availability error:", { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────────────────────
// Role-based access helper
// ─────────────────────────────────────────────────────────────
function canAccess(sessionUser, conversation) {
  if (!sessionUser) return false;
  const role = (sessionUser.role ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const isSuperAdmin = role.includes("super") && role.includes("admin");
  if (isSuperAdmin) return true;
  if (role === "team_leader") {
    return conversation.assignedToUserId === null ||
      (conversation.assignedTo?.teamId === sessionUser.team?.id);
  }
  return conversation.assignedToUserId === sessionUser.id;
}

export default router;
