"use client";

import * as Sentry from "@sentry/react";
import React, { useEffect } from "react";
import { initSentry } from "@/lib/sentry";

function Fallback({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Unexpected error occurred";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "sans-serif",
        color: "#1C1C1C",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Something went wrong</h1>
      <p style={{ fontSize: "0.9rem", color: "#555" }}>{message}</p>
    </div>
  );
}

export function SentryErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initSentry();
  }, []);

  return (
    <Sentry.ErrorBoundary fallback={({ error }) => <Fallback error={error} />}>
      {children}
    </Sentry.ErrorBoundary>
  );
}
