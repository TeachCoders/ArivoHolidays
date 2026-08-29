import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreateTravellerLeeds, CreateTourBooking, CreateCarBooking, FetchAllLeads, FetchMyAssignedLeads, DeleteLead, AssignLead, UpdatePaymentStatus } from ".";
import { ContactFormData, TourBookingFormData, CarBookingFormData } from "../type";
import { updateLeadStatus } from "@/feature/leadFollowup/api";

export const useMyAssignedLeads = (page = 1, limit = 50, source?: string) => {
  const query = useQuery({
    queryKey: ["myAssignedLeads", page, limit, source],
    queryFn: () => FetchMyAssignedLeads(page, limit, source),
    staleTime: 2 * 60 * 1000,
  });

  return {
    stats: query.data?.stats || {},
    leads: query.data?.data || [],
    pagination: query.data?.pagination || { page: 1, limit: 50, totalPages: 0, totalCount: 0 },
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};


export const useTravellerLead = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, ContactFormData>({
    mutationFn: CreateTravellerLeeds,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["myAssignedLeads"] });
    },
  });

  return {
    createNewTravellerLead: mutation.mutate,
    isLoading: mutation.isPending,
  };
};



export const useCarBooking = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, CarBookingFormData>({
    mutationFn: CreateCarBooking,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["myAssignedLeads"] });
    },
  });

  return {
    createNewCarBooking: mutation.mutate,
    isLoading: mutation.isPending,
  };
};



export const useTourBooking = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, TourBookingFormData>({
    mutationFn: CreateTourBooking,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["myAssignedLeads"] });
    },
  });

  return {
    createNewTourBooking: mutation.mutate,
    isLoading: mutation.isPending,
  };
};

export const useFetchAllLeads = (enabled = true, page = 1, limit = 50, source?: string) => {
  const query = useQuery({
    queryKey: ["leads", page, limit, source],
    queryFn: () => FetchAllLeads(page, limit, source),
    staleTime: 2 * 60 * 1000,
    enabled,
  });

  return {
    leads: query.data?.data || [],
    pagination: query.data?.pagination || { page: 1, limit: 50, totalPages: 0, totalCount: 0 },
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useUpdateLeadStatusMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      status,
      cancellationReason,
    }: {
      leadId: number | string;
      status: string;
      cancellationReason?: string;
    }) => updateLeadStatus({ leadId, status, cancellationReason }),

    onSuccess: (_, variables) => {
      // Refresh the full list
      qc.invalidateQueries({ queryKey: ["leads"] });
      // Also refresh the individual lead detail if it's open
      qc.invalidateQueries({ queryKey: ["travellerLead", String(variables.leadId)] });
    },

    onError: (error) => {
      console.error("Failed to update lead status:", error);
    },
  });
};

export const useDeleteLeadMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (leadId: number) => DeleteLead(leadId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myAssignedLeads"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error: any) => {
      console.error("Failed to delete lead:", error);
    },
  });
};

export const useAssignLead = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, { leadId: number; assignedToUserId: number }>({
    mutationFn: ({ leadId, assignedToUserId }) => AssignLead(leadId, { assignedToUserId }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["myAssignedLeads"] });
    },
  });

  return {
    assignLead: mutation.mutate,
    isLoading: mutation.isPending,
  };
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ bookingId, ...payload }: { bookingId: string; payment_status: string }) =>
      UpdatePaymentStatus(bookingId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  return {
    updatePaymentStatus: mutation.mutate,
    isLoading: mutation.isPending,
  };
};

export const useFetchChatLeads = (page = 1, limit = 200) => {
  return useFetchAllLeads(true, page, limit, "chat");
};