import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  getAllPackages, createPackage, updatePackage, deletePackage,
  toggleBestSelling, uploadBannerImage, getPublicPackages, getPublicPackageBySlug
} from "../api";

// ── PUBLIC ──
export const useGetPublicPackages = () => {
  return useQuery({
    queryKey: ["tour-packages-public"],
    queryFn: getPublicPackages,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetPublicPackageBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["tour-package-public", slug],
    queryFn: () => getPublicPackageBySlug(slug),
    enabled: !!slug,
  });
};

// ── ADMIN ──
export const useGetAllPackages = () => {
  return useQuery({
    queryKey: ["tour-packages-admin"],
    queryFn: getAllPackages,
  });
};

export const useCreatePackageMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => createPackage(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tour-packages-admin"] });
    },
  });
};

export const useUpdatePackageMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => updatePackage(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tour-packages-admin"] });
    },
  });
};

export const useDeletePackageMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePackage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tour-packages-admin"] });
    },
  });
};

export const useToggleBestSellingMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => toggleBestSelling(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tour-packages-admin"] });
    },
  });
};

export const useUploadBannerMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file, index }: { id: number; file: File; index?: number }) => uploadBannerImage(id, file, index),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tour-packages-admin"] });
    },
  });
};
