import apiClient from "@/lib/apiClient";
import type { CmsPage, CmsPagePayload, PaginatedResponse } from "../type";

export async function getCmsPages(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}): Promise<PaginatedResponse<CmsPage>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.isActive) query.set("isActive", params.isActive);

  const { data } = await apiClient.get(`/cms?${query.toString()}`);
  return data;
}

export async function getCmsPageById(id: number) {
  const { data } = await apiClient.get(`/cms/${id}`);
  return data?.data || null;
}

export async function getCmsPageBySlug(slug: string) {
  const { data } = await apiClient.get(`/cms/by-slug/${slug}`);
  return data?.data || null;
}

export async function createCmsPage(payload: CmsPagePayload) {
  const { data } = await apiClient.post("/cms", payload);
  return data;
}

export async function updateCmsPage({ id, payload }: { id: number; payload: Partial<CmsPagePayload> }) {
  const { data } = await apiClient.put(`/cms/${id}`, payload);
  return data;
}

export async function deleteCmsPage(id: number) {
  const { data } = await apiClient.delete(`/cms/${id}`);
  return data;
}

export async function toggleCmsPageActive(id: number) {
  const { data } = await apiClient.patch(`/cms/${id}/toggle-active`);
  return data;
}

export async function updateCmsPageOrder(ids: number[]) {
  const { data } = await apiClient.post("/cms/order", { ids });
  return data;
}
