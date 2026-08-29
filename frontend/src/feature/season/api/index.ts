import apiClient from "@/lib/apiClient";
import type { Season, SeasonPayload, PaginatedResponse } from "../type";

export async function getSeasons(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}): Promise<PaginatedResponse<Season>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.isActive) query.set("isActive", params.isActive);

  const { data } = await apiClient.get(`/season?${query.toString()}`);
  return data;
}

export async function getSeasonById(id: number) {
  const { data } = await apiClient.get(`/season/${id}`);
  return data?.data || null;
}

export async function createSeason(payload: SeasonPayload) {
  const { data } = await apiClient.post("/season", payload);
  return data;
}

export async function updateSeason({ id, payload }: { id: number; payload: Partial<SeasonPayload> }) {
  const { data } = await apiClient.put(`/season/${id}`, payload);
  return data;
}

export async function deleteSeason(id: number) {
  const { data } = await apiClient.delete(`/season/${id}`);
  return data;
}

export async function toggleSeasonActive(id: number) {
  const { data } = await apiClient.patch(`/season/${id}/toggle-active`);
  return data;
}

export async function updateSeasonOrder(ids: number[]) {
  const { data } = await apiClient.post("/season/order", { ids });
  return data;
}
