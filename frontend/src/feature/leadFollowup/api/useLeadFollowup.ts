// hooks.ts
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { addFollowupNote, updateLeadStatus, getTravellerLead, getPackageBuilder, savePackageBuilder, deletePackageBuilder, sendInvoiceEmail, markInvoiceSent, uploadDocument, saveRequirements, sendRequirementsEmail, markRequirementsSent } from "../api";
import { successToast, errorToast } from "@/components/shared/tost";

// ------- Fetch a single traveller lead -------
export const useGetTravellerLead = (id: string) => {
  const query = useQuery<any, Error>({
    queryKey: ["travellerLead", id],
    queryFn: () => getTravellerLead(id),
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });

  return {
    lead: query.data?.data ?? null,  // adjust based on your API response shape
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

// ------- Add a follow‑up note -------
export const useAddFollowupNoteMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, note, channel }: { leadId: string | number; note: string; channel: string }) =>
      addFollowupNote(leadId, { note, channel }),
    onSuccess: (_, variables) => {
      // Refresh both the list and the specific lead's detail
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["travellerLead", String(variables.leadId)] });
    },
  });
};

// ------- Update lead status -------
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

    onSuccess: async (_, variables) => {
      // ✅ Directly fetch fresh data and push into cache
      const fresh = await getTravellerLead(String(variables.leadId));
      qc.setQueryData(["travellerLead", String(variables.leadId)], fresh);

      // ✅ Also update leads list
      qc.invalidateQueries({ queryKey: ["leads"] });
    },

    onError: (error) => {
      console.error("Failed to update lead status:", error);
    },
  });

};

// ------- Fetch Package -------
export const useGetPackageBuilder = (leadId: string) => {
  return useQuery({
    queryKey: ["package-builder", leadId],
    queryFn: () => getPackageBuilder(leadId),
    enabled: !!leadId,
  });
};

// ------- Save Package -------
export const useSavePackageBuilderMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      payload,
    }: {
      leadId: string | number;
      payload: any;
    }) => savePackageBuilder(leadId, payload),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["package-builder", String(variables.leadId)],
      });
    },
  });
};

// ------- Delete Package (Super Admin only) -------
export const useDeletePackageBuilderMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      leadId,
    }: {
      id: string | number;
      leadId: string | number;
    }) => deletePackageBuilder(id),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["package-builder", String(variables.leadId)],
      });
    },
  });
};

// ------- Send Invoice Email -------
export const useSendInvoiceEmailMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      payload,
    }: {
      leadId: string | number;
      payload: any;
    }) => sendInvoiceEmail(leadId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["package-builder", String(variables.leadId)],
      });
      qc.invalidateQueries({
        queryKey: ["travellerLead", String(variables.leadId)],
      });
    },
  });
};

export function useMarkInvoiceSentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, leadId }: { id: string | number; leadId: string | number }) =>
      markInvoiceSent(id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["package-builder", String(variables.leadId)],
      });
      qc.invalidateQueries({
        queryKey: ["travellerLead", String(variables.leadId)],
      });
    },
  });
}

// ------- Upload Document -------
export const useUploadDocumentMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, payload }: { leadId: string | number; payload: { documentType: string; url: string; amount?: number } }) =>
      uploadDocument(leadId, payload),
    onSuccess: async (_, variables) => {
      // ✅ Directly fetch fresh data and push into cache
      const fresh = await getTravellerLead(String(variables.leadId));
      qc.setQueryData(["travellerLead", String(variables.leadId)], fresh);
    },
    onError: (error) => {
      console.error("Failed to upload document:", error);
    },
  });
};

// ------- Save Traveller Requirements -------
export const useSendRequirementsEmailMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId }: { leadId: string | number }) =>
      sendRequirementsEmail(leadId),
    onSuccess: async (_, variables) => {
      successToast("Requirements email sent!");
      const fresh = await getTravellerLead(String(variables.leadId));
      qc.setQueryData(["travellerLead", String(variables.leadId)], fresh);
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Failed to send email");
    },
  });
};

export const useMarkRequirementsSentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId }: { leadId: string | number }) =>
      markRequirementsSent(leadId),
    onSuccess: async (_, variables) => {
      const fresh = await getTravellerLead(String(variables.leadId));
      qc.setQueryData(["travellerLead", String(variables.leadId)], fresh);
    },
  });
};

export const useSaveRequirementsMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, payload }: { leadId: string | number; payload: Parameters<typeof saveRequirements>[1] }) =>
      saveRequirements(leadId, payload),
    onSuccess: async (_, variables) => {
      // Refresh lead data so form shows updated values
      const fresh = await getTravellerLead(String(variables.leadId));
      qc.setQueryData(["travellerLead", String(variables.leadId)], fresh);
    },
    onError: (error) => {
      console.error("Failed to save requirements:", error);
    },
  });
};
