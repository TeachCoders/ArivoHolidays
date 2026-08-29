import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCmsPages,
  getCmsPageById,
  getCmsPageBySlug,
  createCmsPage,
  updateCmsPage,
  deleteCmsPage,
  toggleCmsPageActive,
  updateCmsPageOrder,
} from ".";
import { successToast, errorToast } from "@/components/shared/tost";

export const useGetCmsPages = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}) => {
  const query = useQuery({
    queryKey: ["cmsPages", params],
    queryFn: () => getCmsPages(params),
    staleTime: 2 * 60 * 1000,
  });
  return {
    cmsPages: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useGetCmsPageById = (id: number | null) => {
  const query = useQuery({
    queryKey: ["cmsPage", id],
    queryFn: () => getCmsPageById(id!),
    enabled: !!id,
  });
  return {
    cmsPage: query.data,
    isLoading: query.isLoading,
  };
};

export const useCmsPageBySlug = (slug: string) => {
  const query = useQuery({
    queryKey: ["cmsPage-by-slug", slug],
    queryFn: () => getCmsPageBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
  return {
    cmsPage: query.data,
    isLoading: query.isLoading,
  };
};

export const useCreateCmsPage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createCmsPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsPages"] });
      successToast("Page created successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to create page");
    },
  });
  return {
    createCmsPage: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateCmsPage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateCmsPage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cmsPages"] });
      queryClient.invalidateQueries({ queryKey: ["cmsPage", variables.id] });
      successToast("Page updated successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update page");
    },
  });
  return {
    updateCmsPage: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useToggleCmsPageActive = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: toggleCmsPageActive,
    onSuccess: (_res: any, id) => {
      queryClient.invalidateQueries({ queryKey: ["cmsPages"] });
      queryClient.invalidateQueries({ queryKey: ["cmsPage", id] });
      successToast("Page status updated");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update page status");
    },
  });
  return {
    toggleCmsPageActive: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateCmsPageOrder = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateCmsPageOrder,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["cmsPages"] });
      successToast(res?.data?.count ? `Page order updated · ${res.data.count} pinned` : "Page order updated");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update page order");
    },
  });
  return {
    updateCmsPageOrder: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useDeleteCmsPage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteCmsPage,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["cmsPages"] });
      queryClient.invalidateQueries({ queryKey: ["cmsPage", id] });
      successToast("Page deleted successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to delete page");
    },
  });
  return {
    deleteCmsPage: mutation.mutate,
    isPending: mutation.isPending,
  };
};
