"use client";

import React from "react";
import { useParams } from "next/navigation";
import AdLandingPageForm from "@/feature/landing/components/AdLandingPageForm";
import { useGetAdLandingPageById } from "@/feature/landing/api/useAdLandingPage";
import PageLoader from "@/components/shared/PageLoader";

export default function EditAdLandingPage() {
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;
  const { page, isLoading } = useGetAdLandingPageById(id);

  if (isLoading) return <PageLoader size="page" />;
  if (!page) return <div className="p-10 text-center text-slate-500 font-medium">Page not found</div>;

  return <AdLandingPageForm mode="edit" initialData={page} />;
}
