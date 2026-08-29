import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBlogCategories,
  getBlogCategoryById,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  toggleBlogCategoryActive,
} from ".";
import { successToast, errorToast } from "@/components/shared/tost";

export const useGetBlogCategories = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}) => {
  const query = useQuery({
    queryKey: ["blogCategories", params],
    queryFn: () => getBlogCategories(params),
    staleTime: 2 * 60 * 1000,
  });
  return {
    blogCategories: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useGetBlogCategoryById = (id: number | null) => {
  const query = useQuery({
    queryKey: ["blogCategory", id],
    queryFn: () => getBlogCategoryById(id!),
    enabled: !!id,
  });
  return {
    blogCategory: query.data,
    isLoading: query.isLoading,
  };
};

export const useCreateBlogCategory = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createBlogCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogCategories"] });
      successToast("Blog category created successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to create blog category");
    },
  });
  return {
    createBlogCategory: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateBlogCategory = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateBlogCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blogCategories"] });
      queryClient.invalidateQueries({ queryKey: ["blogCategory", variables.id] });
      successToast("Blog category updated successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update blog category");
    },
  });
  return {
    updateBlogCategory: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useToggleBlogCategoryActive = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: toggleBlogCategoryActive,
    onSuccess: (_res: any, id) => {
      queryClient.invalidateQueries({ queryKey: ["blogCategories"] });
      queryClient.invalidateQueries({ queryKey: ["blogCategory", id] });
      successToast("Blog category status updated");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update blog category status");
    },
  });
  return {
    toggleBlogCategoryActive: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useDeleteBlogCategory = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteBlogCategory,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["blogCategories"] });
      queryClient.invalidateQueries({ queryKey: ["blogCategory", id] });
      successToast("Blog category deleted successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to delete blog category");
    },
  });
  return {
    deleteBlogCategory: mutation.mutate,
    isPending: mutation.isPending,
  };
};
