import apiClient from "@/lib/apiClient";
import type { BlogPost, BlogPostPayload, PaginatedResponse } from "../type";

export async function getBlogPosts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  category?: string;
}): Promise<PaginatedResponse<BlogPost>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.isActive) query.set("isActive", params.isActive);
  if (params?.category) query.set("category", params.category);

  const { data } = await apiClient.get(`/blog?${query.toString()}`);
  return data;
}

export async function getBlogPostById(id: number) {
  const { data } = await apiClient.get(`/blog/${id}`);
  return data?.data || null;
}

export async function getBlogPostBySlug(slug: string) {
  const { data } = await apiClient.get(`/blog/by-slug/${slug}`);
  return data?.data || null;
}

export async function createBlogPost(payload: BlogPostPayload) {
  const { data } = await apiClient.post("/blog", payload);
  return data;
}

export async function updateBlogPost({ id, payload }: { id: number; payload: Partial<BlogPostPayload> }) {
  const { data } = await apiClient.put(`/blog/${id}`, payload);
  return data;
}

export async function deleteBlogPost(id: number) {
  const { data } = await apiClient.delete(`/blog/${id}`);
  return data;
}

export async function toggleBlogPostActive(id: number) {
  const { data } = await apiClient.patch(`/blog/${id}/toggle-active`);
  return data;
}

export async function updateBlogPostOrder(ids: number[]) {
  const { data } = await apiClient.post("/blog/order", { ids });
  return data;
}
