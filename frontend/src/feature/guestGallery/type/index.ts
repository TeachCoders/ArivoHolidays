export interface GuestGallery {
  id: number;
  imageUrl: string;
  caption?: string;
  location?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedGuestGallery {
  status: string;
  data: GuestGallery[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
