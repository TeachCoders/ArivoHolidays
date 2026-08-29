"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, RotateCcw, Check, Crop, ImageIcon, Link, Upload, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import apiClient from "@/lib/apiClient";

interface ImageCropUploadProps {
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  maxWidth?: number;
  maxHeight?: number;
  outputFormat?: "image/jpeg" | "image/webp" | "image/png";
  quality?: number;
  borderRadius?: number;
  shadow?: boolean;
  className?: string;
  label?: string;
  initialImage?: string;
}

type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | "move" | null;

export default function ImageCropUpload({
  onFileSelect, onClear,
  maxWidth = 1920, maxHeight = 1080,
  outputFormat = "image/webp", quality = 0.80,
  borderRadius = 12, shadow = true,
  className = "", label = "Upload Image", initialImage
}: ImageCropUploadProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [mode, setMode] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [zoomPercent, setZoomPercent] = useState(100);

  useEffect(() => {
    if (initialImage) {
      setPreview(initialImage);
    }
  }, [initialImage]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imgOffsetRef = useRef({ x: 0, y: 0 });
  const imgScaleRef = useRef(1);

  const cropBoxRef = useRef({ x: 40, y: 40, w: 200, h: 150 });
  const [cropBox, setCropBox] = useState({ x: 40, y: 40, w: 200, h: 150 });
  const interactRef = useRef<{ mode: ResizeEdge; startX: number; startY: number; startBox: { x: number; y: number; w: number; h: number } } | null>(null);
  const [interactionMode, setInteractionMode] = useState<ResizeEdge>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => { setSrc(e.target?.result as string); setCropOpen(true); };
    reader.readAsDataURL(file);
  }, []);

  const handleUrlLoad = async () => {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    setUrlError("");
    try {
      const res = await apiClient.get(`/proxy-image?url=${encodeURIComponent(urlInput.trim())}`, { responseType: "blob" });
      const blob = res.data;
      const mimeType = blob.type || "image/webp";
      if (!mimeType.startsWith("image/")) {
        setUrlError("URL does not point to an image");
        return;
      }
      const objectUrl = URL.createObjectURL(blob);
      setSrc(objectUrl);
      setCropOpen(true);
    } catch (err: any) {
      setUrlError(err?.response?.data?.message || "Failed to load image from URL");
    } finally {
      setUrlLoading(false);
    }
  };

  const getCoverDimensions = useCallback((cw: number, ch: number, imgW: number, imgH: number) => {
    const imgRatio = imgW / imgH;
    const contRatio = cw / ch;
    if (contRatio > imgRatio) {
      return { baseW: cw, baseH: cw / imgRatio };
    }
    return { baseW: ch * imgRatio, baseH: ch };
  }, []);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imgRef.current;
    if (!canvas || !container || !img) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, cw, ch);

    const { baseW, baseH } = getCoverDimensions(cw, ch, img.naturalWidth, img.naturalHeight);
    const scale = imgScaleRef.current;
    const offset = imgOffsetRef.current;
    const drawW = baseW * scale;
    const drawH = baseH * scale;
    const drawX = (cw - drawW) / 2 + offset.x;
    const drawY = (ch - drawH) / 2 + offset.y;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, [getCoverDimensions]);

  const loadImg = useCallback((imgSrc: string) => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
      const container = containerRef.current;
      if (!container) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const { baseW, baseH } = getCoverDimensions(cw, ch, img.naturalWidth, img.naturalHeight);
      const initialScale = Math.max(cw / baseW, ch / baseH, 1);
      imgScaleRef.current = initialScale;
      imgOffsetRef.current = { x: 0, y: 0 };
      setZoomPercent(Math.round(initialScale * 100));

      const boxW = cw * 0.8;
      const boxH = ch * 0.8;
      const box = { x: (cw - boxW) / 2, y: (ch - boxH) / 2, w: boxW, h: boxH };
      cropBoxRef.current = box;
      setCropBox(box);

      renderCanvas();
    };
    img.src = imgSrc;
  }, [getCoverDimensions, renderCanvas]);

  useEffect(() => {
    if (src && cropOpen) loadImg(src);
  }, [src, cropOpen, loadImg]);

  const setScale = useCallback((newScale: number) => {
    const clamped = Math.min(5, Math.max(0.25, newScale));
    imgScaleRef.current = clamped;
    setZoomPercent(Math.round(clamped * 100));
    renderCanvas();
  }, [renderCanvas]);

  const clampCropBox = (box: { x: number; y: number; w: number; h: number }, containerW: number, containerH: number) => {
    const minSize = 30;
    let { x, y, w, h } = box;
    w = Math.max(minSize, Math.min(w, containerW));
    h = Math.max(minSize, Math.min(h, containerH));
    x = Math.max(0, Math.min(x, containerW - w));
    y = Math.max(0, Math.min(y, containerH - h));
    return { x, y, w, h };
  };

  const handleCropMouseDown = useCallback((e: React.MouseEvent, mode: ResizeEdge) => {
    e.preventDefault();
    e.stopPropagation();
    interactRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...cropBoxRef.current },
    };
    setInteractionMode(mode);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!interactRef.current) return;
    const { mode, startX, startY, startBox } = interactRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    let newBox = { ...startBox };

    if (mode === "move") {
      newBox.x = startBox.x + dx;
      newBox.y = startBox.y + dy;
    } else if (mode === "e") {
      newBox.w = startBox.w + dx;
    } else if (mode === "w") {
      newBox.x = startBox.x + dx;
      newBox.w = startBox.w - dx;
    } else if (mode === "s") {
      newBox.h = startBox.h + dy;
    } else if (mode === "n") {
      newBox.y = startBox.y + dy;
      newBox.h = startBox.h - dy;
    } else if (mode === "se") {
      newBox.w = startBox.w + dx;
      newBox.h = startBox.h + dy;
    } else if (mode === "sw") {
      newBox.x = startBox.x + dx;
      newBox.w = startBox.w - dx;
      newBox.h = startBox.h + dy;
    } else if (mode === "ne") {
      newBox.w = startBox.w + dx;
      newBox.y = startBox.y + dy;
      newBox.h = startBox.h - dy;
    } else if (mode === "nw") {
      newBox.x = startBox.x + dx;
      newBox.y = startBox.y + dy;
      newBox.w = startBox.w - dx;
      newBox.h = startBox.h - dy;
    }

    newBox = clampCropBox(newBox, cw, ch);
    cropBoxRef.current = newBox;
    setCropBox(newBox);
  }, []);

  const handleMouseUp = useCallback(() => {
    interactRef.current = null;
    setInteractionMode(null);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale(imgScaleRef.current + delta);
  }, [setScale]);

  const handleApply = useCallback(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const { baseW, baseH } = getCoverDimensions(cw, ch, img.naturalWidth, img.naturalHeight);
    const scale = imgScaleRef.current;
    const offset = imgOffsetRef.current;
    const drawW = baseW * scale;
    const drawH = baseH * scale;
    const drawX = (cw - drawW) / 2 + offset.x;
    const drawY = (ch - drawH) / 2 + offset.y;

    const scaleX = img.naturalWidth / drawW;
    const scaleY = img.naturalHeight / drawH;

    const box = cropBoxRef.current;
    const sx = (box.x - drawX) * scaleX;
    const sy = (box.y - drawY) * scaleY;
    const sw = box.w * scaleX;
    const sh = box.h * scaleY;

    const clampedSx = Math.max(0, sx);
    const clampedSy = Math.max(0, sy);
    const clampedSw = Math.min(sw, img.naturalWidth - clampedSx);
    const clampedSh = Math.min(sh, img.naturalHeight - clampedSy);

    // Determine final output dimensions respecting max constraints and allowing upscale
    let outW = Math.round(clampedSw);
    let outH = Math.round(clampedSh);
    // First, downscale if exceeding max dimensions (existing behavior)
    if (outW > maxWidth) { outH = Math.round((outH / outW) * maxWidth); outW = maxWidth; }
    if (outH > maxHeight) { outW = Math.round((outW / outH) * maxHeight); outH = maxHeight; }
    // Then, upscale if both dimensions are below the max limits to utilize larger size
    if (outW < maxWidth && outH < maxHeight) {
      const upScale = Math.min(maxWidth / outW, maxHeight / outH);
      outW = Math.round(outW * upScale);
      outH = Math.round(outH * upScale);
    }
    if (outW <= 0 || outH <= 0) return;
    // Store output size for UI display
    setOutputSize({ w: outW, h: outH });
    const outCanvas = document.createElement("canvas");
    outCanvas.width = outW;
    outCanvas.height = outH;
    outCanvas.getContext("2d")!.drawImage(img, clampedSx, clampedSy, clampedSw, clampedSh, 0, 0, outW, outH);

    outCanvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "processed-image.webp", { type: outputFormat });
      setPreview(URL.createObjectURL(blob));
      setCropOpen(false);
      setSrc(null);
      setUrlInput("");
      onFileSelect(file);
    }, outputFormat, quality);
  }, [maxWidth, maxHeight, outputFormat, quality, onFileSelect, getCoverDimensions]);

  const handleClear = () => { if (preview) URL.revokeObjectURL(preview); setPreview(null); setSrc(null); setCropOpen(false); setUrlInput(""); onClear?.(); };
  const handleReCrop = () => { if (preview) { URL.revokeObjectURL(preview); setPreview(null); } fileInputRef.current?.click(); };

  const [isDragOver, setIsDragOver] = useState(false);
const [outputSize, setOutputSize] = useState<null | { w: number; h: number }>(null);
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); };

  const getCursorForEdge = (edge: ResizeEdge): string => {
    if (edge === "move") return "move";
    if (edge === "n" || edge === "s") return "ns-resize";
    if (edge === "e" || edge === "w") return "ew-resize";
    if (edge === "ne" || edge === "sw") return "nesw-resize";
    if (edge === "nw" || edge === "se") return "nwse-resize";
    return "default";
  };

  return (
    <div className={className}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />

      {preview && !cropOpen && (
        <div className="relative group rounded-xl overflow-hidden" style={{ boxShadow: shadow ? "0 8px 30px rgba(0,0,0,0.12)" : undefined }}>
          <img src={preview} alt="Uploaded" className="w-full object-cover" style={{ borderRadius }} />
          {outputSize && (
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {outputSize.w}×{outputSize.h}px
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button type="button" onClick={handleReCrop}
              className="bg-white/90 hover:bg-white text-slate-700 rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1 shadow-lg">
              <RotateCcw size={14} /> Re-crop
            </button>
            <button type="button" onClick={handleClear}
              className="bg-red-500/90 hover:bg-red-500 text-white rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1 shadow-lg">
              <X size={14} /> Remove
            </button>
          </div>
        </div>
      )}

      {!preview && !cropOpen && (
        <div className="space-y-2">
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <button type="button" onClick={() => setMode("file")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${mode === "file" ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              <Upload size={13} /> Upload File
            </button>
            <button type="button" onClick={() => setMode("url")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${mode === "url" ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              <Link size={13} /> Paste URL
            </button>
          </div>

          {mode === "file" ? (
            <div onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragOver ? "border-indigo-400 bg-indigo-50/50" : "border-slate-300 hover:border-indigo-300 hover:bg-slate-50"}`}>
              <ImageIcon size={32} className={`mx-auto mb-2 ${isDragOver ? "text-indigo-500" : "text-slate-400"}`} />
              <p className="text-sm font-semibold text-slate-700">{label}</p>
              <p className="text-xs text-slate-400 mt-1">Click or drag — crop before upload</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleUrlLoad()}
                  placeholder="Paste image URL (e.g. https://example.com/photo.jpg)"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
                <button type="button" onClick={handleUrlLoad} disabled={urlLoading || !urlInput.trim()}
                  className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                  {urlLoading ? <Loader2 size={14} className="animate-spin" /> : <Link size={14} />}
                  {urlLoading ? "Loading..." : "Load"}
                </button>
              </div>
              {urlError && <p className="text-xs text-red-500">{urlError}</p>}
              <p className="text-[11px] text-slate-400">Paste any image URL from the web — it will be proxied through server to avoid CORS issues</p>
            </div>
          )}
        </div>
      )}

      {cropOpen && src && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onMouseUp={handleMouseUp}>
          <div className="bg-white rounded-2xl w-full max-w-[1100px] max-h-[92vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <div className="flex items-center gap-2"><Crop size={18} className="text-indigo-600" /><span className="font-bold text-slate-800 text-sm">Crop & Resize</span></div>
              <span className="text-xs text-slate-400">Drag crop box, scroll to zoom image</span>
            </div>
            <div ref={containerRef}
              className="relative flex-1 overflow-hidden bg-slate-900"
              style={{ minHeight: 550, maxHeight: "750px", cursor: interactionMode ? getCursorForEdge(interactionMode) : "default" }}
              onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
              onWheel={handleWheel}>
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

              {/* Dark overlay with crop hole */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
                {/* Top */}
                <div className="absolute bg-black/50" style={{ top: 0, left: 0, right: 0, height: cropBox.y }} />
                {/* Bottom */}
                <div className="absolute bg-black/50" style={{ bottom: 0, left: 0, right: 0, top: cropBox.y + cropBox.h }} />
                {/* Left */}
                <div className="absolute bg-black/50" style={{ top: cropBox.y, left: 0, width: cropBox.x, height: cropBox.h }} />
                {/* Right */}
                <div className="absolute bg-black/50" style={{ top: cropBox.y, right: 0, left: cropBox.x + cropBox.w, height: cropBox.h }} />
              </div>

              {/* Crop box */}
              <div
                className="absolute border-2 border-white"
                style={{
                  top: cropBox.y, left: cropBox.x, width: cropBox.w, height: cropBox.h,
                  zIndex: 20, cursor: "move",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                }}
                onMouseDown={(e) => handleCropMouseDown(e, "move")}
              >
                {/* Rule of thirds inside crop */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                </div>

                {/* Corner handles */}
                {(["nw", "ne", "sw", "se"] as const).map((corner) => {
                  const isTop = corner.includes("n");
                  const isLeft = corner.includes("w");
                  return (
                    <div key={corner}
                      className="absolute w-3 h-3 bg-white border-2 border-slate-800 rounded-sm"
                      style={{
                        top: isTop ? -6 : undefined, bottom: !isTop ? -6 : undefined,
                        left: isLeft ? -6 : undefined, right: !isLeft ? -6 : undefined,
                        cursor: corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize",
                        zIndex: 25,
                      }}
                      onMouseDown={(e) => handleCropMouseDown(e, corner)}
                    />
                  );
                })}

                {/* Edge handles */}
                {(["n", "s", "e", "w"] as const).map((edge) => {
                  const isVertical = edge === "n" || edge === "s";
                  return (
                    <div key={edge}
                      className="absolute bg-white rounded-sm"
                      style={{
                        ...(isVertical ? {
                          top: edge === "n" ? -4 : undefined,
                          bottom: edge === "s" ? -4 : undefined,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 24,
                          height: 8,
                          cursor: "ns-resize",
                        } : {
                          left: edge === "w" ? -4 : undefined,
                          right: edge === "e" ? -4 : undefined,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 8,
                          height: 24,
                          cursor: "ew-resize",
                        }),
                        zIndex: 25,
                      }}
                      onMouseDown={(e) => handleCropMouseDown(e, edge)}
                    />
                  );
                })}
              </div>
            </div>
            {outputSize && (
              <p className="text-xs text-slate-400 mt-1">
                Output size: {outputSize.w} × {outputSize.h} px
              </p>
            )}
            <div className="flex items-center gap-3 px-5 py-3 border-t border-slate-200 bg-slate-50">

              <p className="text-xs text-slate-400 shrink-0">{imgNatural.w} x {imgNatural.h}px</p>
              <div className="flex items-center gap-2 flex-1">
                <button type="button" onClick={() => setScale(imgScaleRef.current - 0.1)}
                  className="p-1 rounded hover:bg-slate-200 transition-colors"><ZoomOut size={14} className="text-slate-500" /></button>
                <input type="range" min={25} max={500} step={1} value={zoomPercent}
                  onChange={(e) => setScale(parseInt(e.target.value) / 100)}
                  className="flex-1 accent-indigo-600 h-1.5" />
                <button type="button" onClick={() => setScale(imgScaleRef.current + 0.1)}
                  className="p-1 rounded hover:bg-slate-200 transition-colors"><ZoomIn size={14} className="text-slate-500" /></button>
                <span className="text-xs text-slate-400 w-12 text-right shrink-0">{zoomPercent}%</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => { setCropOpen(false); setSrc(null); }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300">Cancel</button>
                <button type="button" onClick={handleApply}
                  className="btn-primary px-4 py-2 text-sm flex items-center gap-1">
                  <Check size={16} /> Apply & Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
