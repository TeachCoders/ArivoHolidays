"use client";
import { useState } from "react";
import { Save, Plus, Car, Send, CheckCircle2 } from "lucide-react";
import { useGetPackageBuilder, useSavePackageBuilderMutation, useSendInvoiceEmailMutation } from "../api/useLeadFollowup";
import { useGetVendors } from "@/feature/vendors/api/useVendorHooks";
import { successToast, errorToast } from "@/components/shared/tost";
import WhatsAppShareBtn from "@/components/shared/whatsAppShareBtn";
import PageLoader from "@/components/shared/PageLoader";

interface Props {
  leadId: string;
  leadStatus: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  vehicleBooking: any;
  lead: any;
}

export default function CarQuotationSection({ leadId, leadStatus, clientName, clientEmail, clientPhone, vehicleBooking, lead }: Props) {
  const { data: pkgData, isLoading: pkgLoading } = useGetPackageBuilder(leadId);
  const { mutate: savePackage, isPending: saving } = useSavePackageBuilderMutation();
  const { mutate: sendEmail, isPending: sending } = useSendInvoiceEmailMutation();
  const { vendors = [] } = useGetVendors();

  const existingInvoice = pkgData?.data;
  const [editing, setEditing] = useState(!existingInvoice);

  const [packageName, setPackageName] = useState(existingInvoice?.packageName || `${vehicleBooking?.vehicleName || "Car"} Booking`);
  const [grandTotal, setGrandTotal] = useState(existingInvoice?.grandTotal?.toString() || "");
  const [advanceAmount, setAdvanceAmount] = useState(existingInvoice?.advanceAmount?.toString() || "");
  const [balanceTerms, setBalanceTerms] = useState(existingInvoice?.balanceTerms || "");
  const [notes, setNotes] = useState(existingInvoice?.notes || "");

  const [vendorId, setVendorId] = useState<number | undefined>(existingInvoice?.vendorId || vehicleBooking?.vendorAssignment?.vendorId || undefined);
  const [vendorPrice, setVendorPrice] = useState(existingInvoice?.vendorPrice?.toString() || "");
  const [vendorNotes, setVendorNotes] = useState(existingInvoice?.vendorNotes || "");

  const carVendors = vendors.filter((v: any) =>
    v.vendarServiceType === "CAB_OPERATOR" || v.vendarServiceType === "TRANSPORT_VENDOR" || v.vendarServiceType === "ALL"
  );

  const handleSave = () => {
    if (!grandTotal || Number(grandTotal) <= 0) {
      errorToast("Please enter quotation amount");
      return;
    }
    const payload = {
      packageName,
      grandTotal: Number(grandTotal),
      advanceAmount: Number(advanceAmount) || 0,
      balanceTerms,
      notes,
      vendorId: vendorId || null,
      vendorPrice: Number(vendorPrice) || 0,
      vendorNotes,
      items: [{
        location: "Car Service",
        ServiceName: vehicleBooking?.vehicleName || "Car",
        ServcieQty: 1,
        UnitPrice: Number(grandTotal),
        TotalPrice: Number(grandTotal),
        carName: vehicleBooking?.vehicleName || "",
        carType: "",
        vendorId: vendorId || undefined,
      }],
      status: "DRAFT",
    };
    savePackage({ leadId, payload }, {
      onSuccess: () => {
        successToast("Quotation saved!");
        setEditing(false);
      },
      onError: () => errorToast("Failed to save quotation. Please try again."),
    });
  };

  const handleSendEmail = () => {
    if (!existingInvoice?.id) {
      errorToast("Save quotation first");
      return;
    }
    sendEmail({ leadId, payload: { invoiceId: existingInvoice.id, clientEmail } }, {
      onSuccess: () => successToast("Invoice emailed!"),
      onError: () => errorToast("Failed to send email. Please try again."),
    });
  };

  if (pkgLoading) {
    return <PageLoader size="section" />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-brand-info" />
          <h2 className="text-sm font-black uppercase tracking-widest text-brand-neutral-dark">Car Quotation</h2>
          {existingInvoice && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${existingInvoice.status === "SENT" ? "bg-brand-success-light text-brand-success" : "bg-brand-warning-light text-brand-warning"}`}>
              {existingInvoice.status}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {existingInvoice && !editing && (
            <>
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-brand-neutral-border text-brand-neutral hover:bg-brand-neutral-light">
                Edit
              </button>
              <WhatsAppShareBtn phone={clientPhone} message={`Hi ${clientName}, here is your car booking quotation for ${vehicleBooking?.vehicleName || "your vehicle"}.`} />
              <button onClick={handleSendEmail} disabled={sending} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                {sending ? <PageLoader size="inline" /> : <Send className="h-3 w-3" />} Email
              </button>
            </>
          )}
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="bg-brand-info-light border border-blue-200 rounded-xl p-4">
        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">Vehicle Details</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <span className="text-[10px] font-semibold text-brand-neutral-muted">Vehicle</span>
            <p className="text-sm font-bold text-brand-neutral-dark">{vehicleBooking?.vehicleName || "N/A"}</p>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-brand-neutral-muted">Service Type</span>
            <p className="text-sm font-bold text-brand-neutral-dark">{vehicleBooking?.serviceType || "N/A"}</p>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-brand-neutral-muted">Message</span>
            <p className="text-sm font-bold text-brand-neutral-dark line-clamp-2">{vehicleBooking?.travellerMessage || "N/A"}</p>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-brand-neutral-muted">Customer</span>
            <p className="text-sm font-bold text-brand-neutral-dark">{clientName}</p>
          </div>
        </div>
      </div>

      {/* Quotation Form */}
      {editing ? (
        <div className="bg-white border border-brand-neutral-border rounded-xl p-5 space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quotation Details</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">Package Name</label>
              <input value={packageName} onChange={(e) => setPackageName(e.target.value)}
                className="w-full bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-sm text-brand-neutral-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">
                Quotation Amount (₹)<span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input type="number" value={grandTotal} onChange={(e) => setGrandTotal(e.target.value)} placeholder="0"
                className="w-full bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-sm text-brand-neutral-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">Advance Amount (₹)</label>
              <input type="number" value={advanceAmount} onChange={(e) => setAdvanceAmount(e.target.value)} placeholder="0"
                className="w-full bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-sm text-brand-neutral-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">Balance Terms</label>
              <input value={balanceTerms} onChange={(e) => setBalanceTerms(e.target.value)} placeholder="e.g. Before departure"
                className="w-full bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-sm text-brand-neutral-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Additional notes..."
              className="w-full bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-sm text-brand-neutral-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 resize-none" />
          </div>

          {/* Vendor Assignment */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Vendor Assignment (Optional)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">Select Vendor</label>
                <select value={vendorId || ""} onChange={(e) => setVendorId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-sm text-brand-neutral-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 appearance-none">
                  <option value="">No vendor</option>
                  {carVendors.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.vendarCompanyName || v.vendarName} ({v.vendarServiceType})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">Vendor Price (₹)</label>
                <input type="number" value={vendorPrice} onChange={(e) => setVendorPrice(e.target.value)} placeholder="0"
                  className="w-full bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-sm text-brand-neutral-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1.5">Vendor Notes</label>
                <input value={vendorNotes} onChange={(e) => setVendorNotes(e.target.value)} placeholder="Notes for vendor"
                  className="w-full bg-brand-neutral-light border border-brand-neutral-border rounded-lg px-4 py-3 text-sm text-brand-neutral-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
              {saving ? <PageLoader size="inline" /> : <Save className="h-4 w-4" />} Save Quotation
            </button>
            {existingInvoice && (
              <button onClick={() => setEditing(false)} className="px-5 py-2.5 border border-brand-neutral-border rounded-xl text-sm font-semibold text-brand-neutral hover:bg-brand-neutral-light">
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : existingInvoice ? (
        <div className="bg-white border border-brand-neutral-border rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] font-semibold text-brand-neutral-muted">Package</span>
              <p className="text-sm font-bold text-brand-neutral-dark">{existingInvoice.packageName}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-brand-neutral-muted">Amount</span>
              <p className="text-sm font-bold text-brand-success">₹{existingInvoice.grandTotal?.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-brand-neutral-muted">Advance</span>
              <p className="text-sm font-bold text-brand-neutral-dark">₹{existingInvoice.advanceAmount?.toLocaleString() || 0}</p>
            </div>
            {existingInvoice.vendorId && (
              <div>
                <span className="text-[10px] font-semibold text-brand-neutral-muted">Vendor Price</span>
                <p className="text-sm font-bold text-brand-info">₹{existingInvoice.vendorPrice?.toLocaleString() || 0}</p>
              </div>
            )}
          </div>
          {existingInvoice.balanceTerms && (
            <p className="text-xs text-brand-neutral-muted"><span className="font-semibold">Balance Terms:</span> {existingInvoice.balanceTerms}</p>
          )}
          {existingInvoice.notes && (
            <p className="text-xs text-brand-neutral-muted"><span className="font-semibold">Notes:</span> {existingInvoice.notes}</p>
          )}
          {existingInvoice.vendorNotes && (
            <p className="text-xs text-brand-info"><span className="font-semibold">Vendor Notes:</span> {existingInvoice.vendorNotes}</p>
          )}
        </div>
      ) : (
        <div className="bg-brand-neutral-light border border-dashed border-slate-300 rounded-xl p-8 text-center">
          <Car className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-brand-neutral-muted">No quotation created yet</p>
          <p className="text-xs text-slate-400 mt-1">Create a quotation to send pricing to the customer</p>
          <button onClick={() => setEditing(true)} className="btn-primary mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold mx-auto">
            <Plus className="h-4 w-4" /> Create Quotation
          </button>
        </div>
      )}
    </div>
  );
}
