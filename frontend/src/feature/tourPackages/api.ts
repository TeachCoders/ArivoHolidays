import apiClient from "../../lib/apiClient";

// ── PUBLIC APIs (no auth) ──
export async function getPublicPackages() {
  const { data } = await apiClient.get("/tour-packages");
  return data;
}

export async function getPublicPackageBySlug(slug: string) {
  const { data } = await apiClient.get(`/tour-packages/by-slug/${slug}`);
  return data;
}

// ── ADMIN APIs ──
export async function getAllPackages() {
  const { data } = await apiClient.get("/tour-packages");
  return data;
}

export async function getPackageById(id: number) {
  const { data } = await apiClient.get(`/tour-packages/${id}`);
  return data;
}

export async function createPackage(payload: any) {
  const { data } = await apiClient.post("/tour-packages", payload);
  return data;
}

export async function updatePackage(id: number, payload: any) {
  const { data } = await apiClient.put(`/tour-packages/${id}`, payload);
  return data;
}

export async function deletePackage(id: number) {
  const { data } = await apiClient.delete(`/tour-packages/${id}`);
  return data;
}

export async function toggleBestSelling(id: number) {
  const { data } = await apiClient.patch(`/tour-packages/${id}/toggle-best`);
  return data;
}

export async function incrementPurchaseCount(id: number) {
  const { data } = await apiClient.patch(`/tour-packages/${id}/purchase`);
  return data;
}

export async function uploadBannerImage(id: number, file: File, index?: number) {
  const formData = new FormData();
  formData.append("file", file);
  if (index !== undefined) formData.append("index", String(index));
  const { data } = await apiClient.post(`/tour-packages/${id}/banner`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
