"use client";
import React from "react";
import { X, AlertTriangle } from "lucide-react";
import PageLoader from "@/components/shared/PageLoader";
import { ReusableModel } from "@/components/shared/reusableModel";
import { VendorForm } from "@/feature/vendors/components/VendorForm";

interface CancelLeadModalProps {
  cancelModal: any;
  setCancelModal: (v: any) => void;
  cancelReason: string;
  setCancelReason: (v: string) => void;
  cancelCharges: string;
  setCancelCharges: (v: string) => void;
  handleCancel: () => void;
  updatingStatus: boolean;
}

export function CancelLeadModal({
  cancelModal, setCancelModal, cancelReason, setCancelReason,
  cancelCharges, setCancelCharges, handleCancel, updatingStatus,
}: CancelLeadModalProps) {
  if (!cancelModal) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-slate-900">Cancel Assigned Lead</h2>
          <button onClick={() => setCancelModal(null)} className="text-slate-400 hover:text-brand-neutral"><X size={18} /></button>
        </div>
        <p className="text-xs text-brand-neutral-muted mb-4">
          Apply cancellation reason and charges for <span className="font-semibold text-brand-neutral-dark">{cancelModal.name}</span>.
        </p>
        {cancelModal.payments && cancelModal.payments.length > 0 && (
          <div className="flex items-start gap-2 bg-brand-warning-light border border-amber-100 rounded-xl p-3 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-brand-warning">Payment Already Received</p>
              <p className="text-[10px] text-brand-warning mt-0.5">This lead has payment records. You can apply cancellation charges below.</p>
            </div>
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-neutral">Cancellation Reason *</label>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Enter reason for cancellation..." rows={3} className="w-full text-sm border border-brand-neutral-border rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 text-brand-neutral-dark placeholder-slate-400" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-neutral">Cancellation Charges (₹)</label>
            <input type="number" value={cancelCharges} onChange={e => setCancelCharges(e.target.value)} placeholder="0" min="0" className="w-full text-sm border border-brand-neutral-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-brand-neutral-dark placeholder-slate-400 font-bold" />
          </div>
        </div>
        <div className="flex gap-2.5 mt-5">
          <button onClick={() => { setCancelModal(null); setCancelReason(""); setCancelCharges(""); }} className="flex-1 py-2.5 border border-brand-neutral-border rounded-xl text-xs font-semibold text-brand-neutral hover:bg-brand-neutral-light transition-all">
            Back
          </button>
          <button onClick={handleCancel} disabled={updatingStatus || !cancelReason.trim()} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all">
            {updatingStatus && <PageLoader size="inline" />}
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface DeleteLeadModalProps {
  deleteModal: any;
  setDeleteModal: (v: any) => void;
  handleDeleteLead: () => void;
  isPending: boolean;
}

export function DeleteLeadModal({ deleteModal, setDeleteModal, handleDeleteLead, isPending }: DeleteLeadModalProps) {
  if (!deleteModal) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-slate-900">Delete Lead</h2>
          <button onClick={() => setDeleteModal(null)} className="text-slate-400 hover:text-brand-neutral"><X size={18} /></button>
        </div>
        <p className="text-xs text-brand-neutral-muted mb-4">
          Are you sure you want to permanently delete <span className="font-semibold text-brand-neutral-dark">{deleteModal.name}</span>?
          <br />
          <span className="text-brand-danger font-semibold text-[10px]">This action cannot be undone. All related data (notes, bookings, payments, invoices, documents) will be permanently removed.</span>
        </p>
        {deleteModal.payments && deleteModal.payments.length > 0 && (
          <div className="flex items-start gap-2 bg-brand-danger-light border border-red-100 rounded-xl p-3 mb-4">
            <AlertTriangle className="h-4 w-4 text-brand-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-brand-danger">Payment Records Exist</p>
              <p className="text-[10px] text-brand-danger mt-0.5">This lead has {deleteModal.payments.length} payment record(s). They will also be deleted.</p>
            </div>
          </div>
        )}
        <div className="flex gap-2.5 mt-5">
          <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-brand-neutral-border rounded-xl text-xs font-semibold text-brand-neutral hover:bg-brand-neutral-light transition-all">
            Cancel
          </button>
          <button onClick={handleDeleteLead} disabled={isPending} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all">
            {isPending && <PageLoader size="inline" />}
            Permanently Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface UnassignedVendorModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  city: string;
  service: string;
  manualName: string;
}

export function UnassignedVendorModal({ open, onOpenChange, city, service, manualName }: UnassignedVendorModalProps) {
  return (
    <ReusableModel
      open={open}
      onOpenChange={onOpenChange}
      title="Create Vendor"
      description={city && service ? `Add a new ${service} vendor for ${city}` : city ? `Add a new vendor for ${city}` : "Add a new vendor"}
      contentClassName="sm:max-w-[720px]"
    >
      <div className="py-2 max-h-[75vh] overflow-y-auto px-1">
        <VendorForm
          vendorGroupId={null}
          initialData={{
            vendarWorkingAreas: city ? [city] : [],
            vendarServiceType: service === "Hotel" ? "HOTEL_VENDOR" : service === "Car" ? "CAB_OPERATOR" : service === "Guide" ? "GUIDE_VENDOR" : "ALL",
            vendarCompanyName: manualName,
          }}
          onSuccess={() => onOpenChange(false)}
        />
      </div>
    </ReusableModel>
  );
}
