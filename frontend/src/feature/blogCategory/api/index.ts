import apiClient from "@/lib/apiClient";
import type { BlogCategory, BlogCategoryPayload, PaginatedResponse } from "../type";

export async function getBlogCategories(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}): Promise<PaginatedResponse<BlogCategory>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.isActive) query.set("isActive", params.isActive);

  const { data } = await apiClient.get(`/blog-category?${query.toString()}`);
  return data;
}

export async function getBlogCategoryById(id: number) {
  const { data } = await apiClient.get(`/blog-category/${id}`);
  return data?.data || null;
}

export async function createBlogCategory(payload: BlogCategoryPayload) {
  const { data } = await apiClient.post("/blog-category", payload);
  return data;
}

export async function updateBlogCategory({ id, payload }: { id: number; payload: Partial<BlogCategoryPayload> }) {
  const { data } = await apiClient.put(`/blog-category/${id}`, payload);
  return data;
}

export async function deleteBlogCategory(id: number) {
  const { data } = await apiClient.delete(`/blog-category/${id}`);
  return data;
}

export async function toggleBlogCategoryActive(id: number) {
  const { data } = await apiClient.patch(`/blog-category/${id}/toggle-active`);
  return data;
}
