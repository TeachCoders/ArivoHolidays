import apiClient from "@/lib/apiClient";
import type { City, CityPayload, PaginatedResponse } from "../type";

export async function getCities(params?: {
  page?: number;
  limit?: number;
  search?: string;
  countryId?: number | string;
  stateId?: number | string;
  isActive?: string;
}): Promise<PaginatedResponse<City>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.countryId) query.set("countryId", String(params.countryId));
  if (params?.stateId) query.set("stateId", String(params.stateId));
  if (params?.isActive) query.set("isActive", params.isActive);

  const { data } = await apiClient.get(`/city?${query.toString()}`);
  return data;
}

export async function getCityById(id: number) {
  const { data } = await apiClient.get(`/city/${id}`);
  return data?.data || null;
}

export async function getCityBySlug(slug: string) {
  const { data } = await apiClient.get(`/city/by-slug/${slug}`);
  return data?.data || null;
}

export async function createCity(payload: CityPayload) {
  const { data } = await apiClient.post("/city", payload);
  return data;
}

export async function updateCity({ id, payload }: { id: number; payload: Partial<CityPayload> }) {
  const { data } = await apiClient.put(`/city/${id}`, payload);
  return data;
}

export async function deleteCity(id: number) {
  const { data } = await apiClient.delete(`/city/${id}`);
  return data;
}

export async function toggleCityActive(id: number) {
  const { data } = await apiClient.patch(`/city/${id}/toggle-active`);
  return data;
}

export async function updateCityOrder(ids: number[]) {
  const { data } = await apiClient.post("/city/order", { ids });
  return data;
}
