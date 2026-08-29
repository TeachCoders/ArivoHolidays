"use client";

import { CreditCard, Info } from "lucide-react";

export interface PaymentPolicySectionProps {
  advanceAmount: number;
  setAdvanceAmount: (val: number) => void;
  balanceTerms: string;
  setBalanceTerms: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  grandTotal?: number;
}

export default function PaymentPolicySection({
  advanceAmount,
  setAdvanceAmount,
  balanceTerms,
  setBalanceTerms,
  notes,
  setNotes,
  grandTotal,
}: PaymentPolicySectionProps) {
  const fiftyPercent = grandTotal ? Math.round(grandTotal * 0.5) : 0;
  const isBelowMinimum = grandTotal && advanceAmount > 0 && advanceAmount < fiftyPercent;

  return (
    <>
      <div className="border rounded-lg p-4 shadow-sm bg-white">
        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
          <CreditCard size={16} className="text-indigo-600" /> Payment Terms
        </h3>
        {fiftyPercent > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded px-3 py-2 mb-3 text-[11px] text-indigo-700 font-semibold">
            Minimum 50% advance required: ₹{fiftyPercent.toLocaleString("en-IN")} of ₹{grandTotal?.toLocaleString("en-IN")}
          </div>
        )}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Advance Amount (₹)</label>
            <input
              type="number"
              className={`border p-2 rounded w-full text-sm ${isBelowMinimum ? "border-red-400 bg-red-50 focus:ring-red-500" : ""}`}
              value={advanceAmount === 0 ? "" : advanceAmount}
              placeholder={fiftyPercent > 0 ? String(fiftyPercent) : "0"}
              onChange={(e) => setAdvanceAmount(Number(e.target.value))}
            />
            {isBelowMinimum && (
              <p className="text-[10px] text-red-500 mt-1 font-semibold">Advance must be at least 50% (₹{fiftyPercent.toLocaleString("en-IN")})</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Balance Payment Due</label>
            <input
              className="border p-2 rounded w-full text-sm"
              placeholder="e.g. Before Arrival"
              value={balanceTerms}
              onChange={(e) => setBalanceTerms(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 shadow-sm bg-white">
        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
          <Info size={16} className="text-indigo-600" /> Important Notes
        </h3>
        <textarea
          className="border p-2 rounded w-full text-sm min-h-[120px] focus:ring-1 focus:ring-indigo-500"
          placeholder="One note per line..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <p className="text-[10px] text-slate-400 mt-1">Tip: write one note per line - each line prints as its own bullet point.</p>
      </div>
    </>
  );
}
