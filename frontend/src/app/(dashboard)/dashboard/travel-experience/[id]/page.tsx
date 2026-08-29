"use client";

import React from "react";
import TravelExperienceFormPage from "@/feature/travelExperience/components/TravelExperienceForm";
import { useGetTravelExperienceById } from "@/feature/travelExperience/api/useTravelExperience";
import PageLoader from "@/components/shared/PageLoader";

export default function EditTravelExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { travelExperience, isLoading } = useGetTravelExperienceById(Number(id));

  if (isLoading) return <PageLoader size="page" />;
  if (!travelExperience) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">Travel Experience not found</p>
      </div>
    );
  }

  return <TravelExperienceFormPage initialData={travelExperience} mode="edit" />;
}
