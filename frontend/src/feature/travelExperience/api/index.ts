import apiClient from "@/lib/apiClient";
import type { TravelExperience, TravelExperiencePayload, PaginatedResponse } from "../type";

export async function getTravelExperiences(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}): Promise<PaginatedResponse<TravelExperience>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.isActive) query.set("isActive", params.isActive);

  const { data } = await apiClient.get(`/holidays?${query.toString()}`);
  return data;
}

export async function getTravelExperienceById(id: number) {
  const { data } = await apiClient.get(`/holidays/${id}`);
  return data?.data || null;
}

export async function getTravelExperienceBySlug(slug: string) {
  const { data } = await apiClient.get(`/holidays/by-slug/${slug}`);
  return data?.data || null;
}

export async function createTravelExperience(payload: TravelExperiencePayload) {
  const { data } = await apiClient.post("/holidays", payload);
  return data;
}

export async function updateTravelExperience({ id, payload }: { id: number; payload: Partial<TravelExperiencePayload> }) {
  const { data } = await apiClient.put(`/holidays/${id}`, payload);
  return data;
}

export async function deleteTravelExperience(id: number) {
  const { data } = await apiClient.delete(`/holidays/${id}`);
  return data;
}

export async function toggleTravelExperienceActive(id: number) {
  const { data } = await apiClient.patch(`/holidays/${id}/toggle-active`);
  return data;
}

export async function updateTravelExperienceOrder(ids: number[]) {
  const { data } = await apiClient.post("/holidays/order", { ids });
  return data;
}
