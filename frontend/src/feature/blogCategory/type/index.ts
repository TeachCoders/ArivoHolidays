export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
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
