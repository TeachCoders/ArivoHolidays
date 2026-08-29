import { z } from "zod";
import createCmsRouter from "../utils/createCmsRouter.js";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  season: z.string().optional(),
  seoDescription: z.string().min(1, "Description is required").max(500),
  overView: z.string().max(500).optional(),
  seoKeyword: z.string().optional(),
  canonical: z.string().optional(),
  seoTitle: z.string().optional(),
  h1Title: z.string().optional(),
  thumbImg: z.string().optional(),
  moreDescription: z.string().optional(),
  weather: z.string().optional(),
  bestFor: z.string().optional(),
  festivals: z.string().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export default createCmsRouter({
  modelName: "month",
  entityType: "Season",
  schema,
  searchFields: ["title", "slug", "seoKeyword"],
  listSelect: {
    id: true,
    title: true,
    slug: true,
    season: true,
    seoTitle: true,
    h1Title: true,
    seoKeyword: true,
    seoDescription: true,
    thumbImg: true,
    overView: true,
    isActive: true,
    displayOrder: true,
  },
  tourCountWhere: (id) => ({ months: { some: { id } } }),
});
