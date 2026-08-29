"use client";

import React from "react";
import CmsPageForm from "@/feature/cms/components/CmsPageForm";
import { useGetCmsPageById } from "@/feature/cms/api/useCmsPage";
import PageLoader from "@/components/shared/PageLoader";

export default function EditCmsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { cmsPage, isLoading } = useGetCmsPageById(Number(id));

  if (isLoading) return <PageLoader size="page" />;
  if (!cmsPage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">Page not found</p>
      </div>
    );
  }

  return <CmsPageForm initialData={cmsPage} mode="edit" />;
}
