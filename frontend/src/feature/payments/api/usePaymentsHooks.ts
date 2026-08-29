import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTravellerPayments, getTravellerPaymentStats, updateTravellerPaymentStatus } from "./paymentsApi";
import { successToast, errorToast } from "@/components/shared/tost";

export const useGetTravellerPayments = () => {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["travellerPayments"], queryFn: getTravellerPayments, staleTime: 2 * 60 * 1000 });
  return { payments: data?.payments || [], summary: data?.summary || {}, isLoading, error, refetch };
};

export const useGetTravellerPaymentStats = () => {
  const { data: stats = {}, isLoading } = useQuery({ queryKey: ["travellerPaymentStats"], queryFn: getTravellerPaymentStats, staleTime: 2 * 60 * 1000 });
  return { stats, isLoading };
};

export const useUpdateTravellerPaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTravellerPaymentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travellerPayments"] });
      queryClient.invalidateQueries({ queryKey: ["travellerPaymentStats"] });
      successToast("Payment status updated successfully");
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to update payment status");
    },
  });
};
