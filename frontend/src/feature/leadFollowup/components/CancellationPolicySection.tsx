"use client";

import { Info, RotateCcw } from "lucide-react";
import { DEFAULT_CANCELLATION_POLICY } from "./packageTypes";

export interface CancellationPolicySectionProps {
  cancellationPolicy: string;
  setCancellationPolicy: (val: string) => void;
}

export default function CancellationPolicySection({
  cancellationPolicy,
  setCancellationPolicy,
}: CancellationPolicySectionProps) {
  const loadDefault = () => {
    if (
      cancellationPolicy &&
      !confirm("Existing policy will be replaced with standard policy. Continue?")
    )
      return;
    setCancellationPolicy(DEFAULT_CANCELLATION_POLICY);
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
          <Info size={16} className="text-red-600" /> Cancellation Policy
        </h3>
        <button
          type="button"
          onClick={loadDefault}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-2.5 py-1 rounded-md transition-colors bg-indigo-50 hover:bg-indigo-100"
        >
          <RotateCcw size={12} />
          Load Standard Policy
        </button>
      </div>
      <textarea
        className="border p-2 rounded w-full text-sm min-h-[160px] focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed"
        placeholder={`Click "Load Standard Policy" to auto-fill industry-standard cancellation terms, then edit as needed...`}
        value={cancellationPolicy}
        onChange={(e) => setCancellationPolicy(e.target.value)}
      />
      <p className="text-[10px] text-slate-400 mt-1">
        Tip: Click <strong>Load Standard Policy</strong> to prefill standard terms. You can edit afterwards.
      </p>
    </div>
  );
}
