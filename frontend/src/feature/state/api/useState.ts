import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStates,
  getStateById,
  getStateBySlug,
  createState,
  updateState,
  deleteState,
  toggleStateActive,
  updateStateOrder,
} from ".";
import { successToast, errorToast } from "@/components/shared/tost";
import type { State, PaginatedResponse } from "../type";

export const useGetStates = (
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    countryId?: number | string;
    stateId?: number | string;
    cityId?: number | string;
    isActive?: string;
  },
  initialData?: PaginatedResponse<State> | null
) => {
  const query = useQuery({
    queryKey: ["states", params],
    queryFn: () => getStates(params),
    staleTime: 2 * 60 * 1000,
    initialData: initialData ?? undefined,
  });
  return {
    states: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useGetStateById = (id: number | null) => {
  const query = useQuery({
    queryKey: ["state", id],
    queryFn: () => getStateById(id!),
    enabled: !!id,
  });
  return {
    state: query.data,
    isLoading: query.isLoading,
  };
};

export const useStateBySlug = (slug: string, initialData?: State | null) => {
  const query = useQuery({
    queryKey: ["state-by-slug", slug],
    queryFn: () => getStateBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    initialData,
  });
  return {
    state: query.data as State | null,
    isLoading: query.isLoading,
  };
};

export const useCreateState = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createState,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      successToast("State created successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to create state");
    },
  });
  return {
    createState: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateState = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateState,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      queryClient.removeQueries({ queryKey: ["state", variables.id] });
      successToast("State updated successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update state");
    },
  });
  return {
    updateState: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useToggleStateActive = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: toggleStateActive,
    onSuccess: (res: any, id) => {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      queryClient.invalidateQueries({ queryKey: ["state", id] });
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      const a = res?.data?.affected;
      const label = res?.data?.isActive ? "activated" : "deactivated";
      if (a && (a.cities > 0 || a.journeys > 0)) {
        successToast(`State ${label} · ${a.cities} cities, ${a.journeys} journeys updated`);
      } else {
        successToast(`State ${label}`);
      }
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update state status");
    },
  });
  return {
    toggleStateActive: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateStateOrder = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateStateOrder,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      
      successToast(res?.data?.count ? `State order updated · ${res.data.count} pinned` : "State order updated");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update state order");
    },
  });
  return {
    updateStateOrder: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useDeleteState = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteState,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      queryClient.invalidateQueries({ queryKey: ["state", id] });
      successToast("State deleted successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to delete state");
    },
  });
  return {
    deleteState: mutation.mutate,
    isPending: mutation.isPending,
  };
};
