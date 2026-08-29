import apiClient from "@/lib/apiClient";
import { RegistrationPayload, TourBookingFormData, CarBookingFormData } from "../type";

export const CreateTravellerLeeds = async (payload: RegistrationPayload) => {
  // Track which page the lead was submitted from (unless caller set it).
  const withSource = {
    ...payload,
    pageReference:
      payload.pageReference ||
      (typeof window !== "undefined" ? window.location.href : "/booking"),
  };
  const res = await apiClient.post('/traveller-lead', withSource);
  return res.data;
};

export const CreateTourBooking = async (payload: TourBookingFormData) => {
  const res = await apiClient.post('/tour-booking', payload);
  return res.data;
};

export const CreateCarBooking = async (payload: CarBookingFormData) => {
  const res = await apiClient.post('/vehicle-booking', payload);
  return res.data;
};

export const FetchAllLeads = async (page = 1, limit = 50, source?: string) => {
  const params: Record<string, string | number> = { page, limit };
  if (source) params.source = source;
  const res = await apiClient.get('/traveller-lead', { params });
  return res.data;
};

export const FetchMyAssignedLeads = async (page = 1, limit = 50, source?: string) => {
  const params: Record<string, string | number> = { page, limit };
  if (source) params.source = source;
  const res = await apiClient.get('/traveller-lead/my-assigned-dashboard', { params });
  return res.data;
};

export const DeleteLead = async (leadId: number) => {
  const res = await apiClient.delete(`/traveller-lead/${leadId}`);
  return res.data;
};

export const AssignLead = async (leadId: number, body: { assignedToUserId: number }) => {
  const res = await apiClient.patch(`/traveller-lead/${leadId}/assign`, body);
  return res.data;
};

export const UpdatePaymentStatus = async (bookingId: string, payload: Record<string, unknown>) => {
  const res = await apiClient.patch(`/booking/${bookingId}/payment-status`, payload);
  return res.data;
};