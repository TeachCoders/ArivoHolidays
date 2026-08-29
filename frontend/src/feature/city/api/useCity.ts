import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCities,
  getCityById,
  getCityBySlug,
  createCity,
  updateCity,
  deleteCity,
  toggleCityActive,
  updateCityOrder,
} from ".";
import { successToast, errorToast } from "@/components/shared/tost";
import type { City, PaginatedResponse } from "../type";

export const useGetCities = (
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    countryId?: number | string;
    stateId?: number | string;
    isActive?: string;
  },
  initialData?: PaginatedResponse<City> | null
) => {
  const query = useQuery({
    queryKey: ["cities", params],
    queryFn: () => getCities(params),
    staleTime: 2 * 60 * 1000,
    initialData: initialData ?? undefined,
  });
  return {
    cities: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useGetCityById = (id: number | null) => {
  const query = useQuery({
    queryKey: ["city", id],
    queryFn: () => getCityById(id!),
    enabled: !!id,
  });
  return {
    city: query.data,
    isLoading: query.isLoading,
  };
};

export const useCityBySlug = (slug: string, initialData?: City | null) => {
  const query = useQuery({
    queryKey: ["city-by-slug", slug],
    queryFn: () => getCityBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    initialData,
  });
  return {
    city: query.data as City | null,
    isLoading: query.isLoading,
  };
};
export const useCreateCity = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      successToast("City created successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to create city");
    },
  });
  return {
    createCity: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateCity = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateCity,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      queryClient.removeQueries({ queryKey: ["city", variables.id] });
      successToast("City updated successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update city");
    },
  });
  return {
    updateCity: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useToggleCityActive = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: toggleCityActive,
    onSuccess: (res: any, id) => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      queryClient.invalidateQueries({ queryKey: ["city", id] });
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      const a = res?.data?.affected;
      const label = res?.data?.isActive ? "activated" : "deactivated";
      if (a && a.journeys > 0) {
        successToast(`City ${label} · ${a.journeys} journeys updated`);
      } else {
        successToast(`City ${label}`);
      }
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update city status");
    },
  });
  return {
    toggleCityActive: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateCityOrder = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateCityOrder,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      successToast(res?.data?.count ? `City order updated · ${res.data.count} pinned` : "City order updated");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update city order");
    },
  });
  return {
    updateCityOrder: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useDeleteCity = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteCity,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      queryClient.invalidateQueries({ queryKey: ["city", id] });
      successToast("City deleted successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to delete city");
    },
  });
  return {
    deleteCity: mutation.mutate,
    isPending: mutation.isPending,
  };
};
