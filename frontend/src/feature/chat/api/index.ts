import apiClient from "@/lib/apiClient";

export type ChatMessage = {
  id: number;
  conversationId: number;
  channel: string;
  direction: "in" | "out";
  body: string;
  buttons?: { label: string; value: string }[];
  createdAt: string;
};

export type ChatConversationSummary = {
  id: number;
  touristName: string;
  phone: string;
  travellerId: number | null;
  travellerCode: string | null;
  destination: string | null;
  status: string;
  lastMessageAt: string | null;
  lastMessage: { direction: string; createdAt: string } | null;
  unread: number;
  assignedTo: { id: number; name: string } | null;
};

export type ChatConversationDetail = {
  id: number;
  token: string;
  touristName: string;
  phone: string;
  travellerId: number | null;
  status: string;
  botState: string;
  needsData: Record<string, unknown> | null;
  lastMessageAt: string | null;
  messages: ChatMessage[];
};

// ── Public (website widget) ──
export type GeoInfo = {
  countryCode: string;
  countryName: string;
  ip: string;
};

export const fetchGeo = async () => {
  const res = await apiClient.get("/chat/geo");
  return res.data;
};

export const startChat = async (payload: {
  name: string;
  phone: string;
  pageUrl?: string;
  country?: string;
  countryId?: string;
}) => {
  const res = await apiClient.post("/chat/start", payload);
  return res.data;
};

export const sendChatMessage = async (token: string, body: string, label?: string) => {
  const payload = label ? { body, label } : { body };
  const res = await apiClient.post(`/chat/${token}/messages`, payload);
  return res.data;
};

export const pollChatMessages = async (token: string, since: number) => {
  const res = await apiClient.get(`/chat/${token}/messages`, { params: { since } });
  return res.data;
};

// ── Dashboard inbox ──
export const fetchConversations = async () => {
  const res = await apiClient.get("/chat/conversations");
  return res.data;
};

export const fetchConversation = async (id: number) => {
  const res = await apiClient.get(`/chat/conversations/${id}`);
  return res.data;
};

export const replyToConversation = async (id: number, body: string) => {
  const res = await apiClient.post(`/chat/conversations/${id}/reply`, { body });
  return res.data;
};

export const fetchAvailability = async () => {
  const res = await apiClient.get("/chat/availability");
  return res.data;
};

export const updateAvailability = async (available: boolean) => {
  const res = await apiClient.patch("/chat/availability", { available });
  return res.data;
};

// ── Bot training (FAQ + unanswered) ──
export type FaqLinkType =
  | "travelExperience"
  | "journey"
  | "country"
  | "state"
  | "city"
  | "season"
  | "tourPackage"
  | "blog"
  | "custom";

export const LINK_TYPE_OPTIONS: { value: FaqLinkType | ""; label: string }[] = [
  { value: "", label: "No link" },
  { value: "travelExperience", label: "Travel Experience" },
  { value: "journey", label: "Trip / Journey" },
  { value: "country", label: "Country" },
  { value: "state", label: "State" },
  { value: "city", label: "City" },
  { value: "season", label: "Season / Month" },
  { value: "tourPackage", label: "Tour Package" },
  { value: "blog", label: "Blog Post" },
  { value: "custom", label: "Custom URL" },
];

export type LinkCandidate = {
  id: number;
  title: string;
  slug: string;
  url: string;
  subtitle: string;
};

export type ChatFaq = {
  id: number;
  question: string;
  keywords: string[];
  answer: string;
  linkType: FaqLinkType | null;
  linkEntityId: number | null;
  linkTitle: string | null;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ChatUnanswered = {
  id: number;
  question: string;
  raw: string;
  count: number;
  status: string;
  source: string;
  destination: string | null;
  answeredFaqId: number | null;
  createdAt: string;
  updatedAt: string;
  answeredFaq: { id: number; answer: string } | null;
};

export const fetchFaqs = async () => {
  const res = await apiClient.get("/chat/faqs");
  return res.data;
};

export const createFaq = async (payload: {
  question: string;
  answer: string;
  keywords?: string[];
  linkType?: FaqLinkType | null;
  linkEntityId?: number | null;
  linkTitle?: string | null;
  linkUrl?: string | null;
}) => {
  const res = await apiClient.post("/chat/faqs", payload);
  return res.data;
};

export const updateFaq = async (
  id: number,
  payload: Partial<{
    question: string;
    answer: string;
    keywords: string[];
    isActive: boolean;
    sortOrder: number;
    linkType: FaqLinkType | null;
    linkEntityId: number | null;
    linkTitle: string | null;
    linkUrl: string | null;
  }>
) => {
  const res = await apiClient.patch(`/chat/faqs/${id}`, payload);
  return res.data;
};

export const deleteFaq = async (id: number) => {
  const res = await apiClient.delete(`/chat/faqs/${id}`);
  return res.data;
};

export const reorderFaqs = async (orderedIds: number[]) => {
  const res = await apiClient.post("/chat/faqs/reorder", { orderedIds });
  return res.data;
};

export type ReplyButton = { label: string; value: string };

export type FaqPreview = {
  text: string;
  buttons: ReplyButton[];
};

export const fetchFaqPreview = async (id: number) => {
  const res = await apiClient.get(`/chat/faqs/${id}/preview`);
  return res.data;
};

export const fetchLinkCandidates = async (type: FaqLinkType, search = "") => {
  const res = await apiClient.get("/chat/link-candidates", { params: { type, search } });
  return res.data;
};

export const fetchUnanswered = async (status = "open") => {
  const res = await apiClient.get("/chat/unanswered", { params: { status } });
  return res.data;
};

export const answerUnanswered = async (
  id: number,
  payload: {
    answer: string;
    linkType?: FaqLinkType | null;
    linkEntityId?: number | null;
    linkTitle?: string | null;
    linkUrl?: string | null;
  }
) => {
  const res = await apiClient.post(`/chat/unanswered/${id}/answer`, payload);
  return res.data;
};

export const deleteUnanswered = async (id: number) => {
  const res = await apiClient.delete(`/chat/unanswered/${id}`);
  return res.data;
};

// ── Conversation status (close / reopen) ──
export const closeConversation = async (id: number, status: "ACTIVE" | "CLOSED" | "ARCHIVED") => {
  const res = await apiClient.patch(`/chat/conversations/${id}/status`, { status });
  return res.data;
};

export const closeConversationByToken = async (token: string, status: "ACTIVE" | "CLOSED" | "ARCHIVED") => {
  const res = await apiClient.patch(`/chat/conversations/by-token/${token}/status`, { status });
  return res.data;
};
