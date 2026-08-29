import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getVendorGroups, createVendorGroup, updateVendorGroup, deleteVendorGroup,
  getVendors, createVendor, updateVendor, deleteVendor,
  getUnassignedItems, assignVendorToItem,
  getVendorAssignments, getVendorAssignmentStats, getVendorAssignmentSummary, createVendorAssignment, updateVendorAssignment, deleteVendorAssignment,
  getVendorPayments, createVendorPayment, recordVendorPayment, updateVendorPayment,
  getVendorPortalData, getVendorDetailData, sharePaymentEmail,
} from "./vendorApi";
import { successToast, errorToast } from "@/components/shared/tost";

// ── Vendor Group Hooks ──
export const useGetVendorGroups = () => {
  const { data: vendorGroups = [], isLoading, error } = useQuery({ queryKey: ["vendorGroups"], queryFn: getVendorGroups, staleTime: 5 * 60 * 1000 });
  return { vendorGroups, isLoading, error };
};

export const useCreateVendorGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendorGroup,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorGroups"] }); successToast("Vendor Group created successfully"); },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to create Vendor Group"); },
  });
};

export const useUpdateVendorGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVendorGroup,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorGroups"] }); successToast("Vendor Group updated successfully"); },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to update Vendor Group"); },
  });
};

export const useDeleteVendorGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVendorGroup,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorGroups"] }); successToast("Vendor Group deleted successfully"); },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to delete Vendor Group"); },
  });
};

// ── Vendor Hooks ──
export const useGetVendors = () => {
  const { data: vendors = [], isLoading, error } = useQuery({ queryKey: ["vendors"], queryFn: getVendors, staleTime: 5 * 60 * 1000 });
  return { vendors, isLoading, error };
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendors"] }); queryClient.invalidateQueries({ queryKey: ["vendorGroups"] }); successToast("Vendor created successfully"); },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to create Vendor"); },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVendor,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendors"] }); queryClient.invalidateQueries({ queryKey: ["vendorGroups"] }); successToast("Vendor updated successfully"); },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to update Vendor"); },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendors"] }); queryClient.invalidateQueries({ queryKey: ["vendorGroups"] }); successToast("Vendor deleted successfully"); },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to delete Vendor"); },
  });
};

// ── Vendor Assignment Hooks ──
export const useGetVendorAssignments = () => {
  const { data: assignments = [], isLoading, error, refetch } = useQuery({ queryKey: ["vendorAssignments"], queryFn: getVendorAssignments, staleTime: 3 * 60 * 1000 });
  return { assignments, isLoading, error, refetch };
};

export const useGetVendorAssignmentStats = () => {
  const { data: stats = {}, isLoading } = useQuery({ queryKey: ["vendorAssignmentStats"], queryFn: getVendorAssignmentStats, staleTime: 5 * 60 * 1000 });
  return { stats, isLoading };
};

export const useGetVendorAssignmentSummary = () => {
  const { data: summary = {}, isLoading } = useQuery({ queryKey: ["vendorAssignmentSummary"], queryFn: getVendorAssignmentSummary, staleTime: 5 * 60 * 1000 });
  return { summary, isLoading };
};

export const useCreateVendorAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendorAssignment,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorAssignments"] }); queryClient.invalidateQueries({ queryKey: ["vendorAssignmentStats"] }); queryClient.invalidateQueries({ queryKey: ["vendors"] }); queryClient.invalidateQueries({ queryKey: ["leads"] }); queryClient.invalidateQueries({ queryKey: ["myAssignedLeads"] }); successToast("Vendor assigned successfully!"); },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to create assignment"); },
  });
};

export const useUpdateVendorAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVendorAssignment,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorAssignments"] }); queryClient.invalidateQueries({ queryKey: ["leads"] }); queryClient.invalidateQueries({ queryKey: ["myAssignedLeads"] }); successToast("Assignment updated"); },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to update assignment"); },
  });
};

export const useDeleteVendorAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVendorAssignment,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorAssignments"] }); successToast("Assignment deleted"); },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to delete assignment"); },
  });
};

// ── Vendor Payment Hooks ──
export const useGetVendorPayments = () => {
  const { data, isLoading, error } = useQuery({ queryKey: ["vendorPayments"], queryFn: getVendorPayments, staleTime: 2 * 60 * 1000 });
  return { payments: data?.payments || [], summary: data?.summary || {}, isLoading, error };
};

export const useCreateVendorPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendorPayment,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorPayments"] }); successToast("Payment record created"); },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to create payment"); },
  });
};

export const useRecordVendorPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordVendorPayment,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorPayments"] }); queryClient.invalidateQueries({ queryKey: ["vendorAssignmentStats"] }); successToast("Payment recorded successfully!"); },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to record payment"); },
  });
};

export const useUpdateVendorPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVendorPayment,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorPayments"] }); successToast("Payment updated"); },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to update payment"); },
  });
};

// ── Unassigned Items Hooks ──
export const useGetUnassignedItems = () => {
  const { data: unassignedItems = [], isLoading, error, refetch } = useQuery({
    queryKey: ["unassignedItems"],
    queryFn: getUnassignedItems,
    staleTime: 2 * 60 * 1000,
  });
  return { unassignedItems, isLoading, error, refetch };
};

export const useAssignVendorToItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignVendorToItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unassignedItems"] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["myAssignedLeads"] });
      successToast("Vendor assigned to item successfully!");
    },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to assign vendor"); },
  });
};

// ── Vendor Portal Hook ──
export const useGetVendorPortal = (vendorId: number | null) => {
  const { data: portalData, isLoading, error } = useQuery({
    queryKey: ["vendorPortal", vendorId],
    queryFn: () => getVendorPortalData(vendorId!),
    enabled: !!vendorId,
  });
  return { portalData, isLoading, error };
};

// ── Vendor Detail Hook ──
export const useGetVendorDetail = (vendorId: number | null) => {
  const { data: vendorDetail, isLoading, error, refetch } = useQuery({
    queryKey: ["vendorDetail", vendorId],
    queryFn: () => getVendorDetailData(vendorId!),
    enabled: !!vendorId,
  });
  return { vendorDetail, isLoading, error, refetch };
};

export const useSharePaymentEmail = () => {
  return useMutation({
    mutationFn: sharePaymentEmail,
    onSuccess: () => { successToast("Payment history sent via email!"); },
    onError: (error: any) => { errorToast(error?.response?.data?.message || "Failed to send email"); },
  });
};
