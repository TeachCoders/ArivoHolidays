import apiClient from "@/lib/apiClient";
import type { Journey, JourneyPayload, PaginatedResponse } from "../type";

export async function getJourneys(params?: {
  page?: number;
  limit?: number;
  search?: string;
  cityId?: number;
  stateId?: number;
  countryId?: number;
  route?: string;
  isActive?: string;
}): Promise<PaginatedResponse<Journey>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.cityId) query.set("cityId", String(params.cityId));
  if (params?.stateId) query.set("stateId", String(params.stateId));
  if (params?.countryId) query.set("countryId", String(params.countryId));
  if (params?.route) query.set("route", params.route);
  if (params?.isActive) query.set("isActive", params.isActive);

  const { data } = await apiClient.get(`/journey?${query.toString()}`);
  return data;
}

export async function getJourneyFilters() {
  const { data } = await apiClient.get(`/journey/filters`);
  return data;
}

export async function getJourneyById(id: number) {
  const { data } = await apiClient.get(`/journey/${id}`);
  return data?.data || null;
}

export async function getJourneyBySlug(slug: string) {
  const { data } = await apiClient.get(`/journey/by-slug/${slug}`);
  return data?.data || null;
}

export async function createJourney(payload: JourneyPayload) {
  const { data } = await apiClient.post("/journey", payload);
  return data;
}

export async function updateJourney({ id, payload }: { id: number; payload: Partial<JourneyPayload> }) {
  const { data } = await apiClient.put(`/journey/${id}`, payload);
  return data;
}

export async function deleteJourney(id: number) {
  const { data } = await apiClient.delete(`/journey/${id}`);
  return data;
}

export async function toggleJourneyActive(id: number) {
  const { data } = await apiClient.patch(`/journey/${id}/toggle-active`);
  return data;
}

export async function updateJourneyOrder(ids: number[]) {
  const { data } = await apiClient.post("/journey/order", { ids });
  return data;
}
