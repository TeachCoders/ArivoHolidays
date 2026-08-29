"use client";

import React, { useState } from "react";
import { useGetVendorPayments } from "@/feature/vendors/api/useVendorHooks";
import { ReusableModel } from "@/components/shared/reusableModel";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { IndianRupee, TrendingUp, Clock, PlusCircle, ChevronDown, ChevronRight, CreditCard, Landmark, Wallet, FileText } from "lucide-react";
import FormActionButton from "@/components/shared/customBtns";
import { useGetVendors } from "@/feature/vendors/api/useVendorHooks";
import { useCreateVendorPayment } from "@/feature/vendors/api/useVendorHooks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageLoader from "@/components/shared/PageLoader";

const statusConfig: Record<string, { label: string; className: string }> = {
  PAID: { label: "Paid", className: "bg-brand-success-light text-brand-success" },
  PARTIAL: { label: "Partial", className: "bg-brand-info-light text-brand-info" },
  PENDING: { label: "Pending", className: "bg-brand-warning-light text-brand-warning" },
  OVERDUE: { label: "Overdue", className: "bg-brand-danger-light text-brand-danger" },
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  UPI: <Wallet size={12} />,
  BANK_TRANSFER: <Landmark size={12} />,
  CASH: <CreditCard size={12} />,
  CHEQUE: <FileText size={12} />,
};

const METHOD_LABELS: Record<string, string> = {
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Cash",
  CHEQUE: "Cheque",
};

export function PaymentTrackingTab() {
  const { payments, summary, isLoading } = useGetVendorPayments();
  const { vendors } = useGetVendors();
  const { mutate: createPayment, isPending: isCreating } = useCreateVendorPayment();
  const [recordTarget, setRecordTarget] = useState<any>(null);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [expandedPaymentId, setExpandedPaymentId] = useState<number | null>(null);
  const [newPaymentForm, setNewPaymentForm] = useState({
    vendorId: "", assignmentId: "", invoiceNo: "", amount: "", paymentType: "SERVICE_FEE",
    paymentMethod: "UPI", dueDate: "", remarks: "",
  });

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    createPayment({
      ...newPaymentForm,
      vendorId: Number(newPaymentForm.vendorId),
      assignmentId: newPaymentForm.assignmentId ? Number(newPaymentForm.assignmentId) : undefined,
      amount: Number(newPaymentForm.amount),
    }, {
      onSuccess: () => {
        setIsNewPaymentOpen(false);
        setNewPaymentForm({ vendorId: "", assignmentId: "", invoiceNo: "", amount: "", paymentType: "SERVICE_FEE", paymentMethod: "UPI", dueDate: "", remarks: "" });
      }
    });
  };

  if (isLoading) return <PageLoader size="section" text="Loading payment data..." />;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Payable", value: summary.totalPayable || 0, icon: IndianRupee, color: "from-slate-500 to-slate-600" },
          { label: "Total Received", value: summary.totalReceived || 0, icon: TrendingUp, color: "from-emerald-500 to-green-600" },
          { label: "Overall Pending", value: summary.totalPending || 0, icon: Clock, color: "from-orange-500 to-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium opacity-90">{label}</p>
              <div className="bg-white/20 p-2 rounded-lg"><Icon size={18} /></div>
            </div>
            <p className="text-2xl font-bold">₹{Number(value).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Table Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Payment Records</h3>
        <ReusableModel
          open={isNewPaymentOpen}
          onOpenChange={setIsNewPaymentOpen}
          title="Add Payment Record"
          description="Create a new payment record for a vendor."
          contentClassName="sm:max-w-[520px]"
          trigger={
            <button
              onClick={() => setIsNewPaymentOpen(true)}
              className="btn-primary flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition"
            >
              <PlusCircle size={15} />
              Add Record
            </button>
          }
        >
          <form onSubmit={handleCreatePayment} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-brand-neutral">Vendor</Label>
              <select required value={newPaymentForm.vendorId} onChange={(e) => setNewPaymentForm((p) => ({ ...p, vendorId: e.target.value }))} className="flex h-10 w-full rounded-lg border border-brand-neutral-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">-- Select Vendor --</option>
                {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.vendarCompanyName ? `${v.vendarCompanyName} (${v.vendarName})` : v.vendarName}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-brand-neutral">Invoice No.</Label>
                <Input placeholder="INV-001" value={newPaymentForm.invoiceNo} onChange={(e) => setNewPaymentForm((p) => ({ ...p, invoiceNo: e.target.value }))} className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-brand-neutral">Total Amount (₹)</Label>
                <Input required type="number" min="1" placeholder="0" value={newPaymentForm.amount} onChange={(e) => setNewPaymentForm((p) => ({ ...p, amount: e.target.value }))} className="rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-brand-neutral">Payment Type</Label>
                <select value={newPaymentForm.paymentType} onChange={(e) => setNewPaymentForm((p) => ({ ...p, paymentType: e.target.value }))} className="flex h-10 w-full rounded-lg border border-brand-neutral-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="SERVICE_FEE">Service Fee</option>
                  <option value="COMMISSION">Commission</option>
                  <option value="FULL_PACKAGE">Full Package</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-brand-neutral">Due Date</Label>
                <Input type="date" value={newPaymentForm.dueDate} onChange={(e) => setNewPaymentForm((p) => ({ ...p, dueDate: e.target.value }))} className="rounded-lg" />
              </div>
            </div>
            <div className="pt-2">
              <FormActionButton text={isCreating ? "Creating..." : "Create Record"} type="submit" isLoading={isCreating} fullWidth size="md" />
            </div>
          </form>
        </ReusableModel>
      </div>

      {/* Payments Table */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-neutral-border p-12 text-center shadow-sm">
          <div className="text-4xl mb-3">💰</div>
          <h3 className="font-semibold text-gray-900">No Payment Records Yet</h3>
          <p className="text-brand-neutral-muted text-sm mt-1">Add a payment record to start tracking vendor payments.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-neutral-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr className="bg-brand-neutral-light border-b border-brand-neutral-border">
                  {["", "Vendor", "Invoice", "Linked Trip", "Services", "Total", "Paid", "Pending", "Progress", "Due Date", "Status", "Action"].map((h) => (
                    <th key={h} className="tbl-th whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-neutral-light">
                {payments.map((p: any) => {
                  const pct = p.amount > 0 ? Math.min(100, (p.paidAmount / p.amount) * 100) : 0;
                  const cfg = statusConfig[p.paymentStatus] || statusConfig.PENDING;
                  const isExpanded = expandedPaymentId === p.id;
                  const installments = p.installments || [];

                  return (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-brand-neutral-light/50 transition-colors">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpandedPaymentId(isExpanded ? null : p.id)}
                            className="p-1 text-gray-400 hover:text-brand-neutral"
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{p.vendor?.vendarCompanyName || p.vendor?.vendarName}</td>
                        <td className="px-4 py-3 font-mono text-xs text-brand-neutral-muted">{p.invoiceNo}</td>
                        <td className="px-4 py-3">
                          {p.assignment ? (
                            <div>
                              <p className="text-xs font-semibold text-brand-neutral">{p.assignment.traveller?.travellerId}</p>
                              <p className="text-[10px] text-gray-400">{p.assignment.traveller?.name}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-brand-primary-light text-brand-primary px-2 py-0.5 rounded-full font-medium">{p.paymentType?.replace("_", " ")}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">₹{p.amount?.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-brand-success">₹{p.paidAmount?.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-orange-600">₹{p.pendingAmount?.toLocaleString()}</td>
                        <td className="px-4 py-3 min-w-[100px]">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{pct.toFixed(0)}%</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-brand-neutral-muted whitespace-nowrap">{p.dueDate ? new Date(p.dueDate).toLocaleDateString("en-IN") : "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${cfg.className}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          {p.paymentStatus !== "PAID" && (
                            <button
                              onClick={() => { setRecordTarget(p); setIsRecordOpen(true); }}
                              className="btn-primary text-xs px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap"
                            >
                              Record Payment
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Installment History */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={12} className="p-0">
                            <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-t border-brand-neutral-border px-6 py-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Vendor</p>
                                  <p className="font-semibold text-gray-800">{p.vendor?.vendarCompanyName || p.vendor?.vendarName}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Invoice</p>
                                  <p className="font-semibold text-gray-800 font-mono">{p.invoiceNo}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Payment Type</p>
                                  <p className="font-semibold text-gray-800">{p.paymentType?.replace("_", " ")}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Payment Method</p>
                                  <p className="font-semibold text-gray-800">{METHOD_LABELS[p.paymentMethod] || p.paymentMethod}</p>
                                </div>
                              </div>

                              {/* Installment History */}
                              <div className="mt-3">
                                <h4 className="text-xs font-bold text-brand-neutral uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <CreditCard size={12} />
                                  Installment History ({installments.length})
                                </h4>
                                {installments.length === 0 ? (
                                  <p className="text-xs text-gray-400 italic">No installments recorded yet.</p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-brand-neutral-border">
<th className="tbl-th-sm py-2 px-3">#</th>
                                           <th className="tbl-th-sm py-2 px-3">Date</th>
                                           <th className="tbl-th-sm py-2 px-3">Amount</th>
                                           <th className="tbl-th-sm py-2 px-3">Method</th>
                                           <th className="tbl-th-sm py-2 px-3">Transaction ID</th>
                                           <th className="tbl-th-sm py-2 px-3">Remarks</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-brand-neutral-light">
                                        {installments.map((inst: any, idx: number) => (
                                          <tr key={inst.id} className="hover:bg-white/50">
                                            <td className="py-2 px-3 text-gray-400">{idx + 1}</td>
                                            <td className="py-2 px-3 font-medium text-brand-neutral">{inst.paymentDate ? new Date(inst.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                                            <td className="py-2 px-3 font-bold text-brand-success">₹{inst.amount?.toLocaleString()}</td>
                                            <td className="py-2 px-3">
                                              <span className="inline-flex items-center gap-1 text-brand-neutral">
                                                {METHOD_ICONS[inst.paymentMethod]}
                                                {METHOD_LABELS[inst.paymentMethod] || inst.paymentMethod}
                                              </span>
                                            </td>
                                            <td className="py-2 px-3 font-mono text-brand-neutral-muted">{inst.transactionId || "—"}</td>
                                            <td className="py-2 px-3 text-brand-neutral-muted">{inst.remarks || "—"}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <ReusableModel
        open={isRecordOpen}
        onOpenChange={(open) => { setIsRecordOpen(open); if (!open) setRecordTarget(null); }}
        title="Record Payment"
        description="Enter payment details to update the vendor's payment record."
        contentClassName="sm:max-w-[480px]"
      >
        {recordTarget && (
          <RecordPaymentModal payment={recordTarget} onSuccess={() => { setIsRecordOpen(false); setRecordTarget(null); }} />
        )}
      </ReusableModel>
    </div>
  );
}
