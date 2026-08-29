// api.ts
import apiClient from "../../lib/apiClient";

export async function getTravellerLead(id: string) {
  const { data } = await apiClient.get(`/traveller-lead/${id}`);
  return data;
}

export async function getLeadNotes(leadId: string) {
  const { data } = await apiClient.get(`/traveller-lead/${leadId}/notes`);
  return data;
}

export async function addFollowupNote(
  leadId: string | number,
  payload: { note: string; channel: string }
) {
  const { data } = await apiClient.post(
    `/traveller-lead/${leadId}/notes`,
    payload
  );
  return data;
}

export async function deleteLeadNote(
  leadId: string,
  noteId: string
) {
  const { data } = await apiClient.delete(
    `/traveller-lead/${leadId}/notes/${noteId}`
  );
  return data;
}

export async function updateLeadStatus({
  leadId,
  status,
  cancellationReason,
}: {
  leadId: number | string;
  status: string;
  cancellationReason?: string;
}) {
  const { data } = await apiClient.patch(
    `/traveller-lead/${leadId}/status`,
    {
      status,
      cancellationReason,
    }
  );

  return data;
}

/* -------------------------------------------------------------------------- */
/*                         Tour Package Builder APIs                          */
/* -------------------------------------------------------------------------- */

export async function getPackageBuilder(leadId: string | number) {
  const { data } = await apiClient.get(
    `/package-builder/lead/${leadId}`
  );
  return data;
}

export async function savePackageBuilder(
  leadId: string | number,
  payload: any
) {
  const { data } = await apiClient.post(
    `/package-builder/lead/${leadId}`,
    payload
  );
  return data;
}

export async function deletePackageBuilder(id: string | number) {
  const { data } = await apiClient.delete(
    `/package-builder/${id}`
  );
  return data;
}

export async function sendInvoiceEmail(
  leadId: string | number,
  payload: any
) {
  const { data } = await apiClient.post(
    `/package-builder/lead/${leadId}/send-invoice`,
    payload,
    { timeout: 30000 }
  );
  return data;
}

export async function markInvoiceSent(id: string | number) {
  const { data } = await apiClient.post(
    `/package-builder/${id}/mark-sent`
  );
  return data;
}

export async function generatePdfUrl(
  leadId: string | number,
  payload: any
): Promise<{ success: boolean; url: string }> {
  const { data } = await apiClient.post(
    `/package-builder/lead/${leadId}/generate-pdf`,
    payload,
    { timeout: 30000 }
  );
  return data;
}

/* -------------------------------------------------------------------------- */

export async function uploadDocument(
  leadId: string | number,
  payload: { documentType: string; url: string; amount?: number; paymentDate?: string }
) {
  const { data } = await apiClient.patch(
    `/traveller-lead/${leadId}/documents`,
    payload
  );
  return data;
}

export async function sendRequirementsEmail(leadId: string | number) {
  const { data } = await apiClient.post(
    `/traveller-lead/${leadId}/requirements/send-email`
  );
  return data;
}

export async function markRequirementsSent(leadId: string | number) {
  const { data } = await apiClient.post(
    `/traveller-lead/${leadId}/requirements/mark-sent`
  );
  return data;
}

export async function saveRequirements(
  leadId: string | number,
  payload: {
    serviceType?: string;
    cityNames?: string;
    tourTypes?: string[];
    startDate?: string;
    endDate?: string;
    adults?: number;
    children?: number;
    budget?: number;
    needGuide?: boolean;
    pickupLocation?: string;
    dropLocation?: string;
    travelTime?: string;
    vehiclePreference?: string;
    specialRequirements?: string;
  }
) {
  const { data } = await apiClient.post(
    `/traveller-lead/${leadId}/requirements`,
    payload
  );

  return data;
}