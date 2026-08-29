export interface Banner {
  id: number;
  bannerTitle: string;
  bannerTag: string;
  images: string[];
}

export interface JourneyDay {
  id: number;
  day: string;
  seoDescription: string;
  image: string;
}

export interface Journey {
  id: number;
  title: string;
  slug: string;
  seoDescription: string;
  overView?: string;
  seoKeyword?: string;
  canonical?: string;
  seoTitle?: string;
  h1Title?: string;
  thumbImg?: string;
  moreDescription?: string;
  destination?: string;
  duration?: string;
  noDays: number;
  pricePerPerson?: number;
  discountPrice?: number;
  cityIds: number[];
  monthIds?: number[];
  travelExperienceIds?: number[];
  hotelDetails?: any;
  carDetails?: any;
  guideDetails?: any;
  highlights?: string[];
  isActive?: boolean;
  isBestSelling?: boolean;
  displayOrder?: number;
  purchaseCount?: number;
  createdById?: number;
  createdAt?: string;
  updatedAt?: string;
  cities?: {
    id: number;
    title: string;
    slug: string;
    state?: {
      id: number;
      title: string;
      slug: string;
      country?: { id: number; title: string; slug: string };
    };
  }[];
  route?: {
    id: number;
    title: string;
    slug: string;
    state?: {
      id: number;
      title: string;
      slug: string;
      country?: { id: number; title: string; slug: string };
    };
  }[];
  months?: { id: number; title: string; slug: string; season?: string | null }[];
  travelExperiences?: { id: number; title: string; slug: string }[];
  days?: JourneyDay[];
  inclusions?: string[];
  exclusions?: string[];
  whyChooseUs?: string[];
  bookingPolicyList?: string[];
  faqs?: { id: number; ques: string; ans: string }[];
  banner?: Banner | null;
  _count?: { days: number };
}

export interface JourneyPayload {
  title: string;
  slug?: string;
  seoDescription: string;
  overView?: string;
  seoKeyword?: string;
  seoTitle?: string;
  h1Title?: string;
  thumbImg?: string;
  moreDescription?: string;
  destination?: string;
  duration?: string;
  noDays: number;
  pricePerPerson?: number;
  discountPrice?: number;
  cityIds: number[];
  monthIds?: number[];
  travelExperienceIds?: number[];
  hotelDetails?: any;
  carDetails?: any;
  guideDetails?: any;
  highlights?: string[];
  isActive?: boolean;
  isBestSelling?: boolean;
  displayOrder?: number;
  days?: { day: string; description: string; image?: string }[];
  inclusions?: string[];
  exclusions?: string[];
  whyChooseUs?: string[];
  bookingPolicy?: string[];
  faqs?: { ques: string; ans: string }[];
  bannerTitle?: string;
  bannerTag?: string;
  bannerImages?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
