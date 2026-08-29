import apiClient from "@/lib/apiClient";

export type DashboardStats = {
  // Leads
  totalLeads: number;
  leadsThisMonth: number;
  leadsToday: number;
  confirmedLeads: number;
  ongoingLeads: number;
  cancelledLeads: number;
  pendingLeads: number;
  // Pipeline Breakdown
  chatTotal: number;
  chatConfirmed: number;
  chatOngoing: number;
  chatCancelled: number;
  chatPending: number;
  websiteTotal: number;
  websiteConfirmed: number;
  websiteOngoing: number;
  websiteCancelled: number;
  websitePending: number;
  // Chat
  activeChats: number;
  unansweredFaqs: number;
  // Content
  totalJourneys: number;
  activeJourneys: number;
  totalPackages: number;
  activePackages: number;
  totalBlogPosts: number;
  activeBlogPosts: number;
  totalCmsPages: number;
  activeCmsPages: number;
  // Geo
  totalCountries: number;
  totalStates: number;
  totalCities: number;
  // People
  totalTeams: number;
  totalUsers: number;
  totalVendors: number;
  // Operations Breakdown
  totalTourBookings: number;
  tourTotal: number;
  tourCompleted: number;
  tourOngoing: number;
  tourPending: number;
  tourCancelled: number;
  vehicleTotal: number;
  vehicleCompleted: number;
  vehicleOngoing: number;
  vehiclePending: number;
  vehicleCancelled: number;
  paymentTotal: number;
  paymentCompleted: number;
  paymentOngoing: number;
  paymentPending: number;
  paymentCancelled: number;
  // Travel
  totalTravelExperiences: number;
  totalSeasons: number;
};

export type RecentLead = {
  id: number;
  travellerId: string;
  name: string;
  phone: string;
  country: string;
  destination: string | null;
  travelDate: string | null;
  bookingStatus: string;
  createdAt: string;
  assignedTo: { name: string } | null;
};

export type RecentChat = {
  id: number;
  touristName: string;
  phone: string;
  status: string;
  botState: string;
  createdAt: string;
  lastMessageAt: string | null;
};

export type RecentJourney = {
  id: number;
  title: string;
  isActive: boolean;
  createdAt: string;
};

export type RecentBlogPost = {
  id: number;
  title: string;
  isActive: boolean;
  createdAt: string;
};

export type DashboardResponse = {
  success: boolean;
  stats: DashboardStats;
  recentLeads: RecentLead[];
  recentChats: RecentChat[];
  recentJourneys: RecentJourney[];
  recentBlogPosts: RecentBlogPost[];
};

export const fetchDashboardStats = async () => {
  const res = await apiClient.get<DashboardResponse>("/dashboard/stats");
  return res.data;
};
