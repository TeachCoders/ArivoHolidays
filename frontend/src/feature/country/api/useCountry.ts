import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCountries,
  getCountryById,
  getCountryBySlug,
  createCountry,
  updateCountry,
  deleteCountry,
  toggleCountryActive,
  updateCountryOrder,
} from ".";
import { successToast, errorToast } from "@/components/shared/tost";
import type { Country } from "../type";

export const useGetCountries = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  id?: number;
}) => {
  const query = useQuery({
    queryKey: ["countries", params],
    queryFn: () => getCountries(params),
    staleTime: 2 * 60 * 1000,
  });
  return {
    countries: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useGetCountryById = (id: number | null) => {
  const query = useQuery({
    queryKey: ["country", id],
    queryFn: () => getCountryById(id!),
    enabled: !!id,
  });
  return {
    country: query.data,
    isLoading: query.isLoading,
  };
};

export const useCountryBySlug = (slug: string, initialData?: Country | null) => {
  const query = useQuery({
    queryKey: ["country-by-slug", slug],
    queryFn: () => getCountryBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    initialData,
  });
  return {
    country: query.data as Country | null,
    isLoading: query.isLoading,
  };
};

export const useCreateCountry = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      successToast("Country created successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to create country");
    },
  });
  return {
    createCountry: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateCountry = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateCountry,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      queryClient.removeQueries({ queryKey: ["country", variables.id] });
      successToast("Country updated successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update country");
    },
  });
  return {
    updateCountry: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useToggleCountryActive = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: toggleCountryActive,
    onSuccess: (res: any, id) => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      queryClient.invalidateQueries({ queryKey: ["country", id] });
      queryClient.invalidateQueries({ queryKey: ["states"] });
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      const a = res?.data?.affected;
      const label = res?.data?.isActive ? "activated" : "deactivated";
      if (a && (a.states > 0 || a.cities > 0 || a.journeys > 0)) {
        successToast(`Country ${label} · ${a.states} states, ${a.cities} cities, ${a.journeys} journeys updated`);
      } else {
        successToast(`Country ${label}`);
      }
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update country status");
    },
  });
  return {
    toggleCountryActive: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateCountryOrder = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateCountryOrder,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      successToast(res?.data?.count ? `Country order updated · ${res.data.count} pinned` : "Country order updated");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update country order");
    },
  });
  return {
    updateCountryOrder: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useDeleteCountry = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteCountry,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      queryClient.invalidateQueries({ queryKey: ["country", id] });
      successToast("Country deleted successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to delete country");
    },
  });
  return {
    deleteCountry: mutation.mutate,
    isPending: mutation.isPending,
  };
};
