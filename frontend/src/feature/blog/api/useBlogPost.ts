import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBlogPosts,
  getBlogPostById,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  toggleBlogPostActive,
  updateBlogPostOrder,
} from ".";
import { successToast, errorToast } from "@/components/shared/tost";

export const useGetBlogPosts = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  category?: string;
}) => {
  const query = useQuery({
    queryKey: ["blogPosts", params],
    queryFn: () => getBlogPosts(params),
    staleTime: 2 * 60 * 1000,
  });
  return {
    blogPosts: query.data?.data || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useGetBlogPostById = (id: number | null) => {
  const query = useQuery({
    queryKey: ["blogPost", id],
    queryFn: () => getBlogPostById(id!),
    enabled: !!id,
  });
  return {
    blogPost: query.data,
    isLoading: query.isLoading,
  };
};

export const useBlogPostBySlug = (slug: string) => {
  const query = useQuery({
    queryKey: ["blogPost-by-slug", slug],
    queryFn: () => getBlogPostBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
  return {
    blogPost: query.data,
    isLoading: query.isLoading,
  };
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      successToast("Blog post created successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to create blog post");
    },
  });
  return {
    createBlogPost: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateBlogPost,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      queryClient.invalidateQueries({ queryKey: ["blogPost", variables.id] });
      successToast("Blog post updated successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update blog post");
    },
  });
  return {
    updateBlogPost: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useToggleBlogPostActive = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: toggleBlogPostActive,
    onSuccess: (_res: any, id) => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      queryClient.invalidateQueries({ queryKey: ["blogPost", id] });
      successToast("Blog post status updated");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update blog post status");
    },
  });
  return {
    toggleBlogPostActive: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useUpdateBlogPostOrder = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateBlogPostOrder,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      successToast(res?.data?.count ? `Blog post order updated · ${res.data.count} pinned` : "Blog post order updated");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update blog post order");
    },
  });
  return {
    updateBlogPostOrder: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      queryClient.invalidateQueries({ queryKey: ["blogPost", id] });
      successToast("Blog post deleted successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to delete blog post");
    },
  });
  return {
    deleteBlogPost: mutation.mutate,
    isPending: mutation.isPending,
  };
};
