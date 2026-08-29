"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { X, Plus, RotateCcw, Crop, ImageIcon as ImageIconLucide, Grid3X3, Link, Loader2 } from "lucide-react";
import MediaLibrary from "@/components/shared/MediaLibrary";
import apiClient from "@/lib/apiClient";

interface BannerImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  onFilesSelect?: (files: File[], indices?: number[]) => void;
  onThumbSelect?: (url: string) => void; // cross-mode: set as thumbnail
  label?: string;
  maxImages?: number;
  folderPath?: string;
}

export default function BannerImageUpload({
  value = [], onChange, onFilesSelect, onThumbSelect, label = "Banner Images", maxImages = 15, folderPath = "",
}: BannerImageUploadProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  // Library-selected URLs shown immediately before parent re-render
  const [libraryUrls, setLibraryUrls] = useState<string[]>([]);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [mediaOpen, setMediaOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileQueueRef = useRef<File[]>([]);

  // When parent syncs fresh data, clear pending + library preview state
  const prevValueRef = useRef<string[]>(value);
  const isSelfChangeRef = useRef(false);
  useEffect(() => {
    const prev = prevValueRef.current;
    const changed = prev.length !== value.length || value.some((v, i) => prev[i] !== v);
    if (changed) {
      if (isSelfChangeRef.current) {
        isSelfChangeRef.current = false;
      } else {
        // External value sync (initial load / save reload) — clear pending uploads
        pendingPreviews.forEach((url) => { if (url.startsWith("blob:")) URL.revokeObjectURL(url); });
        setPendingFiles([]);
        setPendingPreviews([]);
      }
      // Clear library URLs that are now in value (parent has absorbed them)
      setLibraryUrls((prev) => prev.filter((u) => !value.includes(u)));
      prevValueRef.current = value;
    }
  }, [value]);

  const totalImages = value.length + pendingFiles.length;
  const canAdd = totalImages < maxImages;

  const drawCanvas = useCallback((img: HTMLImageElement, crop: { x: number; y: number; w: number; h: number }) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, cw, ch);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const contRatio = cw / ch;
    let drawW: number, drawH: number, drawX: number, drawY: number;
    if (contRatio > imgRatio) { drawW = cw; drawH = cw / imgRatio; drawX = 0; drawY = (ch - drawH) / 2; }
    else { drawH = ch; drawW = ch * imgRatio; drawX = (cw - drawW) / 2; drawY = 0; }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    ctx.fillStyle = "rgba(0,0,0,0.80)";
    ctx.fillRect(0, 0, cw, crop.y);
    ctx.fillRect(0, crop.y + crop.h, cw, ch - crop.y - crop.h);
    ctx.fillRect(0, crop.y, crop.x, crop.h);
    ctx.fillRect(crop.x + crop.w, crop.y, cw - crop.x - crop.w, crop.h);

    ctx.strokeStyle = "rgba(255,255,255,0.95)"; ctx.lineWidth = 2.5; ctx.setLineDash([]);
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);

    [[crop.x, crop.y], [crop.x + crop.w, crop.y], [crop.x, crop.y + crop.h], [crop.x + crop.w, crop.y + crop.h]].forEach(([cx, cy]) => {
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff"; ctx.fill();
      ctx.strokeStyle = "rgba(99,102,241,1)"; ctx.lineWidth = 2; ctx.stroke();
    });

    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(crop.x + (crop.w * i) / 3, crop.y); ctx.lineTo(crop.x + (crop.w * i) / 3, crop.y + crop.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(crop.x, crop.y + (crop.h * i) / 3); ctx.lineTo(crop.x + crop.w, crop.y + (crop.h * i) / 3); ctx.stroke();
    }
  }, []);

  const loadImgForCrop = useCallback((src: string) => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
      const container = containerRef.current;
      if (!container) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const newCrop = { x: 0, y: 0, w: cw, h: ch };
      setCropBox(newCrop);
      drawCanvas(img, newCrop);
    };
    img.src = src;
  }, [drawCanvas]);

  useEffect(() => {
    if (cropSrc && cropOpen) loadImgForCrop(cropSrc);
  }, [cropSrc, cropOpen, loadImgForCrop]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => { setCropSrc(e.target?.result as string); setCropOpen(true); };
    reader.readAsDataURL(file);
  }, []);

  const processNextInQueue = useCallback(() => {
    if (fileQueueRef.current.length === 0) return;
    handleFileSelect(fileQueueRef.current.shift()!);
  }, [handleFileSelect]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const totalAllowed = maxImages - totalImages;
    const filesToAdd = files.slice(0, totalAllowed);
    if (filesToAdd.length === 0) return;
    fileQueueRef.current = filesToAdd;
    processNextInQueue();
    e.target.value = "";
  };

  const handleMouseDown = (e: React.MouseEvent, type: string) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(true); setDragType(type);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current || !imgRef.current) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    setCropBox((prev) => {
      let { x, y, w, h } = prev;
      if (dragType === "move") {
        x = Math.max(0, Math.min(cw - w, x + dx));
        y = Math.max(0, Math.min(ch - h, y + dy));
      } else if (dragType === "se") {
        w = Math.max(40, Math.min(cw - x, w + dx));
        h = Math.max(40, Math.min(ch - y, h + dy));
      } else if (dragType === "sw") {
        const nw = Math.max(40, Math.min(x + w, w - dx)); x += w - nw; w = nw;
        h = Math.max(40, Math.min(ch - y, h + dy));
      } else if (dragType === "ne") {
        w = Math.max(40, Math.min(cw - x, w + dx));
        const nh = Math.max(40, Math.min(y + h, h - dy)); y += h - nh; h = nh;
      } else if (dragType === "nw") {
        const nw2 = Math.max(40, Math.min(x + w, w - dx));
        const nh2 = Math.max(40, Math.min(y + h, h - dy));
        x += w - nw2; y += h - nh2; w = nw2; h = nh2;
      }
      return { x, y, w, h };
    });
    setDragStart({ x: e.clientX, y: e.clientY });
    requestAnimationFrame(() => { if (imgRef.current) drawCanvas(imgRef.current, cropBox); });
  }, [isDragging, dragType, dragStart, cropBox, drawCanvas]);

  const handleMouseUp = useCallback(() => { setIsDragging(false); setDragType(null); }, []);

  useEffect(() => {
    if (cropBox.w > 0 && imgRef.current) drawCanvas(imgRef.current, cropBox);
  }, [cropBox, drawCanvas]);

  const handleApplyCrop = useCallback(() => {
    const img = imgRef.current;
    if (!img || !containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const contRatio = cw / ch;
    let drawW: number, drawH: number, drawX: number, drawY: number;
    if (contRatio > imgRatio) { drawW = cw; drawH = cw / imgRatio; drawX = 0; drawY = (ch - drawH) / 2; }
    else { drawH = ch; drawW = ch * imgRatio; drawX = (cw - drawW) / 2; drawY = 0; }

    const scaleX = img.naturalWidth / drawW;
    const scaleY = img.naturalHeight / drawH;
    const sx = (cropBox.x - drawX) * scaleX;
    const sy = (cropBox.y - drawY) * scaleY;
    const sw = cropBox.w * scaleX;
    const sh = cropBox.h * scaleY;

    let outW = Math.round(sw), outH = Math.round(sh);
    if (outW > 1920) { outH = Math.round((outH / outW) * 1920); outW = 1920; }
    if (outH > 1080) { outW = Math.round((outW / outH) * 1080); outH = 1080; }

    const outCanvas = document.createElement("canvas");
    outCanvas.width = outW; outCanvas.height = outH;
    outCanvas.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

    outCanvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "banner-image.webp", { type: "image/webp" });
      const previewUrl = URL.createObjectURL(blob);
      setPendingFiles(prev => [...prev, file]);
      setPendingPreviews(prev => [...prev, previewUrl]);
      if (onFilesSelect) onFilesSelect([...pendingFiles, file]);
      setCropOpen(false); setCropSrc(null);
      if (fileQueueRef.current.length > 0) {
        setTimeout(() => processNextInQueue(), 100);
      }
    }, "image/webp", 0.80);
  }, [cropBox, pendingFiles, onFilesSelect, processNextInQueue]);

  const buildItems = () => [
    ...value.map((url) => ({ kind: "existing" as const, url })),
    // Show library-selected URLs immediately (before parent value prop updates)
    ...libraryUrls.filter((u) => !value.includes(u)).map((url) => ({ kind: "existing" as const, url })),
    ...pendingPreviews.map((preview, i) => ({ kind: "pending" as const, url: preview, file: pendingFiles[i] })),
  ];

  const resetDrag = () => { setDragIndex(null); setOverIndex(null); };

  const removeAt = (index: number) => {
    const items = buildItems();
    const removed = items[index];
    const rest = items.filter((_, i) => i !== index);
    if (removed.kind === "pending") {
      URL.revokeObjectURL(removed.url);
      const files = rest.filter((it) => it.kind === "pending").map((it) => it.file);
      const previews = rest.filter((it) => it.kind === "pending").map((it) => it.url);
      setPendingFiles(files);
      setPendingPreviews(previews);
      if (onFilesSelect) onFilesSelect(files);
    } else {
      // Remove from libraryUrls if it was a library-selected URL not yet in parent value
      const removedUrl = removed.url;
      setLibraryUrls((prev) => prev.filter((u) => u !== removedUrl));
      // Pass all remaining existing URLs to parent (value items + remaining library items)
      const remainingExisting = rest
        .filter((it) => it.kind === "existing")
        .map((it) => it.url)
        .filter((u) => u !== removedUrl);
      isSelfChangeRef.current = true;
      onChange(remainingExisting);
    }
  };

  const reCrop = (index: number) => {
    const item = buildItems()[index];
    if (item.kind === "pending") {
      setCropSrc(item.url);
      setCropOpen(true);
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) { resetDrag(); return; }
    const items = buildItems();
    const [moved] = items.splice(dragIndex, 1);
    items.splice(targetIndex, 0, moved);
    const urls = items.filter((it) => it.kind === "existing").map((it) => it.url);
    const pending = items.filter((it) => it.kind === "pending");
    const files = pending.map((it) => it.file);
    const previews = pending.map((it) => it.url);
    const indices = pending.map((it) => items.indexOf(it));
    isSelfChangeRef.current = true;
    onChange(urls);
    setPendingFiles(files);
    setPendingPreviews(previews);
    if (onFilesSelect) onFilesSelect(files, indices);
    resetDrag();
  };

  const handleUrlLoad = async () => {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    setUrlError("");
    try {
      const res = await apiClient.get(`/proxy-image?url=${encodeURIComponent(urlInput.trim())}`, { responseType: "blob" });
      const blob = res.data;
      const objectUrl = URL.createObjectURL(blob);
      setCropSrc(objectUrl);
      setCropOpen(true);
      setUrlInput("");
      setUrlMode(false);
    } catch (err: any) {
      setUrlError(err?.response?.data?.message || "Failed to load image from URL");
    } finally {
      setUrlLoading(false);
    }
  };

  const allPreviews = [...value, ...libraryUrls.filter((u) => !value.includes(u)), ...pendingPreviews];

  const handleLibrarySelectMany = (urls: string[]) => {
    const newOnes = urls.filter((u) => !value.includes(u) && !libraryUrls.includes(u));
    setLibraryUrls((prev) => [...prev, ...newOnes]);
    isSelfChangeRef.current = true;
    onChange([...value, ...libraryUrls.filter((u) => !value.includes(u)), ...newOnes]);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-brand-neutral-muted block">{label}</label>

      {allPreviews.length > 0 && (
        <div className={allPreviews.length === 1 ? "" : "grid grid-cols-2 md:grid-cols-3 gap-3"}>
          {buildItems().map((item, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDragIndex(i); }}
              onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }}
              onDrop={(e) => { e.preventDefault(); handleDrop(i); }}
              onDragEnd={resetDrag}
              className={`relative group rounded-xl overflow-hidden border border-brand-neutral-border transition-opacity cursor-grab active:cursor-grabbing ${
                dragIndex === i ? "opacity-40" : ""
              } ${overIndex === i && dragIndex !== null ? "ring-2 ring-brand-primary" : ""}`}
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
            >
              <img src={item.url} alt={`Banner ${i + 1}`} className={`w-full object-cover ${allPreviews.length === 1 ? "h-56 rounded-xl" : "h-32"}`} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors pointer-events-none" />
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.kind === "pending" && (
                  <button type="button" onClick={() => reCrop(i)} className="p-1.5 bg-white/90 text-brand-neutral rounded-full hover:bg-white shadow" title="Re-crop">
                    <RotateCcw size={12} />
                  </button>
                )}
                <button type="button" onClick={() => removeAt(i)} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow" title="Remove">
                  <X size={12} />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crop size={10} /> #{i + 1} {item.kind === "pending" ? "(new)" : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {canAdd && (
        <div className="space-y-2">
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-300 rounded-xl bg-brand-neutral-light hover:bg-brand-neutral-light hover:border-indigo-300 transition-colors">
            <Plus size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-brand-neutral-muted">
              {allPreviews.length === 0 ? "Upload & Crop Banner Images" : `Add More (${allPreviews.length}/${maxImages})`}
            </span>
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={() => setMediaOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-brand-primary/40 rounded-xl bg-brand-primary/5 hover:bg-brand-primary/10 transition-colors">
              <Grid3X3 size={16} className="text-brand-primary" />
              <span className="text-sm font-medium text-brand-primary">Pick from Library</span>
            </button>
            <button type="button" onClick={() => setUrlMode(!urlMode)}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-emerald-300 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors">
              <Link size={16} className="text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Paste URL</span>
            </button>
          </div>
          {urlMode && (
            <div className="flex gap-2 items-end">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleUrlLoad()}
                placeholder="Paste image URL from any website..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/30"
              />
              <button type="button" onClick={handleUrlLoad} disabled={urlLoading || !urlInput.trim()}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap">
                {urlLoading ? <Loader2 size={14} className="animate-spin" /> : <Link size={14} />}
                {urlLoading ? "Loading..." : "Load & Crop"}
              </button>
            </div>
          )}
          {urlError && <p className="text-xs text-red-500">{urlError}</p>}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

      {allPreviews.length > 0 && (
        <p className="text-[10px] text-slate-400">{allPreviews.length}/{maxImages} images — cropped & ready</p>
      )}

      {cropOpen && cropSrc && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onMouseUp={handleMouseUp}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-brand-neutral-border">
              <div className="flex items-center gap-2">
                <Crop size={18} className="text-brand-primary" />
                <span className="font-bold text-brand-neutral-dark text-sm">Crop & Resize Banner</span>
              </div>
              <span className="text-xs text-slate-400">Drag corners to resize, drag center to move</span>
            </div>

            <div ref={containerRef} className="relative flex-1 min-h-[300px] max-h-[60vh] overflow-hidden cursor-crosshair bg-slate-900"
              onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
              {cropBox.w > 0 && (
                <>
                  <div className="absolute cursor-move z-20" style={{ left: cropBox.x, top: cropBox.y, width: cropBox.w, height: cropBox.h }}
                    onMouseDown={(e) => handleMouseDown(e, "move")} />
                  {(["nw", "ne", "sw", "se"] as const).map((pos) => (
                    <div key={pos} className="absolute w-4 h-4 bg-white border-2 border-brand-primary rounded-full shadow-md z-30"
                      style={{ cursor: pos === "nw" || pos === "se" ? "nwse-resize" : "nesw-resize", left: cropBox.x + (pos.includes("e") ? cropBox.w - 8 : -8), top: cropBox.y + (pos.includes("s") ? cropBox.h - 8 : -8) }}
                      onMouseDown={(e) => handleMouseDown(e, pos)} />
                  ))}
                </>
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-brand-neutral-border bg-brand-neutral-light rounded-b-2xl">
              <p className="text-xs text-slate-400">{imgNatural.w} × {imgNatural.h}px</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setCropOpen(false); setCropSrc(null); fileQueueRef.current = []; }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-brand-neutral bg-slate-200 hover:bg-slate-300">Cancel</button>
                <button type="button" onClick={handleApplyCrop}
                  className="btn-primary px-4 py-2 text-sm flex items-center gap-1 shadow">
                  <ImageIconLucide size={16} /> Apply & Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MediaLibrary
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        {...(onThumbSelect
          ? {
              modeSwitch: {
                defaultMode: "banner" as const,
                onBanner: (url: string) => handleLibrarySelectMany([url]),
                onThumb: onThumbSelect,
              },
            }
          : {
              onSelect: (url: string) => handleLibrarySelectMany([url]),
              onSelectMany: handleLibrarySelectMany,
              maxSelection: Math.max(1, maxImages - totalImages),
            })}
        title={onThumbSelect ? "Select Banner Image" : "Select Banner Images"}
      />
    </div>
  );
}
