import apiClient from "@/lib/apiClient";
import type { State, StatePayload, PaginatedResponse } from "../type";

export async function getStates(params?: {
  page?: number;
  limit?: number;
  search?: string;
  countryId?: number | string;
  stateId?: number | string;
  cityId?: number | string;
  isActive?: string;
}): Promise<PaginatedResponse<State>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.countryId) query.set("countryId", String(params.countryId));
  if (params?.stateId) query.set("stateId", String(params.stateId));
  if (params?.cityId) query.set("cityId", String(params.cityId));
  if (params?.isActive) query.set("isActive", params.isActive);

  const { data } = await apiClient.get(`/state?${query.toString()}`);
  return data;
}

export async function getStateById(id: number) {
  const { data } = await apiClient.get(`/state/${id}`);
  return data?.data || null;
}

export async function getStateBySlug(slug: string) {
  const { data } = await apiClient.get(`/state/by-slug/${slug}`);
  return data?.data || null;
}

export async function createState(payload: StatePayload) {
  const { data } = await apiClient.post("/state", payload);
  return data;
}

export async function updateState({ id, payload }: { id: number; payload: Partial<StatePayload> }) {
  const { data } = await apiClient.put(`/state/${id}`, payload);
  return data;
}

export async function deleteState(id: number) {
  const { data } = await apiClient.delete(`/state/${id}`);
  return data;
}

export async function toggleStateActive(id: number) {
  const { data } = await apiClient.patch(`/state/${id}/toggle-active`);
  return data;
}

export async function updateStateOrder(ids: number[]) {
  const { data } = await apiClient.post("/state/order", { ids });
  return data;
}
