"use client";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface ParentOption {
  id: number;
  title: string;
}

interface QuickCreateModalProps {
  open: boolean;
  title: string;
  submitLabel?: string;
  parentLabel?: string;
  parentPlaceholder?: string;
  parentOptions?: ParentOption[];
  parentValue?: number | null;
  onParentChange?: (id: number | null) => void;
  loading?: boolean;
  error?: string;
  onSubmit: (data: { title: string; slug: string; h1Title: string; parentId: number | null }) => void;
  onClose: () => void;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function QuickCreateModal({
  open,
  title,
  submitLabel = "Create",
  parentLabel,
  parentPlaceholder = "Select...",
  parentOptions = [],
  parentValue = null,
  onParentChange,
  loading = false,
  error = "",
  onSubmit,
  onClose,
}: QuickCreateModalProps) {
  const [h1Title, setPageTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [parentOpen, setParentOpen] = useState(false);
  const [localError, setLocalError] = useState("");

  if (!open) return null;

  const reset = () => {
    setPageTitle("");
    setSlug("");
    setSlugTouched(false);
    setParentSearch("");
    setParentOpen(false);
    setLocalError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    setLocalError("");
    if (!h1Title.trim()) {
      setLocalError("Page Title is required");
      return;
    }
    if (parentLabel && parentOptions.length > 0 && !parentValue) {
      setLocalError(`${parentLabel} is required`);
      return;
    }
    onSubmit({
      title: h1Title.trim(),
      slug: slug.trim() || (slugTouched ? "" : toSlug(h1Title)),
      h1Title: h1Title.trim(),
      parentId: parentValue,
    });
  };

  const showError = localError || error;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-700">{title}</h3>
          <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3.5 p-5" onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}>
          {parentLabel && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">{parentLabel} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={parentOpen ? parentSearch : (parentValue ? (parentOptions.find((o) => o.id === parentValue)?.title ?? "") : parentSearch)}
                  onChange={(e) => {
                    setParentSearch(e.target.value);
                    setParentOpen(true);
                    if (parentValue) onParentChange?.(null);
                  }}
                  onFocus={() => setParentOpen(true)}
                  onBlur={() => setTimeout(() => setParentOpen(false), 150)}
                  placeholder={parentPlaceholder}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                {parentOpen && (
                  <div className="absolute z-20 mt-1 w-full max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg p-1">
                    {parentOptions.filter((o) => o.title.toLowerCase().includes(parentSearch.toLowerCase())).length === 0 ? (
                      <p className="px-2 py-1.5 text-xs text-slate-400">No results found</p>
                    ) : (
                      parentOptions
                        .filter((o) => o.title.toLowerCase().includes(parentSearch.toLowerCase()))
                        .map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              onParentChange?.(o.id);
                              setParentSearch("");
                              setParentOpen(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-50 cursor-pointer ${
                              parentValue === o.id ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600"
                            }`}
                          >
                            {o.title}
                          </button>
                        ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={h1Title}
              onChange={(e) => {
                setPageTitle(e.target.value);
                if (!slugTouched) setSlug(toSlug(e.target.value));
              }}
              placeholder="Enter title"
              autoFocus
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <p className="text-[10px] text-slate-400">Name of the record. The slug is auto-generated from this.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="Auto-generated from title"
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <p className="text-[10px] text-slate-400">Auto-generated from Title. You can edit it manually.</p>
          </div>

          {showError && <p className="text-xs text-red-500">{showError}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Creating..." : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
