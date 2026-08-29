"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const travelMessages = [
  "Boarding your trip...",
  "Packing your itinerary...",
  "Charting the route...",
  "Taking off...",
  "Cruising to your destination...",
];

interface PageLoaderProps {
  text?: string;
  size?: "page" | "section" | "sm" | "inline";
  className?: string;
}

function FlightLoader({ text }: { text?: string }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % travelMessages.length);
    }, 1200);
    const progTimer = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 95));
    }, 200);
    return () => {
      clearInterval(msgTimer);
      clearInterval(progTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-48 h-20">
        <div className="absolute top-0 left-4 animate-[floatCloud_3s_ease-in-out_infinite]">
          <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
            <ellipse cx="20" cy="12" rx="18" ry="8" fill="#e2e8f0" />
            <ellipse cx="10" cy="10" rx="10" ry="7" fill="#f1f5f9" />
            <ellipse cx="30" cy="10" rx="12" ry="6" fill="#f1f5f9" />
          </svg>
        </div>
        <div className="absolute top-2 right-2 animate-[floatCloud_4s_ease-in-out_infinite_0.5s]">
          <svg width="30" height="14" viewBox="0 0 30 14" fill="none">
            <ellipse cx="15" cy="8" rx="13" ry="6" fill="#e2e8f0" />
            <ellipse cx="8" cy="7" rx="8" ry="5" fill="#f1f5f9" />
          </svg>
        </div>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 animate-[flyPlane_2s_ease-in-out_infinite]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
          </svg>
        </div>
        <div className="absolute top-8 left-8 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-brand-primary/30 animate-[trailDot_1.5s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>

      <div className="w-48 h-1 bg-brand-neutral-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-primary to-brand-info rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm font-medium text-brand-neutral-muted animate-pulse">
        {text || travelMessages[msgIndex]}
      </p>

      <style jsx>{`
        @keyframes flyPlane {
          0%, 100% { transform: translate(-50%, 0) rotate(-2deg); }
          50% { transform: translate(-50%, -6px) rotate(2deg); }
        }
        @keyframes floatCloud {
          0%, 100% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(12px); opacity: 1; }
        }
        @keyframes trailDot {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}

export default function PageLoader({ text, size = "section", className = "" }: PageLoaderProps) {
  if (size === "inline") {
    return <Loader2 className={`h-4 w-4 animate-spin text-brand-600 ${className}`} />;
  }

  const wrapperClass = size === "page" ? "min-h-screen" : size === "sm" ? "py-8" : "min-h-[400px]";

  return (
    <div className={`flex items-center justify-center ${wrapperClass} ${className}`}>
      <FlightLoader text={text} />
    </div>
  );
}
