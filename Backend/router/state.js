import { z } from "zod";
import createCmsRouter from "../utils/createCmsRouter.js";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  seoDescription: z.string().min(1, "Description is required").max(500),
  overView: z.string().max(500).optional(),
  seoKeyword: z.string().optional(),
  canonical: z.string().optional(),
  seoTitle: z.string().optional(),
  h1Title: z.string().optional(),
  thumbImg: z.string().optional(),
  moreDescription: z.string().optional(),
  capital: z.string().optional(),
  language: z.string().optional(),
  famousFor: z.string().optional(),
  area: z.string().optional(),
  countryId: z.number().int().min(1, "Country is required"),
  isActive: z.boolean().optional(),
  showOnSite: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export default createCmsRouter({
  modelName: "state",
  entityType: "State",
  schema,
  searchFields: ["title", "slug", "seoKeyword"],
  parentField: "countryId",
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
    countryId: true,
  },
  parentInclude: { model: "country", select: { id: true, title: true, slug: true } },
  childInclude: { model: "cities", select: { id: true, title: true, slug: true, thumbImg: true, displayOrder: true } },
  tourCountWhere: (id) => ({ cities: { some: { stateId: id } } }),
});
