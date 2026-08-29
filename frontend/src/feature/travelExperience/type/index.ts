export interface Banner {
  id: number;
  bannerTitle: string;
  bannerTag: string;
  images: string[];
}

export interface TravelExperience {
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
  type?: string;
  idealFor?: string;
  duration?: string;
  budgetRange?: string;
  highlights?: string;
  isActive: boolean;
  displayOrder?: number;
  banner?: Banner | null;
}

export interface TravelExperiencePayload {
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
  type?: string;
  idealFor?: string;
  duration?: string;
  budgetRange?: string;
  highlights?: string;
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
