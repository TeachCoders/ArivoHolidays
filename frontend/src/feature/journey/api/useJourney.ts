import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getJourneys,
  getJourneyById,
  getJourneyBySlug,
  getJourneyFilters,
  createJourney,
  updateJourney,
  deleteJourney,
  toggleJourneyActive,
  updateJourneyOrder,
} from ".";
import { successToast, errorToast } from "@/components/shared/tost";
import type { Journey, PaginatedResponse } from "../type";

export const useGetJourneys = (
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    cityId?: number;
    stateId?: number;
    countryId?: number;
    route?: string;
    isActive?: string;
  },
  initialData?: PaginatedResponse<Journey> | null,
  options?: { enabled?: boolean }
) => {
  const query = useQuery({
    queryKey: ["journeys", params],
    queryFn: () => getJourneys(params),
    staleTime: 2 * 60 * 1000,
    initialData: initialData ?? undefined,
    enabled: options?.enabled ?? true,
  });
  return {
    journeys: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useJourneyFilters = () => {
  const query = useQuery({
    queryKey: ["journey-filters"],
    queryFn: () => getJourneyFilters(),
    staleTime: 5 * 60 * 1000,
  });
  return {
    cities: (query.data?.data?.cities || []) as {
      id: number;
      title: string;
      slug: string;
      stateTitle: string | null;
    }[],
    experiences: (query.data?.data?.experiences || []) as {
      id: number;
      title: string;
      slug: string;
    }[],
    isLoading: query.isLoading,
  };
};

export const useGetJourneyById = (id: number | null) => {
  const query = useQuery({
    queryKey: ["journey", id],
    queryFn: () => getJourneyById(id!),
    enabled: !!id,
  });
  return {
    journey: query.data,
    isLoading: query.isLoading,
  };
};

export const useJourneyBySlug = (slug: string, initialData?: Journey | null) => {
  const query = useQuery({
    queryKey: ["journey-by-slug", slug],
    queryFn: () => getJourneyBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    initialData,
  });
  return {
    journey: query.data as Journey | null,
    isLoading: query.isLoading,
  };
};

export const useCreateJourney = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createJourney,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      successToast("Journey created successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to create journey");
    },
  });
  return {
    createJourney: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateJourney = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateJourney,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      queryClient.invalidateQueries({ queryKey: ["journey", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["journey-by-slug"] });
      successToast("Journey updated successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update journey");
    },
  });
  return {
    updateJourney: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useToggleJourneyActive = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: toggleJourneyActive,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      queryClient.invalidateQueries({ queryKey: ["journey", id] });
      successToast("Journey status updated");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update journey status");
    },
  });
  return {
    toggleJourneyActive: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateJourneyOrder = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateJourneyOrder,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      successToast(res?.data?.count ? `Journey order updated · ${res.data.count} pinned` : "Journey order updated");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update journey order");
    },
  });
  return {
    updateJourneyOrder: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useDeleteJourney = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteJourney,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      queryClient.invalidateQueries({ queryKey: ["journey", id] });
      successToast("Journey deleted successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to delete journey");
    },
  });
  return {
    deleteJourney: mutation.mutate,
    isPending: mutation.isPending,
  };
};
