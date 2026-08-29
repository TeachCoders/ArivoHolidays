import apiClient from "@/lib/apiClient";

export async function getTravellerPayments() {
  const { data } = await apiClient.get("/traveller-payment");
  return { payments: data?.data || [], summary: data?.summary || {} };
}

export async function getTravellerPaymentStats() {
  const { data } = await apiClient.get("/traveller-payment/stats");
  return data?.data || {};
}

export async function updateTravellerPaymentStatus({ id, payload }: { id: number, payload: any }) {
  const { data } = await apiClient.patch(`/traveller-payment/${id}/status`, payload);
  return data;
}
