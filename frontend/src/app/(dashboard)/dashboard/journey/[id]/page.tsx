"use client";

import React from "react";
import JourneyFormPage from "@/feature/journey/components/JourneyForm";
import { useGetJourneyById } from "@/feature/journey/api/useJourney";
import PageLoader from "@/components/shared/PageLoader";

export default function EditJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { journey, isLoading } = useGetJourneyById(Number(id));

  if (isLoading) return <PageLoader size="page" />;
  if (!journey) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">Journey not found</p>
      </div>
    );
  }

  return <JourneyFormPage initialData={journey} mode="edit" />;
}
