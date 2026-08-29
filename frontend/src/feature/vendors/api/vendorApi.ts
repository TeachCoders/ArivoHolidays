import apiClient from "@/lib/apiClient";

// Vendor Group APIs
export async function getVendorGroups() {
  const { data } = await apiClient.get(`/vendor-group`);
  return data?.data || [];
}

export async function createVendorGroup(payload: any) {
  const { data } = await apiClient.post(`/vendor-group`, payload);
  return data;
}

export async function updateVendorGroup({ id, payload }: { id: number; payload: any }) {
  const { data } = await apiClient.put(`/vendor-group/${id}`, payload);
  return data;
}

export async function deleteVendorGroup(id: number) {
  const { data } = await apiClient.delete(`/vendor-group/${id}`);
  return data;
}

// Vendor APIs
export async function getVendors() {
  const { data } = await apiClient.get(`/vender`);
  return data?.data || [];
}

export async function createVendor(payload: any) {
  const { data } = await apiClient.post(`/vender`, payload);
  return data;
}

export async function updateVendor({ id, payload }: { id: number; payload: any }) {
  const { data } = await apiClient.put(`/vender/${id}`, payload);
  return data;
}

export async function deleteVendor(id: number) {
  const { data } = await apiClient.delete(`/vender/${id}`);
  return data;
}

// Unassigned Items APIs
export async function getUnassignedItems() {
  const { data } = await apiClient.get(`/vender/unassigned-items`);
  return data?.data || [];
}

export async function assignVendorToItem(payload: { itemId: number; vendorId: number }) {
  const { data } = await apiClient.patch(`/vender/assign-to-item`, payload);
  return data;
}

// Vendor Assignment APIs
export async function getVendorAssignments() {
  const { data } = await apiClient.get(`/vendor-assignment`);
  return data?.data || [];
}

export async function getVendorAssignmentStats() {
  const { data } = await apiClient.get(`/vendor-assignment/stats`);
  return data?.data || {};
}

export async function getVendorAssignmentSummary() {
  const { data } = await apiClient.get(`/vendor-assignment/summary`);
  return data?.data || {};
}

export async function createVendorAssignment(payload: any) {
  const { data } = await apiClient.post(`/vendor-assignment`, payload);
  return data;
}

export async function updateVendorAssignment({ id, payload }: { id: number; payload: any }) {
  const { data } = await apiClient.put(`/vendor-assignment/${id}`, payload);
  return data;
}

export async function deleteVendorAssignment(id: number) {
  const { data } = await apiClient.delete(`/vendor-assignment/${id}`);
  return data;
}

// Vendor Payment APIs
export async function getVendorPayments() {
  const { data } = await apiClient.get(`/vendor-payment`);
  return { payments: data?.data || [], summary: data?.summary || {} };
}

export async function createVendorPayment(payload: any) {
  const { data } = await apiClient.post(`/vendor-payment`, payload);
  return data;
}

export async function recordVendorPayment({ id, payload }: { id: number; payload: any }) {
  const { data } = await apiClient.post(`/vendor-payment/${id}/record`, payload);
  return data;
}

export async function updateVendorPayment({ id, payload }: { id: number; payload: any }) {
  const { data } = await apiClient.put(`/vendor-payment/${id}`, payload);
  return data;
}

export async function sharePaymentEmail(payload: { vendorId: number; email: string }) {
  const { data } = await apiClient.post(`/vendor-payment/share-email`, payload);
  return data;
}

// Vendor Portal API
export async function getVendorPortalData(vendorId: number) {
  const { data } = await apiClient.get(`/vender/portal/${vendorId}`);
  return data?.data || null;
}

export async function getVendorDetailData(vendorId: number) {
  const { data } = await apiClient.get(`/vender/detail/${vendorId}`);
  return data?.data || null;
}
