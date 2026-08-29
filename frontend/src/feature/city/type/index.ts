export interface Banner {
  id: number;
  bannerTitle: string;
  bannerTag: string;
  images: string[];
}

export interface City {
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
  famousFor?: string;
  attractions?: string;
  weather?: string;
  stateId: number;
  state?: {
    id: number;
    title: string;
    slug: string;
    country?: { id: number; title: string; slug: string };
  };
  journeys?: { id: number; title: string; slug: string }[];
  isActive: boolean;
  showOnSite?: boolean;
  displayOrder?: number;
  banner?: Banner | null;
  tourCount?: number;
  _count?: { journeys: number };
}

export interface CityPayload {
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
  famousFor?: string;
  attractions?: string;
  weather?: string;
  stateId: number;
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
