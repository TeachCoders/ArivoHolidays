"use client";

import React from "react";
import CountryFormPage from "@/feature/country/components/CountryForm";
import { useGetCountryById } from "@/feature/country/api/useCountry";
import PageLoader from "@/components/shared/PageLoader";

export default function EditCountryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { country, isLoading } = useGetCountryById(Number(id));

  if (isLoading) return <PageLoader size="page" />;
  if (!country) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">Country not found</p>
      </div>
    );
  }

  return <CountryFormPage initialData={country} mode="edit" />;
}
