"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormActionButton from "@/components/shared/customBtns";
import { useRecordVendorPayment } from "@/feature/vendors/api/useVendorHooks";
import { CreditCard, Landmark, Wallet, FileText } from "lucide-react";

interface RecordPaymentModalProps {
  payment: {
    id: number;
    invoiceNo: string;
    amount: number;
    paidAmount: number;
    pendingAmount: number;
    vendor: { vendarName?: string; vendarCompanyName?: string };
  };
  onSuccess?: () => void;
}

const PAYMENT_METHODS = [
  { value: "UPI", label: "UPI", icon: Wallet },
  { value: "BANK_TRANSFER", label: "Bank", icon: Landmark },
  { value: "CASH", label: "Cash", icon: CreditCard },
  { value: "CHEQUE", label: "Cheque", icon: FileText },
];

export function RecordPaymentModal({ payment, onSuccess }: RecordPaymentModalProps) {
  const { mutate: recordPayment, isPending } = useRecordVendorPayment();
  const [form, setForm] = useState({
    payAmount: "",
    paymentMethod: "UPI",
    transactionId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payAmt = Number(form.payAmount);
    if (!payAmt || payAmt <= 0 || payAmt > payment.pendingAmount) return;
    recordPayment({ id: payment.id, payload: { ...form, payAmount: payAmt } }, { onSuccess: () => onSuccess?.() });
  };

  const remainingAfter = Math.max(0, payment.pendingAmount - Number(form.payAmount || 0));
  const progressPct = Math.min(100, ((payment.paidAmount + Number(form.payAmount || 0)) / payment.amount) * 100);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">Invoice: {payment.invoiceNo}</p>
        <p className="font-bold text-gray-900 text-lg">{payment.vendor?.vendarCompanyName || payment.vendor?.vendarName}</p>
        <div className="grid grid-cols-3 gap-3 mt-3 text-center">
          <div><p className="text-[10px] text-gray-400 uppercase font-bold">Total</p><p className="font-bold text-gray-900 text-sm">₹{payment.amount.toLocaleString()}</p></div>
          <div><p className="text-[10px] text-green-500 uppercase font-bold">Paid</p><p className="font-bold text-green-700 text-sm">₹{payment.paidAmount.toLocaleString()}</p></div>
          <div><p className="text-[10px] text-orange-500 uppercase font-bold">Pending</p><p className="font-bold text-orange-700 text-sm">₹{payment.pendingAmount.toLocaleString()}</p></div>
        </div>
        <div className="mt-3">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">{progressPct.toFixed(0)}% paid</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">Payment Amount (₹)</Label>
        <Input
          type="number"
          required
          min="1"
          max={payment.pendingAmount}
          placeholder={`Max: ₹${payment.pendingAmount.toLocaleString()}`}
          value={form.payAmount}
          onChange={(e) => setForm((p) => ({ ...p, payAmount: e.target.value }))}
          className="rounded-lg border-gray-200 text-lg font-semibold"
        />
        {form.payAmount && Number(form.payAmount) > 0 && (
          <p className="text-xs text-gray-500">Remaining: <span className="font-semibold text-orange-600">₹{remainingAfter.toLocaleString()}</span></p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700">Payment Method</Label>
        <div className="grid grid-cols-4 gap-2">
          {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((p) => ({ ...p, paymentMethod: value }))}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 text-xs font-medium transition-all ${
                form.paymentMethod === value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">Transaction ID</Label>
          <Input placeholder="UTR / Ref No." value={form.transactionId} onChange={(e) => setForm((p) => ({ ...p, transactionId: e.target.value }))} className="rounded-lg border-gray-200" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">Payment Date</Label>
          <Input type="date" value={form.paymentDate} onChange={(e) => setForm((p) => ({ ...p, paymentDate: e.target.value }))} className="rounded-lg border-gray-200" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">Remarks (Optional)</Label>
        <Input placeholder="Any notes..." value={form.remarks} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))} className="rounded-lg border-gray-200" />
      </div>

      <div className="pt-2">
        <FormActionButton
          text={isPending ? "Recording..." : "Record Payment"}
          type="submit"
          isLoading={isPending}
          disabled={!form.payAmount || Number(form.payAmount) <= 0 || Number(form.payAmount) > payment.pendingAmount}
          fullWidth
          size="md"
        />
      </div>
    </form>
  );
}
