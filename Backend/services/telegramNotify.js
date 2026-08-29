import { logger } from "../utils/logger.js";
"use strict";

/**
 * Optional Telegram notifications for new chats / new leads.
 * Fully optional — when TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_IDS is not set,
 * every function becomes a silent no-op so the ₹0 setup keeps working.
 */

const telegramEnabled = () => Boolean(process.env.TELEGRAM_BOT_TOKEN);

const chatIds = () =>
  (process.env.TELEGRAM_CHAT_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Sends a plain text message to all configured Telegram chat IDs.
 * @param {string} text
 * @returns {Promise<boolean>} true if at least one message was sent
 */
export async function sendTelegramMessage(text) {
  if (!telegramEnabled()) return false;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const ids = chatIds();
  if (!ids.length) return false;

  let sent = false;
  for (const chatId of ids) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        sent = true;
      } else {
        logger.error(`Telegram send to ${chatId} failed: ${res.status} ${await res.text()}`);
      }
    } catch (err) {
      logger.error("Telegram send error:", { message: err.message });
    }
  }
  return sent;
}

/**
 * Alert for a brand-new chat lead.
 * @param {object} lead - Traveller record
 * @param {object|null} partner - assigned Users record (or null)
 */
export async function notifyNewChatTelegram(lead, partner = null) {
  const brand = process.env.BRAND_NAME || "Arivo Holiday";
  const siteUrl = process.env.SITE_URL || "";
  let text =
    `🟢 <b>New chat lead — ${brand}</b>\n` +
    `👤 ${lead.name}\n` +
    `📞 ${lead.phone}\n` +
    `📍 ${lead.country || "Unknown"}\n` +
    (lead.destination ? `🗺 ${lead.destination}\n` : "") +
    (partner ? `🤝 Assigned to: ${partner.name}\n` : "") +
    `🆔 ${lead.travellerId}\n`;
  if (siteUrl) text += `🔗 ${siteUrl}/dashboard/chat`;

  return sendTelegramMessage(text);
}

/**
 * Alert for a NEW free-text message inside an ongoing chat (flow complete).
 * @param {object} conversation - ChatConversation record
 * @param {string} messageText - the tourist's latest message
 */
export async function notifyNewChatMessageTelegram(conversation, messageText) {
  const brand = process.env.BRAND_NAME || "Arivo Holiday";
  const siteUrl = process.env.SITE_URL || "";
  let text =
    `💬 <b>New chat message — ${brand}</b>\n` +
    `👤 ${conversation.touristName || "Tourist"}\n` +
    `📞 ${conversation.phone || ""}\n` +
    `💬 ${String(messageText || "").slice(0, 300)}\n`;
  if (siteUrl) text += `🔗 ${siteUrl}/dashboard/chat`;

  return sendTelegramMessage(text);
}
