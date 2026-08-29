"use client";

import { Plus, X, XCircle, RotateCcw } from "lucide-react";
import { DEFAULT_EXCLUDES } from "./packageTypes";

export interface ExclusionsSectionProps {
  excludes: string[];
  setExcludes: React.Dispatch<React.SetStateAction<string[]>>;
  newExclude: string;
  setNewExclude: (val: string) => void;
}

export default function ExclusionsSection({
  excludes,
  setExcludes,
  newExclude,
  setNewExclude,
}: ExclusionsSectionProps) {
  const addExclude = () => {
    if (!newExclude.trim()) return;
    setExcludes([...excludes, newExclude.trim()]);
    setNewExclude("");
  };

  const removeExclude = (idx: number) => setExcludes(excludes.filter((_, i) => i !== idx));

  const resetToDefault = () => setExcludes(DEFAULT_EXCLUDES);

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-red-700 flex items-center gap-2 text-sm">
          <XCircle size={16} /> Package Excludes
        </h3>
        <button
          type="button"
          onClick={resetToDefault}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900 border border-red-200 hover:border-red-400 px-2.5 py-1 rounded-md transition-colors bg-red-50 hover:bg-red-100"
        >
          <RotateCcw size={12} />
          Reset to Default
        </button>
      </div>
      <ul className="space-y-2 mb-3">
        {excludes.map((exc, idx) => (
          <li key={idx} className="flex items-center justify-between text-sm bg-red-50/50 px-3 py-1.5 rounded">
            <span className="text-slate-700">❌ {exc}</span>
            <button onClick={() => removeExclude(idx)} className="text-slate-400 hover:text-red-500" type="button">
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          className="border p-1.5 rounded w-full text-sm"
          placeholder="Add exclusion... (Press Enter)"
          value={newExclude}
          onChange={(e) => setNewExclude(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addExclude()}
        />
        <button onClick={addExclude} className="px-3 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700" type="button">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
