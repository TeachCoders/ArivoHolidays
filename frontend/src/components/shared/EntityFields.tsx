"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface EntityField {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "number" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface EntityFieldsProps {
  title: string;
  fields: EntityField[];
  values: Record<string, string>;
  onFieldChange: (name: string, value: string) => void;
  errors?: Record<string, string>;
}

export default function EntityFields({
  title,
  fields,
  values,
  onFieldChange,
  errors = {},
}: EntityFieldsProps) {
  return (
    <div className="border border-slate-200 rounded-xl shadow-sm bg-white p-6 space-y-5">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
        {title}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-600">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </Label>
            {field.type === "textarea" ? (
              <textarea
                value={values[field.name] || ""}
                onChange={(e) => onFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              />
            ) : field.type === "select" ? (
              <select
                value={values[field.name] || ""}
                onChange={(e) => onFieldChange(field.name, e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              >
                <option value="">{field.placeholder || `Select ${field.label.toLowerCase()}...`}</option>
                {(field.options || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={values[field.name] || ""}
                onChange={(e) => onFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={errors[field.name] ? "border-red-500" : ""}
              />
            )}
            {errors[field.name] && (
              <p className="text-xs text-red-500">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
