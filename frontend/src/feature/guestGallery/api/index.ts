import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { GuestGallery, PaginatedGuestGallery } from "../type";

export const useGuestGallery = (page = 1, limit = 20, isActive?: boolean) => {
  return useQuery<PaginatedGuestGallery>({
    queryKey: ["guestGallery", page, limit, isActive],
    queryFn: async () => {
      let url = `/guest-gallery?page=${page}&limit=${limit}`;
      if (isActive !== undefined) {
        url += `&isActive=${isActive}`;
      }
      const res = await apiClient.get(url);
      return res.data;
    },
  });
};

export const useCreateGuestGallery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<GuestGallery>) => {
      const res = await apiClient.post("/guest-gallery", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guestGallery"] });
    },
  });
};

export const useUpdateGuestGallery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<GuestGallery> }) => {
      const res = await apiClient.put(`/guest-gallery/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guestGallery"] });
    },
  });
};

export const useDeleteGuestGallery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.delete(`/guest-gallery/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guestGallery"] });
    },
  });
};
