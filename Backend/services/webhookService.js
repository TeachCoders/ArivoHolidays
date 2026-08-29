import dotenv from "dotenv";
import { logger } from "../utils/logger.js";

dotenv.config();

/**
 * Send a webhook notification for a given event.
 * @param {string} event - The name of the event (e.g. LEAD_CREATED)
 * @param {object} data - The data payload to send
 */
export const sendWebhook = async (event, data) => {
  const webhookUrl = process.env.WEBHOOK_URL;
  
  if (!webhookUrl) {
    // If no webhook URL is configured, skip silently
    return;
  }

  try {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Make the POST request without waiting for the response to avoid blocking the main thread
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000)
    }).catch(err => {
      logger.error(`[Webhook Error] Failed to send ${event} webhook:`, { message: err.message });
    });
    
  } catch (error) {
    logger.error(`[Webhook Error] Exception when preparing ${event} webhook:`, { message: error.message });
  }
};
