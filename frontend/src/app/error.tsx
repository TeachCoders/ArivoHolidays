"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-[#D4561A] text-sm font-bold uppercase tracking-widest mb-3">
        Something went wrong
      </p>
      <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-[#1C1C1C]">
        Unexpected Error
      </h1>
      <p className="mt-4 max-w-md text-[#555] text-base leading-relaxed">
        An unexpected error occurred while loading this page. Please try again or contact our
        travel experts for assistance.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={reset}
          className="btn-primary px-6 py-3 text-sm font-semibold"
        >
          Try Again
        </button>
        <Link href="/" className="btn-outline px-6 py-3 text-sm font-semibold">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
