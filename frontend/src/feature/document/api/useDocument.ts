"use client";
import apiClient from "@/lib/apiClient";

export interface DocumentPayload {
  passport_url?: string;
  govt_id_url?: string;
  payment_screenshot_url?: string;
}

export interface DocumentResponse {
  success: boolean;
  data: unknown;
}

export const useDocument = () => {
  const uploadDocuments = async (
    leadId: string,
    payload: DocumentPayload
  ): Promise<DocumentResponse> => {
    const { data } = await apiClient.patch<DocumentResponse>(
      `/traveller-lead/${leadId}/documents`,
      payload
    );
    return data;
  };

  const uploadSingleDocument = async (
    leadId: string,
    documentType: "passport" | "govtid" | "paymentslip",
    url: string
  ): Promise<DocumentResponse> => {
    const { data } = await apiClient.patch<DocumentResponse>(
      `/traveller-lead/${leadId}/documents`,
      { documentType, url }
    );
    return data;
  };

  return { uploadDocuments, uploadSingleDocument };
};
