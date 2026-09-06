import { z } from "zod";
import createCmsRouter from "../utils/createCmsRouter.js";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  theme: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().min(1, "Description is required"),
  h1Title: z.string().optional(),
  bannerImages: z.array(z.string()).optional(),
  whyChooseImages: z.array(z.string()).optional(),
  heroHeading: z.string().optional(),
  heroSubheading: z.string().optional(),
  ctaText: z.string().optional(),
  ctaFormEnabled: z.boolean().optional(),
  linkedJourneyIds: z.array(z.number()).optional(),
  linkedTourPackageIds: z.array(z.number()).optional(),
  linkedDestinationType: z.string().optional(),
  linkedDestinationIds: z.array(z.number()).optional(),
  sectionsOrder: z.any().optional(), // z.any() for Json
  customCardOverrides: z.any().optional(), // landing page specific card overrides
  customFaqs: z.any().optional(), // landing page specific FAQs
  isActive: z.boolean().optional(),
  utmSource: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export default createCmsRouter({
  modelName: "adLandingPage",
  entityType: "AdLandingPage",
  schema,
  searchFields: ["title", "slug", "theme"],
  extraFilters: ["theme"],
});
