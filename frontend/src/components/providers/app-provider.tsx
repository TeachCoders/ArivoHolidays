"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { fetchCsrfToken } from "@/lib/apiClient";

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {

  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          gcTime: 5 * 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
         <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </QueryClientProvider>
  );
}