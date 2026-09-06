import type { City } from "@/feature/city/type";
import type { Journey } from "@/feature/journey/type";

export interface Banner {
  id: number;
  bannerTitle: string;
  bannerTag: string;
  images: string[];
}

export interface State {
  id: number;
  title: string;
  slug: string;
  seoDescription: string;
  moreDescription?: string;
  overView?: string;
  seoKeyword?: string;
  canonical?: string;
  seoTitle?: string;
  h1Title?: string;
  thumbImg?: string;
  capital?: string;
  language?: string;
  famousFor?: string;
  area?: string;
  countryId: number;
  country?: { id: number; title: string; slug: string };
  isActive: boolean;
  showOnSite?: boolean;
  displayOrder?: number;
  cities?: Partial<City>[];
  journeys?: Journey[];
  banner?: Banner | null;
  faqs?: { id?: number; ques: string; ans: string }[];
  tourCount?: number;
  _count?: { cities: number };
}

export interface StatePayload {
  title: string;
  slug?: string;
  seoDescription: string;
  moreDescription?: string;
  overView?: string;
  seoKeyword?: string;
  canonical?: string;
  seoTitle?: string;
  h1Title?: string;
  thumbImg?: string;
  capital?: string;
  language?: string;
  famousFor?: string;
  area?: string;
  countryId: number;
  isActive?: boolean;
  showOnSite?: boolean;
  displayOrder?: number;
  bannerTitle?: string;
  bannerTag?: string;
  bannerImages?: string[];
  faqs?: { ques: string; ans: string }[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
