export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  seoDescription: string;
  moreDescription?: string;
  author?: string;
  category?: string;
  tags?: string;
  publishedAt?: string;
  thumbImg?: string;
  seoKeyword?: string;
  canonical?: string;
  seoTitle?: string;
  h1Title?: string;
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPostPayload {
  title: string;
  slug?: string;
  seoDescription: string;
  moreDescription?: string;
  author?: string;
  category?: string;
  tags?: string;
  publishedAt?: string;
  thumbImg?: string;
  seoKeyword?: string;
  canonical?: string;
  seoTitle?: string;
  h1Title?: string;
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
