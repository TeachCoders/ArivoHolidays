"use client";

import { useEffect } from "react";
import Link from "next/link";
import { queueNotFound } from "@/lib/analyticsNotFoundBuffer";

export default function NotFound() {
  // Let the analytics tracker know the visitor landed on a broken URL.
  useEffect(() => {
    queueNotFound();
    window.dispatchEvent(new CustomEvent("analytics:notfound"));
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-[#2E8B8B] text-sm font-bold uppercase tracking-widest mb-3">404</p>
      <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-[#1C1C1C]">
        Page Not Found
      </h1>
      <p className="mt-4 max-w-md text-[#555] text-base leading-relaxed">
        The page you are looking for doesn&apos;t exist or may have been moved. Explore our
        destinations and tour packages instead.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="btn-primary px-6 py-3 text-sm font-semibold"
        >
          Back to Home
        </Link>
        <Link
          href="/tour-packages"
          className="btn-outline px-6 py-3 text-sm font-semibold"
        >
          Explore Destinations
        </Link>
      </div>
    </div>
  );
}
