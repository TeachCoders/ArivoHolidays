import 'dotenv/config';
import nodemailer from 'nodemailer';
import { generateTravellerEmailHTML, generateCancellationEmailHTML, generatePaymentConfirmationEmailHTML, generateBookingConfirmationEmailHTML, generatePartnerLeadEmailHTML } from '../templates/travellerEmailTemplate.js';
import { logger } from "./logger.js";

// SMTP transporter — env se configurable. By default Gmail SMTP;
// branded (Zoho/Brevo ina any) ke liye SMTP_HOST + SMTP_PORT set karo.
const createTransporter = () =>
  process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASSWORD,
        },
      })
    : nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

/**
 * Sends a welcome/confirmation email to the traveller
 * @param {string} toEmail - The recipient's email address
 * @param {string} travellerId - The unique traveller ID (e.g. TRV-12345)
 * @param {string} name - The traveller's name
 * @param {object} travelInfo - Key-value pairs of their booking details
 */
export const sendTravellerEmail = async (toEmail, travellerId, name, travelInfo) => {
  if (!process.env.EMAIL_ID || !process.env.EMAIL_PASSWORD) {
    logger.warn('EMAIL_ID or EMAIL_PASSWORD not set. Skipping email notification.');
    return false;
  }

  try {
    const transporter = createTransporter();

    // Template function call kiya (Clean Code)
    const htmlContent = generateTravellerEmailHTML(name, travellerId, travelInfo);

    const mailOptions = {
      from: `"${process.env.BRAND_NAME || 'Arivo Holiday'}" <${process.env.EMAIL_ID}>`,
      to: toEmail,
      subject: `Booking Confirmation & Your Travel ID - ${process.env.BRAND_NAME || 'Arivo Holiday'}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending traveller email:', { error: error.message, stack: error.stack });
    return false;
  }
};

/**
 * Sends a cancellation alert email to the traveller
 */
export const sendCancellationEmail = async (toEmail, travellerId, name, agentName) => {
  if (!process.env.EMAIL_ID || !process.env.EMAIL_PASSWORD) {
    logger.warn('EMAIL_ID or EMAIL_PASSWORD not set. Skipping cancellation email.');
    return false;
  }

  try {
    const transporter = createTransporter();

    const htmlContent = generateCancellationEmailHTML(name, travellerId, agentName);

    const mailOptions = {
      from: `"${process.env.BRAND_NAME || 'Arivo Holiday'} Senior Management" <${process.env.EMAIL_ID}>`,
      to: toEmail,
      subject: `Important: Tour Cancellation & Safety Alert - ${process.env.BRAND_NAME || 'Arivo Holiday'}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Cancellation email sent successfully to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending cancellation email:', { error: error.message, stack: error.stack });
    return false;
  }
};

/**
 * Sends a payment confirmation email with portal password to the traveller
 * @param {string} toEmail - Traveller's email
 * @param {string} travellerId - Unique traveller ID
 * @param {string} name - Traveller's name
 * @param {string} password - Portal password to send
 */
export const sendPaymentConfirmationEmail = async (toEmail, travellerId, name, password) => {
  if (!process.env.EMAIL_ID || !process.env.EMAIL_PASSWORD) {
    logger.warn('EMAIL_ID or EMAIL_PASSWORD not set. Skipping payment confirmation email.');
    return false;
  }

  try {
    const transporter = createTransporter();

    const htmlContent = generatePaymentConfirmationEmailHTML(name, travellerId, password);

    const mailOptions = {
      from: `"${process.env.BRAND_NAME || 'Arivo Holiday'}" <${process.env.EMAIL_ID}>`,
      to: toEmail,
      subject: `✅ Payment Confirmed & Portal Access - ${travellerId} | ${process.env.BRAND_NAME || 'Arivo Holiday'}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Payment confirmation email sent to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending payment confirmation email:', { error: error.message, stack: error.stack });
    return false;
  }
};

/**
 * Sends a booking confirmation email after admin approves payment
 * Includes password, invoice details, due payment info, and security instructions
 */
export const sendBookingConfirmationEmail = async (toEmail, travellerId, name, password, invoiceNo, totalInvoiced, totalPaid, dueAmount, slabLabel, requiredAmount) => {
  if (!process.env.EMAIL_ID || !process.env.EMAIL_PASSWORD) {
    logger.warn('EMAIL_ID or EMAIL_PASSWORD not set. Skipping booking confirmation email.');
    return false;
  }

  try {
    const transporter = createTransporter();

    const htmlContent = generateBookingConfirmationEmailHTML(name, travellerId, password, invoiceNo, totalInvoiced, totalPaid, dueAmount, slabLabel, requiredAmount);

    const mailOptions = {
      from: `"${process.env.BRAND_NAME || 'Arivo Holiday'}" <${process.env.EMAIL_ID}>`,
      to: toEmail,
      subject: `🎉 Booking Confirmed & Portal Access - ${travellerId} | ${process.env.BRAND_NAME || 'Arivo Holiday'}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Booking confirmation email sent to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending booking confirmation email:', { error: error.message, stack: error.stack });
    return false;
  }
};

/**
 * Sends a generic HTML email with optional PDF attachment
 * @param {string} toEmail - Recipient email
 * @param {string} subject - Subject line
 * @param {string} htmlContent - HTML body content
 * @param {Buffer|null} pdfAttachment - Optional PDF buffer to attach
 * @param {string} pdfFilename - Filename for the PDF attachment
 */
export const sendEmail = async (toEmail, subject, htmlContent, pdfAttachment = null, pdfFilename = 'invoice.pdf') => {
  if (!process.env.EMAIL_ID || !process.env.EMAIL_PASSWORD) {
    logger.warn('EMAIL_ID or EMAIL_PASSWORD not set. Skipping generic email.');
    return false;
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.BRAND_NAME || 'Arivo Holiday'}" <${process.env.EMAIL_ID}>`,
      to: toEmail,
      subject: subject,
      html: htmlContent,
    };

    if (pdfAttachment) {
      mailOptions.attachments = [
        {
          filename: pdfFilename,
          content: pdfAttachment,
          contentType: 'application/pdf',
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Generic email sent to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending generic email:', { error: error.message, stack: error.stack });
    return false;
  }
};

/**
 * Sends a lead-card notification email to the auto-assigned sales partner
 * @param {string} toEmail - Partner's email
 * @param {object} lead - Traveller lead object (travellerId, name, email, phone, country, travelDate, pageReference)
 * @param {string|null} partnerName - Partner's display name
 */
export const sendPartnerLeadEmail = async (toEmail, lead, partnerName = null) => {
  if (!toEmail) {
    logger.warn('sendPartnerLeadEmail: no recipient email provided. Skipping.');
    return false;
  }
  const brandName = process.env.BRAND_NAME || "Arivo Holiday";
  const htmlContent = generatePartnerLeadEmailHTML(lead, partnerName);
  return sendEmail(
    toEmail,
    `🎯 New Lead ${lead.travellerId || ''} - ${lead.name || ''} (${lead.country || 'Country'}) | ${brandName}`,
    htmlContent
  );
};
