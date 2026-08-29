export interface Banner {
  id: number;
  bannerTitle: string;
  bannerTag: string;
  images: string[];
}

export interface Country {
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
  currency?: string;
  language?: string;
  timezone?: string;
  bestTimeToVisit?: string;
  dialCode?: string;
  isActive: boolean;
  showOnSite?: boolean;
  displayOrder?: number;
  states: { id: number; title: string; slug: string }[];
  banner?: Banner | null;
  tourCount?: number;
  //_count?: { states: number };
}

export interface CountryPayload {
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
  currency?: string;
  language?: string;
  timezone?: string;
  bestTimeToVisit?: string;
  dialCode?: string;
  isActive?: boolean;
  showOnSite?: boolean;
  displayOrder?: number;
  bannerTitle?: string;
  bannerTag?: string;
  bannerImages?: string[];
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
