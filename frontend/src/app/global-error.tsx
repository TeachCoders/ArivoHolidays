"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-white text-[#1C1C1C] antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="text-[#D4561A] text-sm font-bold uppercase tracking-widest mb-3">
            Critical Error
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Something went wrong
          </h1>
          <p className="mt-4 max-w-md text-[#555] text-base leading-relaxed">
            The application encountered a critical error. Please try refreshing
            the page or contact support if the problem persists.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={reset}
              className="rounded-lg bg-[#2E8B8B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#247070] transition-colors"
            >
              Try Again
            </button>
            <a
              href="/"
              className="rounded-lg border border-[#2E8B8B] px-6 py-3 text-sm font-semibold text-[#2E8B8B] hover:bg-[#2E8B8B]/5 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
