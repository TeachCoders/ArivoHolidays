export interface CmsPage {
  id: number;
  title: string;
  slug: string;
  seoDescription: string;
  moreDescription?: string;
  seoKeyword?: string;
  canonical?: string;
  seoTitle?: string;
  h1Title?: string;
  thumbImg?: string;
  faqs?: { id?: number; ques: string; ans: string }[];
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CmsPagePayload {
  title: string;
  slug?: string;
  seoDescription: string;
  moreDescription?: string;
  seoKeyword?: string;
  canonical?: string;
  seoTitle?: string;
  h1Title?: string;
  thumbImg?: string;
  faqs?: { id?: number; ques: string; ans: string }[];
  isActive?: boolean;
  displayOrder?: number;
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
