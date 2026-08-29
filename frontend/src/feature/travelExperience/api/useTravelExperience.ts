import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTravelExperiences,
  getTravelExperienceById,
  getTravelExperienceBySlug,
  createTravelExperience,
  updateTravelExperience,
  deleteTravelExperience,
  toggleTravelExperienceActive,
  updateTravelExperienceOrder,
} from ".";
import { successToast, errorToast } from "@/components/shared/tost";

export const useGetTravelExperiences = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}) => {
  const query = useQuery({
    queryKey: ["travelExperiences", params],
    queryFn: () => getTravelExperiences(params),
    staleTime: 2 * 60 * 1000,
  });
  return {
    travelExperiences: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useGetTravelExperienceById = (id: number | null) => {
  const query = useQuery({
    queryKey: ["travelExperience", id],
    queryFn: () => getTravelExperienceById(id!),
    enabled: !!id,
  });
  return {
    travelExperience: query.data,
    isLoading: query.isLoading,
  };
};

export const useTravelExperienceBySlug = (slug: string, initialData?: any) => {
  const query = useQuery({
    queryKey: ["travelExperience-by-slug", slug],
    queryFn: () => getTravelExperienceBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    initialData,
  });
  return {
    travelExperience: query.data,
    isLoading: query.isLoading,
  };
};

export const useCreateTravelExperience = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createTravelExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travelExperiences"] });
      successToast("Travel experience created successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to create travel experience");
    },
  });
  return {
    createTravelExperience: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateTravelExperience = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateTravelExperience,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["travelExperiences"] });
      queryClient.invalidateQueries({ queryKey: ["travelExperience", variables.id] });
      successToast("Travel experience updated successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update travel experience");
    },
  });
  return {
    updateTravelExperience: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useToggleTravelExperienceActive = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: toggleTravelExperienceActive,
    onSuccess: (res: any, id) => {
      queryClient.invalidateQueries({ queryKey: ["travelExperiences"] });
      queryClient.invalidateQueries({ queryKey: ["travelExperience", id] });
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      const a = res?.data?.affected;
      const label = res?.data?.isActive ? "activated" : "deactivated";
      if (a && a.journeys > 0) {
        successToast(`Travel experience ${label} · ${a.journeys} journeys updated`);
      } else {
        successToast(`Travel experience ${label}`);
      }
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update travel experience status");
    },
  });
  return {
    toggleTravelExperienceActive: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateTravelExperienceOrder = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateTravelExperienceOrder,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["travelExperiences"] });
      successToast(res?.data?.count ? `Travel experience order updated · ${res.data.count} pinned` : "Travel experience order updated");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update travel experience order");
    },
  });
  return {
    updateTravelExperienceOrder: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useDeleteTravelExperience = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteTravelExperience,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["travelExperiences"] });
      queryClient.invalidateQueries({ queryKey: ["travelExperience", id] });
      successToast("Travel experience deleted successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to delete travel experience");
    },
  });
  return {
    deleteTravelExperience: mutation.mutate,
    isPending: mutation.isPending,
  };
};
