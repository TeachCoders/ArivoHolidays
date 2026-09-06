import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdLandingPages,
  getAdLandingPageById,
  createAdLandingPage,
  updateAdLandingPage,
  deleteAdLandingPage,
  toggleAdLandingPageActive,
} from ".";
import { successToast, errorToast } from "@/components/shared/tost";

export const useGetAdLandingPages = (params?: any) => {
  const query = useQuery({
    queryKey: ["adLandingPages", params],
    queryFn: () => getAdLandingPages(params),
  });
  return {
    pages: query.data?.data?.data || [],
    pagination: query.data?.data?.pagination,
    isLoading: query.isLoading,
  };
};

export const useGetAdLandingPageById = (id: number | null) => {
  const query = useQuery({
    queryKey: ["adLandingPage", id],
    queryFn: () => getAdLandingPageById(id!),
    enabled: !!id,
  });
  return {
    page: query.data?.data || query.data,
    isLoading: query.isLoading,
  };
};

export const useCreateAdLandingPage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createAdLandingPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adLandingPages"] });
      successToast("Ad Landing Page created successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to create page");
    },
  });
  return {
    createAdLandingPage: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

export const useUpdateAdLandingPage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateAdLandingPage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adLandingPages"] });
      queryClient.invalidateQueries({ queryKey: ["adLandingPage", variables.id] });
      successToast("Ad Landing Page updated successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update page");
    },
  });
  return {
    updateAdLandingPage: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

export const useDeleteAdLandingPage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteAdLandingPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adLandingPages"] });
      successToast("Page deleted successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to delete page");
    },
  });
  return {
    deleteAdLandingPage: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useToggleAdLandingPageActive = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: toggleAdLandingPageActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adLandingPages"] });
      successToast("Status updated successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update status");
    },
  });
  return {
    toggleAdLandingPageActive: mutation.mutate,
    isPending: mutation.isPending,
  };
};
