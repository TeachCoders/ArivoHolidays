export interface Banner {
  id: number;
  bannerTitle: string;
  bannerTag: string;
  images: string[];
}

export interface Season {
  id: number;
  title: string;
  slug: string;
  season?: string | null;
  seoDescription: string;
  moreDescription?: string;
  overView?: string;
  seoKeyword?: string;
  canonical?: string;
  seoTitle?: string;
  h1Title?: string;
  thumbImg?: string;
  weather?: string;
  bestFor?: string;
  festivals?: string;
  isActive: boolean;
  displayOrder?: number;
  banner?: Banner | null;
}

export interface SeasonPayload {
  title: string;
  slug?: string;
  season?: string | null;
  seoDescription: string;
  moreDescription?: string;
  overView?: string;
  seoKeyword?: string;
  canonical?: string;
  seoTitle?: string;
  h1Title?: string;
  thumbImg?: string;
  weather?: string;
  bestFor?: string;
  festivals?: string;
  isActive?: boolean;
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
