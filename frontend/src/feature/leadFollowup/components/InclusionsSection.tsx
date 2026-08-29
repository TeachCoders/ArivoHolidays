"use client";

import { Plus, X, CheckCircle2, RotateCcw } from "lucide-react";
import { DEFAULT_INCLUDES } from "./packageTypes";

export interface InclusionsSectionProps {
  includes: string[];
  setIncludes: React.Dispatch<React.SetStateAction<string[]>>;
  newInclude: string;
  setNewInclude: (val: string) => void;
}

export default function InclusionsSection({
  includes,
  setIncludes,
  newInclude,
  setNewInclude,
}: InclusionsSectionProps) {
  const addInclude = () => {
    if (!newInclude.trim()) return;
    setIncludes([...includes, newInclude.trim()]);
    setNewInclude("");
  };

  const removeInclude = (idx: number) => setIncludes(includes.filter((_, i) => i !== idx));

  const resetToDefault = () => setIncludes(DEFAULT_INCLUDES);

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-emerald-700 flex items-center gap-2 text-sm">
          <CheckCircle2 size={16} /> Package Includes
        </h3>
        <button
          type="button"
          onClick={resetToDefault}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 border border-emerald-200 hover:border-emerald-400 px-2.5 py-1 rounded-md transition-colors bg-emerald-50 hover:bg-emerald-100"
        >
          <RotateCcw size={12} />
          Reset to Default
        </button>
      </div>
      <ul className="space-y-2 mb-3">
        {includes.map((inc, idx) => (
          <li key={idx} className="flex items-center justify-between text-sm bg-emerald-50/50 px-3 py-1.5 rounded">
            <span className="text-slate-700">✅ {inc}</span>
            <button onClick={() => removeInclude(idx)} className="text-slate-400 hover:text-red-500" type="button">
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          className="border p-1.5 rounded w-full text-sm"
          placeholder="Add inclusion... (Press Enter)"
          value={newInclude}
          onChange={(e) => setNewInclude(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addInclude()}
        />
        <button onClick={addInclude} className="px-3 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700" type="button">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
