"use client";

import React from "react";
import CityFormPage from "@/feature/city/components/CityForm";
import { useGetCityById } from "@/feature/city/api/useCity";
import PageLoader from "@/components/shared/PageLoader";

export default function EditCityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { city, isLoading } = useGetCityById(Number(id));

  if (isLoading) return <PageLoader size="page" />;
  if (!city) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">City not found</p>
      </div>
    );
  }

  return <CityFormPage initialData={city} mode="edit" />;
}
