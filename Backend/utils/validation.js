import { z } from "zod";

export const isMissingOrValidDate = (v) => !v || !isNaN(new Date(v).getTime());

const strictPhoneRefine = (val) => {
  let local = val.replace(/[\s-]/g, "");
  if (local.startsWith("+91")) {
    local = local.slice(3);
    if (!/^[6-9]\d{9}$/.test(local)) return false;
  } else if (local.length === 10 && !local.startsWith("+")) {
    if (!/^[6-9]\d{9}$/.test(local)) return false;
  }
  
  const justDigits = local.replace(/\D/g, "");
  
  // Block identical digits (e.g., 9999999999)
  if (/^([0-9])\1{9,14}$/.test(justDigits)) return false;
  
  // Block common fake sequences
  const fakes = ["123456789", "987654321", "012345678", "876543210"];
  if (fakes.some(f => justDigits.includes(f))) return false;
  
  // Check if the number has at least 3 unique digits
  const uniqueDigits = new Set(justDigits.split(""));
  if (uniqueDigits.size < 3) return false;

  return true;
};

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().email("A valid email is required").max(150, "Email is too long"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{10,20}$/, "A valid phone number (10-15 digits) is required")
    .refine(strictPhoneRefine, "Please enter a genuine mobile number"),
  country: z.string().trim().max(100).optional().default(""),
  countryId: z.string().trim().max(50).optional().default(""),
  pageReference: z.string().trim().max(255).optional().default("/booking"),
  defaultPassword: z.string().max(255).optional(),
  travelDate: z.string().optional().refine(isMissingOrValidDate, "Invalid travel date"),
});

export const tourBookingSchema = z.object({
  travellerId: z.string().trim().optional(),
  name: z.string().trim().min(2, "Name is required").max(100).optional(),
  email: z.string().trim().email("A valid email is required").max(150).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{10,20}$/, "A valid phone number (10-15 digits) is required")
    .refine(strictPhoneRefine, "Please enter a genuine mobile number")
    .optional(),
  country: z.string().trim().max(100).optional(),
  countryId: z.string().trim().max(50).optional(),
  pageReference: z.string().trim().max(255).optional(),
  defaultPassword: z.string().max(255).optional(),
  noOfPersons: z.coerce.number().int().nonnegative().optional(),
  noOfChildren: z.coerce.number().int().nonnegative().optional(),
  hotelCategory: z.string().max(100).optional(),
  travelStartDate: z.string().optional().refine(isMissingOrValidDate, "Invalid start date"),
  travelEndDate: z.string().optional().refine(isMissingOrValidDate, "Invalid end date"),
  travellerMessage: z.string().max(2000).optional(),
  paymentScreenshotUrl: z.string().url().max(500).optional().or(z.literal("")),
  transactionId: z.string().max(255).optional(),
  transactionDetail: z.string().max(1000).optional(),
});

export const vehicleBookingSchema = z.object({
  travellerId: z.string().trim().optional(),
  name: z.string().trim().min(2, "Name is required").max(100).optional(),
  email: z.string().trim().email("A valid email is required").max(150).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{10,20}$/, "A valid phone number (10-15 digits) is required")
    .refine(strictPhoneRefine, "Please enter a genuine mobile number")
    .optional(),
  country: z.string().trim().max(100).optional(),
  countryId: z.string().trim().max(50).optional(),
  pageReference: z.string().trim().max(255).optional(),
  defaultPassword: z.string().max(255).optional(),
  vehicleName: z.string().max(150).optional(),
  serviceType: z.string().max(150).optional(),
  travellerMessage: z.string().max(2000).optional(),
  paymentScreenshotUrl: z.string().url().max(500).optional().or(z.literal("")),
  transactionId: z.string().max(255).optional(),
  transactionDetail: z.string().max(1000).optional(),
});

export const chatStartSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100, "Name is too long"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{10,20}$/, "Please enter a valid WhatsApp number")
    .refine(strictPhoneRefine, "Please enter a genuine mobile number"),
  pageUrl: z.string().trim().max(500).optional().default("/chat"),
  country: z.string().trim().max(100).optional().default(""),
  countryId: z.string().trim().max(50).optional().default(""),
});

export const chatMessageSchema = z.object({
  body: z.string().trim().min(1, "Message is required").max(2000, "Message is too long"),
  label: z.string().trim().max(2000, "Label is too long").optional(),
});

export const faqLinkSchema = {
  linkType: z
    .enum(["travelExperience", "journey", "country", "state", "city", "season", "tourPackage", "blog", "custom"])
    .nullable()
    .optional(),
  linkEntityId: z.number().int().positive().nullable().optional(),
  linkTitle: z.string().trim().max(500).nullable().optional(),
  linkUrl: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .refine((v) => !v || /^(https?:\/\/|\/)/.test(v), "linkUrl must be a full URL (http://...) or a /path"),
};

export const faqCreateSchema = z.object({
  question: z.string().trim().min(3, "Question is required").max(300, "Question is too long"),
  keywords: z.array(z.string().trim().min(1)).max(20).optional().default([]),
  answer: z.string().trim().min(3, "Answer is required").max(2000, "Answer is too long"),
  sortOrder: z.number().int().nonnegative().optional().default(0),
  ...faqLinkSchema,
});

export const faqUpdateSchema = z.object({
  question: z.string().trim().min(3, "Question is required").max(300).optional(),
  keywords: z.array(z.string().trim().min(1)).max(20).optional(),
  answer: z.string().trim().min(3, "Answer is required").max(2000).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  ...faqLinkSchema,
});

export const unansweredAnswerSchema = z.object({
  answer: z.string().trim().min(3, "Answer is required").max(2000, "Answer is too long"),
  ...faqLinkSchema,
});

export const faqReorderSchema = z.object({
  orderedIds: z.array(z.number().int().positive()).min(1, "orderedIds is required"),
});

export const unansweredStatusSchema = z.object({
  status: z.enum(["ignored"]),
});
