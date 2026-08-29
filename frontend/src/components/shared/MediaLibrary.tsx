"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Upload, Grid3X3, Check, Loader2, ImageIcon, Pencil, Star, Trash2, Save, Plus } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { successToast, errorToast } from "@/components/shared/tost";

interface MediaItem {
  id: number;
  filename: string;
  url: string;
  folder: string | null;
  originalName?: string | null;
  label: string | null;
  altText: string | null;
  caption: string | null;
  category: string | null;
  isPinned: boolean;
  sortOrder: number;
}

// When both thumb and banner callbacks are needed, pass modeSwitch
interface ModeSwitchProps {
  defaultMode: "thumb" | "banner";
  onThumb: (url: string) => void;
  onBanner: (url: string) => void;
}

interface MediaLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;   // single-mode (backward compat)
  onSelectMany?: (urls: string[]) => void; // multi-select confirm
  modeSwitch?: ModeSwitchProps;        // dual-mode with toggle
  maxSelection?: number;
  title?: string;
}

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function displayName(item: MediaItem): string {
  return item.label || item.filename;
}

function isImage(item: MediaItem): boolean {
  const ext = item.filename.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTS.includes(`.${ext}`);
}

export default function MediaLibrary({
  open,
  onClose,
  onSelect,
  onSelectMany,
  modeSwitch,
  maxSelection = 1,
  title = "Media Library",
}: MediaLibraryProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTarget, setReplaceTarget] = useState<{ folder: string; filename: string } | null>(null);
  const [replacing, setReplacing] = useState(false);
  // Active mode — also drives the thumb/banner category filter (default banner)
  const [activeMode, setActiveMode] = useState<"thumb" | "banner">(
    modeSwitch?.defaultMode ?? "banner"
  );

  const isDualMode = !!modeSwitch;

  const imageItems = items.filter(isImage);

  const filtered = imageItems.filter((item) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const label = displayName(item).toLowerCase();
      const file = item.filename.toLowerCase();
      const alt = (item.altText ?? "").toLowerCase();
      if (!label.includes(q) && !file.includes(q) && !alt.includes(q)) return false;
    }
    const isBanner = item.category === "banner" || (!item.category && item.filename.toLowerCase().includes("banner"));
    const isThumb = item.category === "thumb" || item.filename.toLowerCase().includes("thumb");
    if (activeMode === "banner" ? !isBanner : !isThumb) return false;
    return true;
  });

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/media");
      setItems(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
      setSelected([]);
      setSearch("");
      setShowUpload(false);
      setEditingId(null);
      setActiveMode(modeSwitch?.defaultMode ?? "banner");
    }
  }, [open]);

  const handleSelect = (url: string) => {
    if (isDualMode) {
      if (activeMode === "thumb") {
        modeSwitch!.onThumb(url);
      } else {
        modeSwitch!.onBanner(url);
      }
      if (activeMode === "thumb") onClose();
      if (activeMode === "banner" && maxSelection === 1) onClose();
      return;
    }

    if (maxSelection === 1) {
      onSelect?.(url);
      onClose();
      return;
    }
    setSelected((prev) => {
      if (prev.includes(url)) return prev.filter((u) => u !== url);
      if (prev.length >= maxSelection) return prev;
      return [...prev, url];
    });
  };

  const handleConfirmSelection = () => {
    if (onSelectMany) {
      onSelectMany(selected);
    } else {
      selected.forEach((url) => onSelect?.(url));
    }
    onClose();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const label = uploadLabel.trim();
    if (!file || !label) return;

    const base = slugify(label) || `image-${Date.now()}`;
    const used = new Set(items.map((i) => i.filename));
    let filename = base;
    let n = 2;
    while (used.has(`${filename}.webp`)) filename = `${base}-${n++}`;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("filename", filename);
      fd.append("label", label);
      fd.append("category", activeMode);
      fd.append("file", file);
      await apiClient.post("/upload", fd);
      setUploadLabel("");
      setShowUpload(false);
      successToast("Image uploaded");
      fetchMedia();
    } catch {
      errorToast("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleTogglePin = async (item: MediaItem) => {
    try {
      await apiClient.patch(`/media/${item.id}`, { isPinned: !item.isPinned });
      fetchMedia();
    } catch {
      errorToast("Failed to update pin");
    }
  };

  const handleStartEdit = (item: MediaItem) => {
    setEditingId(item.id);
    setEditLabel(displayName(item));
  };

  const handleSaveLabel = async (item: MediaItem) => {
    const label = editLabel.trim();
    if (!label) return;
    setSaving(true);
    try {
      await apiClient.patch(`/media/${item.id}`, { label });
      successToast("Label updated");
      setEditingId(null);
      fetchMedia();
    } catch {
      errorToast("Failed to update label");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm(`Delete "${displayName(item)}"?\n\nThe file will be removed from disk and the media library.`)) return;
    setDeletingId(item.id);
    try {
      await apiClient.delete(`/media/${item.id}`);
      successToast("Image deleted");
      fetchMedia();
    } catch {
      errorToast("Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  const handleReplaceClick = (item: MediaItem) => {
    if (replacing) return;
    if (!window.confirm(`Replace "${displayName(item)}"?\n\nThe current image will be deleted and the new image saved with the same file name, so the URL stays the same.`)) return;
    setReplaceTarget({ folder: item.folder || "content", filename: item.filename });
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = replaceTarget;
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (replaceInputRef.current) replaceInputRef.current.value = "";
    if (!file || !target) return;
    setReplacing(true);
    try {
      const fd = new FormData();
      fd.append("path", `${target.folder}/${target.filename}`);
      fd.append("file", file);
      await apiClient.post("/media/replace", fd);
      successToast(`"${target.filename}" replaced`);
      fetchMedia();
    } catch {
      errorToast("Failed to replace image");
    } finally {
      setReplacing(false);
      setReplaceTarget(null);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
              <Grid3X3 size={16} className="text-brand-primary" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm leading-tight">{title}</h2>
              <p className="text-[11px] text-slate-400">{filtered.length} images shown</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Mode hint ── */}
        {isDualMode && (
          <div className={`px-5 py-2 text-[11px] font-medium flex items-center gap-1.5 ${
            activeMode === "thumb"
              ? "bg-indigo-50 text-indigo-700 border-b border-indigo-100"
              : "bg-amber-50 text-amber-700 border-b border-amber-100"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
            {activeMode === "thumb"
              ? "Thumbnail mode — select one image to use as thumbnail"
              : "Banner mode — select image to add to banner"}
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by label or file name..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white"
            />
          </div>

          <select
            value={activeMode}
            onChange={(e) => setActiveMode(e.target.value as "thumb" | "banner")}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white text-slate-700 cursor-pointer"
          >
            <option value="banner">Banner</option>
            <option value="thumb">Thumbnail</option>
          </select>

          <button
            onClick={() => setShowUpload(!showUpload)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              showUpload
                ? "bg-brand-primary text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {showUpload ? <Plus size={14} /> : <Upload size={14} />}
            Upload
          </button>
        </div>

        {/* ── Upload Panel ── */}
        {showUpload && (
          <div className="px-5 py-3 border-b border-dashed border-slate-200 bg-slate-50 flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                Label (required — used for search)
              </label>
              <input
                type="text"
                value={uploadLabel}
                onChange={(e) => setUploadLabel(e.target.value)}
                placeholder="e.g. Kashmir Honeymoon Tour - Banner 1"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !uploadLabel.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? "Uploading..." : "Choose & Upload"}
            </button>
          </div>
        )}

        {/* ── Image Grid ── */}
        <input ref={replaceInputRef} type="file" accept="image/*" className="hidden" onChange={handleReplaceFile} />
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 size={28} className="animate-spin mb-3" />
              <p className="text-sm">Loading images...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <ImageIcon size={40} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">No images found</p>
              <p className="text-xs mt-1 text-slate-400">
                {search ? "Try a different search term" : "Upload an image to get started"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((item) => {
                const isSelected = selected.includes(item.url);
                const isEditing = editingId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.url)}
                    title={displayName(item)}
                    className={`relative flex flex-col group rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand-primary ring-4 ring-brand-primary/20 shadow-lg scale-[0.98]"
                        : "border-slate-200 hover:border-brand-primary/50 hover:shadow-md"
                    }`}
                  >
                    <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
                      <img
                        src={item.url}
                        alt={displayName(item)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className={`absolute inset-0 transition-colors ${
                        isSelected
                          ? "bg-brand-primary/20"
                          : activeMode === "banner"
                            ? "bg-black/0 group-hover:bg-amber-900/10"
                            : "bg-black/0 group-hover:bg-black/10"
                      }`} />

                    {isSelected && (
                      <div className="absolute top-2 left-2 w-6 h-6 bg-brand-primary border-2 border-white rounded-full flex items-center justify-center shadow-md z-10">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Pin (star) — pinned items show first */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleTogglePin(item); }}
                      title={item.isPinned ? "Unpin (move down)" : "Pin (show at top)"}
                      className={`absolute top-1.5 right-1.5 p-1.5 rounded-full shadow transition-colors ${
                        item.isPinned
                          ? "bg-amber-400 text-white"
                          : "bg-white/90 text-slate-500 hover:bg-white hover:text-amber-500 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Star size={12} className={item.isPinned ? "fill-current" : ""} />
                    </button>

                    {/* Inline label edit overlay */}
                    {isEditing && (
                      <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-2 p-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSaveLabel(item); if (e.key === "Escape") setEditingId(null); }}
                          className="w-full px-2 py-1.5 text-[11px] border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveLabel(item)}
                            disabled={saving}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {saving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-[10px] font-semibold text-slate-600 bg-slate-200 rounded-md hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons - Always visible for touch/mobile, subtle on desktop */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleStartEdit(item); }}
                        className="p-1.5 bg-white/80 backdrop-blur-sm text-slate-700 rounded-lg hover:bg-white hover:text-brand-primary hover:shadow-md transition-all"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        type="button"
                        disabled={replacing}
                        onClick={(e) => { e.stopPropagation(); handleReplaceClick(item); }}
                        title="Replace image (same file name)"
                        className="p-1.5 bg-white/80 backdrop-blur-sm text-slate-700 rounded-lg hover:bg-white hover:text-brand-primary hover:shadow-md transition-all"
                      >
                        {replacing && replaceTarget?.filename === item.filename
                          ? <Loader2 size={11} className="animate-spin" />
                          : <Upload size={11} />}
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                        title="Delete image"
                        className="p-1.5 bg-white/80 backdrop-blur-sm text-slate-700 rounded-lg hover:bg-white hover:text-red-600 hover:shadow-md transition-all"
                      >
                        {deletingId === item.id
                          ? <Loader2 size={11} className="animate-spin" />
                          : <Trash2 size={11} />}
                      </button>
                    </div>

                    </div>
                    
                    {/* Info bar at bottom instead of hover overlay */}
                    <div className="p-2.5 bg-white border-t border-slate-100">
                      <p className="text-slate-700 text-[11px] font-medium truncate" title={displayName(item)}>
                        {displayName(item)}
                      </p>
                      <p className="text-slate-400 text-[9px] mt-0.5 uppercase tracking-wider">
                        {item.category || "Media"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer (multi-select only) ── */}
        {!isDualMode && maxSelection > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
            <p className="text-xs text-slate-500">
              {selected.length > 0 ? `${selected.length} of ${maxSelection} selected` : `Select up to ${maxSelection} images`}
            </p>
            <button
              onClick={handleConfirmSelection}
              disabled={selected.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Check size={14} />
              Add {selected.length > 0 ? `(${selected.length})` : "Selected"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
