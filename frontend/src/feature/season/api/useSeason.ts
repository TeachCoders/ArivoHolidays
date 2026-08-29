import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSeasons,
  getSeasonById,
  createSeason,
  updateSeason,
  deleteSeason,
  toggleSeasonActive,
  updateSeasonOrder,
} from ".";
import { successToast, errorToast } from "@/components/shared/tost";

export const useGetSeasons = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}) => {
  const query = useQuery({
    queryKey: ["seasons", params],
    queryFn: () => getSeasons(params),
    staleTime: 2 * 60 * 1000,
  });
  return {
    seasons: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useGetSeasonById = (id: number | null) => {
  const query = useQuery({
    queryKey: ["season", id],
    queryFn: () => getSeasonById(id!),
    enabled: !!id,
  });
  return {
    season: query.data,
    isLoading: query.isLoading,
  };
};

export const useCreateSeason = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createSeason,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
      successToast("Season created successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to create season");
    },
  });
  return {
    createSeason: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateSeason = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateSeason,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
      queryClient.invalidateQueries({ queryKey: ["season", variables.id] });
      successToast("Season updated successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update season");
    },
  });
  return {
    updateSeason: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useToggleSeasonActive = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: toggleSeasonActive,
    onSuccess: (res: any, id) => {
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
      queryClient.invalidateQueries({ queryKey: ["season", id] });
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      const a = res?.data?.affected;
      const label = res?.data?.isActive ? "activated" : "deactivated";
      if (a && a.journeys > 0) {
        successToast(`Season ${label} · ${a.journeys} journeys updated`);
      } else {
        successToast(`Season ${label}`);
      }
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update season status");
    },
  });
  return {
    toggleSeasonActive: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateSeasonOrder = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateSeasonOrder,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
      successToast(res?.data?.count ? `Season order updated · ${res.data.count} pinned` : "Season order updated");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update season order");
    },
  });
  return {
    updateSeasonOrder: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useDeleteSeason = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteSeason,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["seasons"] });
      queryClient.invalidateQueries({ queryKey: ["season", id] });
      successToast("Season deleted successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to delete season");
    },
  });
  return {
    deleteSeason: mutation.mutate,
    isPending: mutation.isPending,
  };
};
