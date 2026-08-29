"use client";

import { useState } from "react";
import {
  GripVertical,
  X,
  Heart,
  Users,
  TreePine,
  Church,
  Sparkles,
  Landmark,
  Building,
  Mountain,
  Waves,
  Camera,
  UtensilsCrossed,
  ShoppingBag,
  Baby,
  Castle,
  Compass,
} from "lucide-react";
import type { ReactNode } from "react";

// Custom SVG Icons


export function travelExperienceIcon(title: string, customClass: string = "w-3 h-3"): ReactNode {
  const lower = title.toLowerCase();
  const p = { 
    viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", 
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: customClass 
  };

  if (lower.includes("honeymoon") || lower.includes("romantic")) return (
    <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
  ); // Heart
  if (lower.includes("wildlife") || lower.includes("safari")) return (
    <svg {...p}><path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.5 7C4.1 7 3 8.1 3 9.5S4.1 12 5.5 12 8 10.9 8 9.5 6.9 7 5.5 7zM18.5 7c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5S19.9 7 18.5 7zM12 2C10.6 2 9.5 3.1 9.5 4.5S10.6 7 12 7s2.5-1.1 2.5-2.5S13.4 2 12 2z"/><path d="M10 18c-2.2 0-4-1.8-4-4 0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2 0 2.2-1.8 4-4 4h-4z" /></svg>
  ); // Paw Print
  if (lower.includes("beach") || lower.includes("lake")) return (
    <svg {...p}><path d="M2 12h20" /><path d="M6 12v-2a6 6 0 0 1 12 0v2" /><path d="M12 10v-6" /><path d="M2 16h20" /><path d="M2 20h20" /></svg>
  ); // Beach/Waves
  if (lower.includes("ayurveda") || lower.includes("yoga")) return (
    <svg {...p}><path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z"/><path d="M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/><path d="M8 8a4 4 0 0 1 8 0M8 16a4 4 0 0 0 8 0" /></svg>
  ); // Lotus
  if (lower.includes("spiritual") || lower.includes("pilgrimage")) return (
    <svg {...p}><path d="M12 2v20" /><path d="M5 10h14" /><path d="M8 5l4-3 4 3" /></svg>
  ); // Temple Spire
  if (lower.includes("heritage") || lower.includes("culture") || lower.includes("taj")) return (
    <svg {...p}><path d="M3 21h18" /><path d="M5 21v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" /><path d="M12 15v-6" /><path d="M8 9a4 4 0 0 1 8 0" /></svg>
  ); // Taj Dome
  if (lower.includes("desert")) return (
    <svg {...p}><path d="M2 18h20" /><path d="M8 18V9a2 2 0 0 1 4 0v9" /><path d="M16 18v-5a2 2 0 0 0-4 0" /></svg>
  ); // Cactus
  if (lower.includes("hill") || lower.includes("mountain")) return (
    <svg {...p}><path d="M8 3l4 8 5-5 5 15H2L8 3z" /></svg>
  ); // Mountain
  if (lower.includes("golden") || lower.includes("triangle")) return (
    <svg {...p}><path d="M12 2L2 22h20L12 2z" /><path d="M12 2v20" /></svg>
  ); // Triangle
  if (lower.includes("family")) return (
    <svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ); // Family
  
  return (
    <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
  ); // Star
}

interface TravelExperiencePillsProps {
  items: { id?: number; title: string }[];
  onRemove?: (id: number) => void;
  max?: number;
  onReorder?: (fromId: number, toId: number) => void;
}

export default function TravelExperiencePills({
  items,
  onRemove,
  max = 6,
  onReorder,
}: TravelExperiencePillsProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  if (!items.length) return null;
  const visible = items.slice(0, max);
  const extra = items.length - visible.length;

  const move = (fromIdx: number, toIdx: number) => {
    if (!onReorder || fromIdx === toIdx) return;
    const from = visible[fromIdx];
    const to = visible[toIdx];
    if (from?.id === undefined || to?.id === undefined) return;
    onReorder(from.id, to.id);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((item, idx) => (
        <span
          key={item.id ?? item.title}
          onDragOver={(e) => {
            if (onReorder && dragIdx !== null) e.preventDefault();
          }}
          onDrop={() => {
            if (dragIdx !== null) {
              move(dragIdx, idx);
              setDragIdx(null);
            }
          }}
          className={`inline-flex items-center gap-1 rounded-full bg-[#2E8B8B] text-white text-xs font-semibold px-2.5 py-1 ${
            dragIdx === idx ? "opacity-50" : ""
          }`}
        >
          {onReorder && item.id !== undefined && (
            <span
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", String(item.id));
                setDragIdx(idx);
              }}
              onDragEnd={() => setDragIdx(null)}
              title="Drag to reorder"
              className="shrink-0 flex items-center justify-center cursor-grab text-white/70 hover:text-white active:cursor-grabbing"
            >
              <GripVertical size={11} />
            </span>
          )}
          <span className="shrink-0">{idx + 1}.</span>
          {travelExperienceIcon(item.title)}
          <span className="truncate">{item.title}</span>
          {onRemove && item.id !== undefined && (
            <button
              type="button"
              onClick={() => onRemove(item.id!)}
              className="ml-0.5 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label={`Remove ${item.title}`}
            >
              <X size={12} />
            </button>
          )}
        </span>
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center rounded-full bg-[#2E8B8B]/80 text-white text-xs font-semibold px-2.5 py-1">
          +{extra}
        </span>
      )}
    </div>
  );
}
