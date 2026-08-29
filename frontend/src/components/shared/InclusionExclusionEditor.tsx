"use client";
import { useState } from "react";
import { Plus, X, CheckCircle2, XCircle } from "lucide-react";

interface InclusionExclusionEditorProps {
  includes: string[];
  includesOnChange: (v: string[]) => void;
  excludes: string[];
  excludesOnChange: (v: string[]) => void;
}

function DynamicList({ items, onChange, type }: { items: string[]; onChange: (v: string[]) => void; type: "include" | "exclude" }) {
  const [input, setInput] = useState("");
  const isInclude = type === "include";

  const addItem = () => {
    if (!input.trim()) return;
    onChange([...items, input.trim()]);
    setInput("");
  };

  const removeItem = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addItem())}
          placeholder={isInclude ? "Add inclusion..." : "Add exclusion..."}
          className={`flex-1 text-xs px-3 py-2 border rounded-lg bg-white outline-none focus:ring-1 ${
            isInclude ? "border-emerald-200 focus:ring-emerald-400" : "border-red-200 focus:ring-red-400"
          }`}
        />
        <button
          type="button"
          onClick={addItem}
          className={`px-3 py-2 text-xs font-semibold border rounded-lg transition-colors ${
            isInclude
              ? "bg-brand-success-light text-brand-success border-emerald-200 hover:bg-brand-success-light"
              : "bg-brand-danger-light text-brand-danger border-red-200 hover:bg-brand-danger-light"
          }`}
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            isInclude ? "bg-brand-success-light" : "bg-brand-danger-light"
          }`}>
            {isInclude
              ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              : <XCircle size={13} className="text-brand-danger shrink-0" />
            }
            <input
              value={item}
              onChange={(e) => {
                const arr = [...items];
                arr[i] = e.target.value;
                onChange(arr);
              }}
              className={`flex-1 text-xs text-brand-neutral bg-white outline-none focus:ring-1 rounded-lg px-2 py-1.5 border focus:ring-brand-400 ${
                isInclude ? "border-emerald-200 focus:border-emerald-400" : "border-red-200 focus:border-red-400"
              }`}
            />
            <button type="button" onClick={() => removeItem(i)} className="p-0.5 hover:bg-white rounded text-slate-400 hover:text-brand-danger shrink-0">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InclusionExclusionEditor({
  includes, includesOnChange,
  excludes, excludesOnChange,
}: InclusionExclusionEditorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-bold text-brand-success mb-2 flex items-center gap-1.5"><CheckCircle2 size={14} /> Inclusions</h4>
        <DynamicList items={includes} onChange={includesOnChange} type="include" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-brand-danger mb-2 flex items-center gap-1.5"><XCircle size={14} /> Exclusions</h4>
        <DynamicList items={excludes} onChange={excludesOnChange} type="exclude" />
      </div>
    </div>
  );
}
