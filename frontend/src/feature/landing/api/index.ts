import apiClient from "@/lib/apiClient";

export const getAdLandingPages = async (params?: any) => {
  return await apiClient.get("/ad-landing-pages", { params });
};

export const getAdLandingPageById = async (id: number) => {
  const res = await apiClient.get(`/ad-landing-pages/${id}`);
  return res.data;
};

export const createAdLandingPage = async (data: any) => {
  return await apiClient.post("/ad-landing-pages", data);
};

export const updateAdLandingPage = async (data: any) => {
  return await apiClient.put(`/ad-landing-pages/${data.id}`, data);
};

export const deleteAdLandingPage = async (id: number) => {
  return await apiClient.delete(`/ad-landing-pages/${id}`);
};

export const toggleAdLandingPageActive = async (id: number) => {
  return await apiClient.patch(`/ad-landing-pages/${id}/toggle`);
};
