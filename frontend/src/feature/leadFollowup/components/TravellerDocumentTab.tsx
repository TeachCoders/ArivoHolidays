"use client";
import React, { useState } from "react";
import { FileText, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";
import { FileUpload } from "@/components/shared/fileUpload";
import { useUploadDocumentMutation } from "../api/useLeadFollowup";
import apiClient from "@/lib/apiClient";
import { successToast, errorToast } from "@/components/shared/tost";

interface TravellerDocumentTabProps {
  lead: any;
}

export default function TravellerDocumentTab({ lead }: TravellerDocumentTabProps) {
  const [openSection, setOpenSection] = useState<string | null>("passport");

  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [govtidFile, setGovtidFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState<Record<string, boolean>>({});

  const document = lead?.document || {};

  const uploadMutation = useUploadDocumentMutation();

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleUpload = async (type: string, file: File | null) => {
    if (!file) return;

    setUploading((p) => ({ ...p, [type]: true }));
    setSuccess((p) => ({ ...p, [type]: false }));

    try {
      const formData = new FormData();
      formData.append("folder", "documents");
      formData.append("file", file);
      const uploadRes = await apiClient.post("/upload", formData);
      const url = uploadRes.data?.url || uploadRes.data?.data?.url;

      if (!url) throw new Error("Upload failed — no URL returned");

      const payload = { documentType: type, url };
      uploadMutation.mutate(
        { leadId: lead.id, payload },
        {
          onSuccess: () => {
            setSuccess((p) => ({ ...p, [type]: true }));
            if (type === "passport") setPassportFile(null);
            if (type === "govtid") setGovtidFile(null);
            successToast("Document uploaded successfully!");
          },
        }
      );
    } catch (err) {
      console.error("Upload error:", err);
      errorToast("Upload failed. Please try again.");
    } finally {
      setUploading((p) => ({ ...p, [type]: false }));
    }
  };

  const renderAccordionItem = (
    id: string,
    title: string,
    url: string | null | undefined,
    fileState: File | null,
    setFileState: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const isOpen = openSection === id;
    const isUploading = uploading[id];
    const isSuccess = success[id];

    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mb-3" key={id}>
        <button
          onClick={() => toggleSection(id)}
          className={`w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 transition-colors focus:outline-none ${isOpen ? "border-b border-slate-100" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${url ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                {url ? "Document uploaded" : "No document uploaded yet"}
              </p>
            </div>
          </div>
          {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </button>

        {isOpen && (
          <div className="p-5 bg-slate-50/50">
            {isSuccess && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-semibold">
                <CheckCircle className="h-4 w-4" /> Uploaded successfully!
              </div>
            )}

            {url && (
              <div className="space-y-3 mb-4">
                <div className="aspect-[4/3] w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                  <img src={url} alt={title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-lg">
                      View Full Size
                    </a>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-500">Replace document:</p>
              </div>
            )}

            <div className="space-y-3">
              <FileUpload
                title={url ? `Replace ${title}` : `Upload ${title}`}
                subtitle="Click to select (Max 5MB)"
                file={fileState}
                setFile={setFileState}
                name={id}
              />
              {fileState && (
                <button
                  onClick={() => handleUpload(id, fileState)}
                  disabled={isUploading}
                  className="btn-primary w-full sm:w-auto px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60"
                >
                   {isUploading && <PageLoader size="inline" />}
                  {isUploading ? "Uploading..." : "Upload Document"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">Traveller Documents</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage identity documents for the traveller.
        </p>
      </div>

      <div className="space-y-1">
        {renderAccordionItem("passport", "Passport", document.passportUrl, passportFile, setPassportFile)}
        {renderAccordionItem("govtid", "Government ID (Aadhar/PAN)", document.govtIdUrl, govtidFile, setGovtidFile)}
      </div>
    </div>
  );
}
