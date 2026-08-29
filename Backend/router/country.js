import { z } from "zod";
import createCmsRouter from "../utils/createCmsRouter.js";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  seoDescription: z.string().min(1, "Description is required").max(500),
  overView: z.string().max(1200, "Short seoDescription should be under 200 words").optional(),
  seoKeyword: z.string().optional(),
  canonical: z.string().optional(),
  seoTitle: z.string().optional(),
  h1Title: z.string().optional(),
  thumbImg: z.string().optional(),
  moreDescription: z.string().optional(),
  capital: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  bestTimeToVisit: z.string().optional(),
  dialCode: z.string().optional(),
  isActive: z.boolean().optional(),
  showOnSite: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export default createCmsRouter({
  modelName: "country",
  entityType: "Country",
  schema,
  searchFields: ["title", "slug", "seoKeyword"],
  listSelect: {
    id: true,
    title: true,
    slug: true,
    seoTitle: true,
    h1Title: true,
    seoKeyword: true,
    seoDescription: true,
    thumbImg: true,
    overView: true,
    isActive: true,
    showOnSite: true,
    displayOrder: true,
  },
  childInclude: { model: "states", select: { id: true, title: true, slug: true, displayOrder: true } },
  extraFilters: ["id"],
  tourCountWhere: (id) => ({ cities: { some: { state: { countryId: id } } } }),
});
