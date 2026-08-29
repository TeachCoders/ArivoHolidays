"use client";

import React from "react";
import StateFormPage from "@/feature/state/components/StateForm";
import { useGetStateById } from "@/feature/state/api/useState";
import PageLoader from "@/components/shared/PageLoader";

export default function EditStatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { state, isLoading } = useGetStateById(Number(id));

  if (isLoading) return <PageLoader size="page" />;
  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">State not found</p>
      </div>
    );
  }

  return <StateFormPage initialData={state} mode="edit" />;
}
