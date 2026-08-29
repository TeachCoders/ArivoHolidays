"use client";

import React from "react";
import SeasonFormPage from "@/feature/season/components/SeasonForm";
import { useGetSeasonById } from "@/feature/season/api/useSeason";
import PageLoader from "@/components/shared/PageLoader";

export default function EditSeasonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { season, isLoading } = useGetSeasonById(Number(id));

  if (isLoading) return <PageLoader size="page" />;
  if (!season) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">Season not found</p>
      </div>
    );
  }

  return <SeasonFormPage initialData={season} mode="edit" />;
}
