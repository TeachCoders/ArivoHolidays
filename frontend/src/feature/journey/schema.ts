import { z } from "zod";

export const journeySchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  seoDescription: z.string().min(1, "SEO Description is required"),
  overView: z.string().optional(),
  seoKeyword: z.string().optional(),
  seoTitle: z.string().optional(),
  h1Title: z.string().optional(),
  thumbImg: z.string().optional(),
  moreDescription: z.string().optional(),
  destination: z.string().optional(),
  duration: z.string().optional(),
  noDays: z.number().min(1, "Must be at least 1 day"),
  pricePerPerson: z.number().optional(),
  discountPrice: z.number().optional(),
  cityIds: z.array(z.number()).min(1, "At least one city must be selected"),
  monthIds: z.array(z.number()).optional(),
  travelExperienceIds: z.array(z.number()).optional(),
  highlights: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isBestSelling: z.boolean().default(false),
  displayOrder: z.number().default(0),
  days: z
    .array(
      z.object({
        day: z.string(),
        description: z.string(),
        image: z.string().optional(),
      })
    )
    .optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  whyChooseUs: z.array(z.string()).optional(),
  bookingPolicy: z.array(z.string()).optional(),
  faqs: z
    .array(
      z.object({
        ques: z.string(),
        ans: z.string(),
      })
    )
    .optional(),
  bannerTitle: z.string().optional(),
  bannerTag: z.string().optional(),
  bannerImages: z.array(z.string()).optional(),
  suggestedJourneyIds: z.array(z.number()).optional(),
  
  // These are for UI filtering but might not go to backend directly
  filterCountryIds: z.array(z.number()).optional(),
  filterStateIds: z.array(z.number()).optional(),
});

export type JourneyFormValues = z.infer<typeof journeySchema>;
