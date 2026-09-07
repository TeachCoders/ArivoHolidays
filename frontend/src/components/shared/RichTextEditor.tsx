"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Link2,
  Heading1, Heading2, Heading3, Heading4,
  List, ListOrdered, ImagePlus, Undo2, Redo2, Upload,
  Pilcrow, Minus, X, Check, Crop,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

function ToolbarButton({ onClick, active, children, title }: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  const showTip = (e: React.MouseEvent<HTMLButtonElement> | React.FocusEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const flip = r.right > window.innerWidth - 160;
    setTip({ x: flip ? r.left - 8 : r.right + 8, y: r.top + r.height / 2 });
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-label={title}
        onMouseEnter={showTip}
        onMouseLeave={() => setTip(null)}
        onFocus={showTip}
        onBlur={() => setTip(null)}
        className={`p-1.5 rounded transition-colors ${
          active ? "bg-indigo-100 text-brand-primary" : "text-brand-neutral-muted hover:bg-brand-neutral-light hover:text-brand-neutral"
        }`}
      >
        {children}
      </button>
      {tip && createPortal(
        <span
          role="tooltip"
          className="pointer-events-none fixed z-[999] whitespace-nowrap rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-slate-500 shadow-md"
          style={{ left: tip.x, top: tip.y, transform: "translateY(-50%)" }}
        >
          {title}
        </span>,
        document.body
      )}
    </>
  );
}

const EditorShortcuts = Extension.create({
  name: "editorShortcuts",
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-h": () => this.editor.commands.setHorizontalRule(),
      "Mod-Shift-x": () => this.editor.commands.toggleStrike(),
      "Mod-k": () => {
        window.dispatchEvent(new CustomEvent(OPEN_LINK_DIALOG_EVENT));
        return true;
      },
    };
  },
});

const OPEN_LINK_DIALOG_EVENT = "rte:open-link-dialog";

function BubbleButton({ onClick, active, title, children }: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active ? "bg-indigo-100 text-brand-primary" : "text-brand-neutral-muted hover:bg-brand-neutral-light hover:text-brand-neutral"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  content, onChange, placeholder = "Start writing...", className = "", minHeight = "min-h-[120px]",
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkModalUrl, setLinkModalUrl] = useState("");
  const [linkModalNewTab, setLinkModalNewTab] = useState(false);
  const [linkModalRel, setLinkModalRel] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        link: {
          openOnClick: false,
          HTMLAttributes: { target: null, rel: null, class: null },
        },
      }),
      Underline,
      EditorShortcuts,
      TiptapImage.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const attrs = editor.getAttributes("link") as { href?: string; target?: string; rel?: string };
    setLinkModalUrl(attrs.href || "");
    setLinkModalNewTab(attrs.target === "_blank");
    setLinkModalRel(attrs.rel?.includes("noopener noreferrer nofollow") ?? false);
    setLinkModalOpen(true);
  }, [editor]);

  useEffect(() => {
    const handleOpenLinkDialog = () => openLinkModal();
    window.addEventListener(OPEN_LINK_DIALOG_EVENT, handleOpenLinkDialog);
    return () => window.removeEventListener(OPEN_LINK_DIALOG_EVENT, handleOpenLinkDialog);
  }, [openLinkModal]);

  const applyLink = () => {
    if (!editor) return;
    const url = linkModalUrl.trim();
    setLinkModalOpen(false);
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = /^(https?:|mailto:|tel:|#|\/)/i.test(url) ? url : `https://${url}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href,
        target: linkModalNewTab ? "_blank" : null,
        rel: linkModalRel ? "noopener noreferrer nofollow" : null,
      })
      .run();
  };

  const removeLink = () => {
    if (!editor) return;
    setLinkModalOpen(false);
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  };

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

  useEffect(() => {
    if (!cropSrc || !cropOpen) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const container = containerRef.current;
      if (!container) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const newCrop = { x: 0, y: 0, w: cw, h: ch };
      setCropBox(newCrop);
      drawCanvas(img, newCrop);
    };
    img.src = cropSrc;
  }, [cropSrc, cropOpen, drawCanvas]);

  useEffect(() => {
    if (cropBox.w > 0 && imgRef.current) drawCanvas(imgRef.current, cropBox);
  }, [cropBox, drawCanvas]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    setCropBox((prev) => {
      let { x, y, w, h } = prev;
      if (dragType === "move") {
        x = Math.max(0, Math.min(cw - w, x + dx)); y = Math.max(0, Math.min(ch - h, y + dy));
      } else if (dragType === "se") {
        w = Math.max(40, Math.min(cw - x, w + dx)); h = Math.max(40, Math.min(ch - y, h + dy));
      } else if (dragType === "sw") {
        const nw = Math.max(40, Math.min(x + w, w - dx)); x += w - nw; w = nw; h = Math.max(40, Math.min(ch - y, h + dy));
      } else if (dragType === "ne") {
        w = Math.max(40, Math.min(cw - x, w + dx)); const nh = Math.max(40, Math.min(y + h, h - dy)); y += h - nh; h = nh;
      } else if (dragType === "nw") {
        const nw2 = Math.max(40, Math.min(x + w, w - dx)); const nh2 = Math.max(40, Math.min(y + h, h - dy));
        x += w - nw2; y += h - nh2; w = nw2; h = nh2;
      }
      return { x, y, w, h };
    });
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragType, dragStart]);

  const handleMouseUp = useCallback(() => { setIsDragging(false); setDragType(null); }, []);

  const handleMouseDown = (e: React.MouseEvent, type: string) => {
    e.preventDefault(); setIsDragging(true); setDragType(type);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCropSrc(ev.target?.result as string); setCropOpen(true); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleApplyCrop = () => {
    const img = imgRef.current;
    if (!img || !containerRef.current || !editor) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const contRatio = cw / ch;
    let drawW: number, drawH: number, drawX: number, drawY: number;
    if (contRatio > imgRatio) { drawW = cw; drawH = cw / imgRatio; drawX = 0; drawY = (ch - drawH) / 2; }
    else { drawH = ch; drawW = ch * imgRatio; drawX = (cw - drawW) / 2; drawY = 0; }
    const scaleX = img.naturalWidth / drawW; const scaleY = img.naturalHeight / drawH;
    const sx = (cropBox.x - drawX) * scaleX; const sy = (cropBox.y - drawY) * scaleY;
    const sw = cropBox.w * scaleX; const sh = cropBox.h * scaleY;
    let outW = Math.round(sw), outH = Math.round(sh);
    if (outW > 1920) { outH = Math.round((outH / outW) * 1920); outW = 1920; }
    if (outH > 1080) { outW = Math.round((outW / outH) * 1080); outH = 1080; }
    const outCanvas = document.createElement("canvas"); outCanvas.width = outW; outCanvas.height = outH;
    outCanvas.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
    outCanvas.toBlob((blob) => {
      if (!blob) return;
      const r = new FileReader();
      r.onload = () => { editor.chain().focus().setImage({ src: r.result as string }).run(); };
      r.readAsDataURL(blob);
      setCropOpen(false); setCropSrc(null);
    }, "image/jpeg", 0.88);
  };

  const addImageFromUrl = () => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) editor.chain().focus().setImage({ src: url }).run();
  };

  if (!editor) return null;

  return (
    <div className={`border border-brand-neutral-border rounded-lg overflow-hidden bg-white ${className}`}>
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-brand-neutral-border bg-brand-neutral-light flex-wrap">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)"><Bold size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)"><Italic size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)"><UnderlineIcon size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough (Ctrl+Shift+X)"><Strikethrough size={14} /></ToolbarButton>
        <ToolbarButton onClick={openLinkModal} active={editor.isActive("link")} title="Link (Ctrl+K)"><Link2 size={14} /></ToolbarButton>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1 (Ctrl+Alt+1)"><Heading1 size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2 (Ctrl+Alt+2)"><Heading2 size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3 (Ctrl+Alt+3)"><Heading3 size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive("heading", { level: 4 })} title="Heading 4 (Ctrl+Alt+4)"><Heading4 size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph") && !editor.isActive("heading")} title="Paragraph (Ctrl+Alt+0)"><Pilcrow size={14} /></ToolbarButton>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List (Ctrl+Shift+8)"><List size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List (Ctrl+Shift+7)"><ListOrdered size={14} /></ToolbarButton>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Upload Image (with crop)"><Upload size={14} /></ToolbarButton>
        <ToolbarButton onClick={addImageFromUrl} title="Insert Image from URL"><ImagePlus size={14} /></ToolbarButton>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Line (Ctrl+Alt+H)"><Minus size={14} /></ToolbarButton>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)"><Undo2 size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Shift+Z)"><Redo2 size={14} /></ToolbarButton>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <EditorContent editor={editor} className={`rte-editor ${minHeight}`} />

      <BubbleMenu editor={editor} options={{ placement: "top" }} className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white px-1.5 py-1 shadow-xl">
        <BubbleButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)"><Bold size={14} /></BubbleButton>
        <BubbleButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)"><Italic size={14} /></BubbleButton>
        <BubbleButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)"><UnderlineIcon size={14} /></BubbleButton>
        <BubbleButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough (Ctrl+Shift+X)"><Strikethrough size={14} /></BubbleButton>
        <BubbleButton onClick={openLinkModal} active={editor.isActive("link")} title="Link (Ctrl+K)"><Link2 size={14} /></BubbleButton>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <BubbleButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2 (Ctrl+Alt+2)"><Heading2 size={14} /></BubbleButton>
        <BubbleButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3 (Ctrl+Alt+3)"><Heading3 size={14} /></BubbleButton>
        <BubbleButton onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph") && !editor.isActive("heading")} title="Paragraph (Ctrl+Alt+0)"><Pilcrow size={14} /></BubbleButton>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <BubbleButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List (Ctrl+Shift+8)"><List size={14} /></BubbleButton>
        <BubbleButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List (Ctrl+Shift+7)"><ListOrdered size={14} /></BubbleButton>
      </BubbleMenu>

      {linkModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setLinkModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-neutral-border">
              <div className="flex items-center gap-2">
                <Link2 size={18} className="text-brand-primary" />
                <span className="font-bold text-brand-neutral-dark text-sm">Link</span>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                aria-label="Close link dialog"
                className="p-1 rounded text-brand-neutral-muted hover:bg-brand-neutral-light hover:text-brand-neutral transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-brand-neutral-muted mb-1.5">
                  URL
                </label>
                <input
                  autoFocus
                  type="text"
                  value={linkModalUrl}
                  onChange={(e) => setLinkModalUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyLink()}
                  placeholder="https://example.com ya /tour-packages/india/rajasthan"
                  className="w-full rounded-lg border border-brand-neutral-border bg-brand-neutral-light/50 px-3 py-2 text-sm text-brand-neutral-dark placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Apne page ke link ke liye relative path (jaise /about-us) likhen — rel/target nahi lagta.
                </p>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={linkModalNewTab}
                  onChange={(e) => setLinkModalNewTab(e.target.checked)}
                  className="mt-0.5 accent-brand-primary"
                />
                <span className="text-sm text-brand-neutral leading-snug">
                  Open in a new tab{" "}
                  <code className="text-[11px] bg-brand-neutral-light px-1 rounded">
                    {"target=\"_blank\""}
                  </code>
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={linkModalRel}
                  onChange={(e) => setLinkModalRel(e.target.checked)}
                  className="mt-0.5 accent-brand-primary"
                />
                <span className="text-sm text-brand-neutral leading-snug">
                  External link — add{" "}
                  <code className="text-[11px] bg-brand-neutral-light px-1 rounded">
                    {"rel=\"noopener noreferrer nofollow\""}
                  </code>
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-brand-neutral-border bg-brand-neutral-light rounded-b-2xl gap-2">
              <button
                type="button"
                onClick={removeLink}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Remove Link
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-brand-neutral bg-slate-200 hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyLink}
                  className="btn-primary px-4 py-2 text-sm flex items-center gap-1 shadow"
                >
                  <Check size={16} /> Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cropOpen && cropSrc && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onMouseUp={handleMouseUp}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-brand-neutral-border">
              <div className="flex items-center gap-2">
                <Crop size={18} className="text-brand-primary" />
                <span className="font-bold text-brand-neutral-dark text-sm">Crop Image</span>
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
            <div className="flex items-center justify-end px-5 py-3 border-t border-brand-neutral-border bg-brand-neutral-light rounded-b-2xl gap-2">
              <button type="button" onClick={() => { setCropOpen(false); setCropSrc(null); }}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-brand-neutral bg-slate-200 hover:bg-slate-300">Cancel</button>
              <button type="button" onClick={handleApplyCrop}
                className="btn-primary px-4 py-2 text-sm flex items-center gap-1 shadow">
                <Check size={16} /> Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .rte-editor .tiptap { outline: none; padding: 12px; min-height: inherit; }
        .rte-editor .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #94a3b8; pointer-events: none; height: 0; }
        .rte-editor .tiptap h1 { font-size: 1.5rem; font-weight: 700; margin: 0.75rem 0 0.5rem 0; color: #1e293b; }
        .rte-editor .tiptap h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.5rem 0; color: #1e293b; }
        .rte-editor .tiptap h3 { font-size: 1.1rem; font-weight: 700; margin: 0.75rem 0 0.5rem 0; color: #1e293b; }
        .rte-editor .tiptap h4 { font-size: 1rem; font-weight: 700; margin: 0.75rem 0 0.5rem 0; color: #1e293b; }
        .rte-editor .tiptap p { margin: 0.25rem 0; line-height: 1.6; color: #334155; }
        .rte-editor .tiptap ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .rte-editor .tiptap ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .rte-editor .tiptap li { margin: 0.15rem 0; line-height: 1.5; color: #334155; }
        .rte-editor .tiptap ul li { list-style-type: disc; }
        .rte-editor .tiptap ol li { list-style-type: decimal; }
        .rte-editor .tiptap ul li p, .rte-editor .tiptap ol li p { margin: 0; }
        .rte-editor .tiptap img { max-width: 100%; height: auto; border-radius: 8px; margin: 0.75rem 0; border: 1px solid #e2e8f0; }
        .rte-editor .tiptap strong { font-weight: 700; color: #0f172a; }
        .rte-editor .tiptap em { font-style: italic; }
        .rte-editor .tiptap u { text-decoration: underline; }
        .rte-editor .tiptap s { text-decoration: line-through; }
        .rte-editor .tiptap a { color: #2563eb; text-decoration: underline; }
        .rte-editor .tiptap blockquote { border-left: 3px solid #6366f1; padding-left: 1rem; margin: 0.5rem 0; color: #64748b; font-style: italic; }
        .rte-editor .tiptap hr { border: none; border-top: 2px solid #e2e8f0; margin: 1rem 0; }
      `}</style>
    </div>
  );
}
