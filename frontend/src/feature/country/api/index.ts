import apiClient from "@/lib/apiClient";
import type { Country, CountryPayload, PaginatedResponse } from "../type";

export async function getCountries(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  id?: number;
}): Promise<PaginatedResponse<Country>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.isActive) query.set("isActive", params.isActive);
  if (params?.id) query.set("id", String(params.id));

  const { data } = await apiClient.get(`/country?${query.toString()}`);
  return data;
}

export async function getCountryById(id: number) {
  const { data } = await apiClient.get(`/country/${id}`);
  return data?.data || null;
}

export async function getCountryBySlug(slug: string) {
  const { data } = await apiClient.get(`/country/by-slug/${slug}`);
  return data?.data || null;
}

export async function createCountry(payload: CountryPayload) {
  const { data } = await apiClient.post("/country", payload);
  return data;
}

export async function updateCountry({ id, payload }: { id: number; payload: Partial<CountryPayload> }) {
  const { data } = await apiClient.put(`/country/${id}`, payload);
  return data;
}

export async function deleteCountry(id: number) {
  const { data } = await apiClient.delete(`/country/${id}`);
  return data;
}

export async function toggleCountryActive(id: number) {
  const { data } = await apiClient.patch(`/country/${id}/toggle-active`);
  return data;
}

export async function updateCountryOrder(ids: number[]) {
  const { data } = await apiClient.post("/country/order", { ids });
  return data;
}
