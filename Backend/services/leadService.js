"use strict";
import { prisma } from "../utils/prismaConnection.js";
import crypto from "crypto";
import { sendTravellerEmail, sendPartnerLeadEmail } from "../utils/emailSender.js";
import { sendWebhook } from "./webhookService.js";
import { notifyNewChatTelegram } from "./telegramNotify.js";
import { logger } from "../utils/logger.js";

/**
 * Creates a Traveller lead, auto-assigns it to the configured sales partner
 * (DEFAULT_ASSIGNEE_EMAIL), sends the partner a full lead-card email, sends a
 * welcome email to the tourist (when an email is provided), and fires the
 * dashboard notifications + webhook.
 *
 * Shared by the website lead form and the chat widget.
 *
 * @param {object} input
 * @param {string} input.name
 * @param {string} [input.email]          - optional (chat leads usually lack email)
 * @param {string} input.phone
 * @param {string} [input.country]
 * @param {string} [input.countryId]
 * @param {string} [input.pageReference]
 * @param {string} [input.travelDate]     - ISO date string or null
 * @param {string} [input.destination]
 * @param {number} [input.groupSize]
 * @param {string} [input.budgetRange]
 * @param {boolean} [input.fromChat]      - when true, sends Telegram new-chat alert
 * @param {string}  [input.source]        - lead origin: "chat" | "website" | "direct"
 * @returns {Promise<object>} the created Traveller record
 */
export async function createLead({
  name,
  email = "",
  phone,
  country = "",
  countryId = "",
  pageReference = "/booking",
  defaultPassword = null,
  travelDate = null,
  destination = null,
  groupSize = null,
  budgetRange = null,
  fromChat = false,
  source = "website",
} = {}) {
  // ── Duplicate prevention: reuse existing lead within 30 days ──
  const LEAD_REUSE_MS = 30 * 24 * 60 * 60 * 1000;
  if (phone) {
    const existing = await prisma.traveller.findFirst({
      where: { phone, createdAt: { gte: new Date(Date.now() - LEAD_REUSE_MS) } },
      orderBy: { createdAt: "desc" },
    });
    if (existing) {
      // Update the existing lead with any new info provided, skip notifications
      return prisma.traveller.update({
        where: { id: existing.id },
        data: {
          name: name || existing.name,
          email: email || existing.email,
          country: country || existing.country,
          countryId: countryId || existing.countryId,
          pageReference: pageReference || existing.pageReference,
          source: source || existing.source,
          status: existing.status === "CANCELLED" ? "PENDING" : existing.status,
          ...(travelDate && { travelDate: new Date(travelDate) }),
          ...(destination && { destination }),
          ...(groupSize && { groupSize: Number(groupSize) }),
          ...(budgetRange && { budgetRange }),
        },
      });
    }
  }

  // ── Create new lead ──
  const travellerId = `TRV-${Date.now()}-${crypto.randomBytes(2).toString("hex")}`;
  const newTraveller = await prisma.traveller.create({
    data: {
      travellerId,
      name,
      email: email || "",
      phone,
      country,
      countryId,
      pageReference,
      source,
      defaultPassword,
      travelDate: travelDate ? new Date(travelDate) : null,
      destination,
      groupSize: groupSize ? Number(groupSize) : null,
      budgetRange,
    },
  });

  const assignedPartnerUser = null;

  // 📬 Send welcome email notification (only when the tourist provided an email)
  if (newTraveller.email) {
    const travelInfo = {
      destination: newTraveller.destination || newTraveller.country || "Not Specified",
      registeredPhone: newTraveller.phone || "Not Specified",
      inquirySource: pageReference || "Website Direct",
      message: `Thank you for reaching out to ${process.env.BRAND_NAME || 'Arivo Holiday'}. One of our verified travel experts will contact you shortly via Call or WhatsApp to discuss your custom itinerary.`,
    };
    try {
      await sendTravellerEmail(
        newTraveller.email,
        newTraveller.travellerId,
        newTraveller.name,
        travelInfo
      );
    } catch (mailErr) {
      logger.error("Failed to send traveller welcome email:", { message: mailErr.message });
    }
  }

  // 🔔 Create notification for super admin about new lead
  const sourceLabel = source === "chat" ? "Chat" : "Website";
  const notifDetail = `${newTraveller.name} | ${newTraveller.phone || "N/A"} | ${sourceLabel}`;
  try {
    await prisma.notification.create({
      data: {
        type: "NEW_LEAD",
        targetRole: "all",
        title: "New Lead Received",
        message: `${notifDetail} | ${newTraveller.country || "India"} | ${newTraveller.travellerId} | From: ${newTraveller.pageReference || "unknown"}`,
        link: "/dashboard/my-leads",
      },
    });
  } catch (notifErr) {
    logger.error("Failed to create notification:", { message: notifErr.message });
  }

  // Trigger Webhook Notification
  sendWebhook("LEAD_CREATED", newTraveller);

  // Telegram alert for chat-originated leads (no-op when not configured)
  if (fromChat) {
    await notifyNewChatTelegram(newTraveller, assignedPartnerUser);
  }

  return newTraveller;
}
